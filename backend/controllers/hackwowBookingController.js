/**
 * Hackwow Booking Controller
 * 
 * This controller handles booking operations through Hackwow Unified Booking Service.
 * 
 * WHAT CHANGED:
 * - reserveSeat() → Calls Hackwow API (Redis lock)
 * - createRazorpayOrder() → Calls Hackwow API (idempotent order)
 * - confirmPayment() → Calls Hackwow API (signature verification + booking)
 * - releaseReservation() → Calls Hackwow API (release lock)
 * 
 * WHAT STAYS THE SAME:
 * - getMyBookings() → Uses local DB + Hackwow sync
 * - cancelBooking() → Uses local DB + Hackwow notification
 * - All other schedule/bus/route logic → Unchanged
 * 
 * INTEGRATION FLOW:
 * 1. User selects seat → Frontend calls /api/bookings/reserve
 * 2. Reserve returns { reservationToken, expiresAt } → 2 minute lock
 * 3. Frontend shows Razorpay checkout
 * 4. User pays → Razorpay callback
 * 5. Frontend calls /api/bookings/confirm → Booking confirmed
 */

const hackwowClient = require('../services/hackwowClient');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const SeatAvailability = require('../models/SeatAvailability');
const { sendBookingConfirmationEmail } = require('../services/emailService');

// Store active reservations (in-memory cache)
// In production, use Redis or database
const activeReservations = new Map();

/**
 * @desc    Reserve seat (Step 1 of booking)
 * @route   POST /api/bookings/reserve
 * @access  Private
 * 
 * DELEGATES TO: Hackwow /reserve-seat
 */
exports.reserveSeat = async (req, res, next) => {
  try {
    const { scheduleId, journeyDate, seatNumber } = req.body;

    // Validate input
    if (!scheduleId || !journeyDate || !seatNumber) {
      return res.status(400).json({
        success: false,
        message: 'scheduleId, journeyDate, and seatNumber are required'
      });
    }

    // Get schedule details (for price)
    const schedule = await Schedule.findById(scheduleId)
      .populate('route')
      .populate('bus');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Generate entity ID for Hackwow
    const entityId = hackwowClient.constructor.generateEntityId(scheduleId, journeyDate);

    // Set external user info for Hackwow (uses Bus Ticketing's user)
    // This allows booking without requiring Hackwow registration
    hackwowClient.setExternalUser(req.user);

    // Get the Hackwow seat ID for this seat
    // The seats were auto-synced when the user loaded the seat layout
    let hackwowSeatId;
    try {
      // Query Hackwow for the seat to get its _id
      const response = await hackwowClient.getAvailableSeats(entityId);
      
      // Handle different response structures
      const seatsList = response.seats || response.data?.seats || response;
      
      if (!Array.isArray(seatsList)) {
        console.error('[Booking] Invalid seats response:', response);
        return res.status(500).json({
          success: false,
          message: 'Invalid response from booking service'
        });
      }
      
      const seat = seatsList.find(s => s.seatNumber === seatNumber.toString());
      
      if (!seat) {
        return res.status(400).json({
          success: false,
          message: 'Seat not found in Hackwow. Please refresh and try again.'
        });
      }
      
      hackwowSeatId = seat._id;
      console.log(`[Booking] Found Hackwow seat: ${hackwowSeatId} for seat ${seatNumber}`);
      console.log(`[Booking] Seat details:`, JSON.stringify(seat, null, 2));
    } catch (seatError) {
      console.error('[Booking] Failed to get Hackwow seat:', seatError);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve seat information from booking service'
      });
    }
    
    // Call Hackwow to reserve the seat using the Hackwow seat _id
    console.log(`[Booking] Attempting to reserve seat with ID: ${hackwowSeatId}`);
    const reservation = await hackwowClient.reserveSeat(hackwowSeatId);
    console.log(`[Booking] Hackwow reservation response:`, JSON.stringify(reservation, null, 2));

    // Extract the actual reservation data from Hackwow's response
    // Hackwow returns: { success, message, data: { reservationToken, expiresAt, ... }, timestamp }
    const reservationData = reservation.data || reservation;
    const reservationToken = reservationData.reservationToken;

    if (!reservationToken) {
      console.error('[Booking] No reservationToken in response:', reservation);
      return res.status(500).json({
        success: false,
        message: 'Failed to get reservation token from booking service'
      });
    }

    // Store reservation locally for reference
    activeReservations.set(reservationToken, {
      scheduleId,
      journeyDate,
      seatNumber,
      fare: schedule.fare,
      userId: req.user._id,
      expiresAt: reservationData.expiresAt
    });

    res.status(200).json({
      success: true,
      message: 'Seat reserved for 2 minutes',
      // Expose reservationToken at top level for convenience
      reservationToken: reservationToken,
      data: {
        reservationToken: reservationToken,
        expiresAt: reservationData.expiresAt,
        ttl: reservationData.ttl || 120,
        seat: {
          seatNumber,
          fare: schedule.fare
        },
        schedule: {
          id: scheduleId,
          route: schedule.route,
          departureTime: schedule.departureTime
        }
      }
    });

  } catch (error) {
    // Handle Hackwow-specific errors
    if (error.isHackwowError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
        source: 'hackwow'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create Razorpay order (Step 2 of booking)
 * @route   POST /api/bookings/create-order
 * @access  Private
 * 
 * DELEGATES TO: Hackwow /create-order
 */
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { reservationToken } = req.body;

    console.log('[Booking] Create order request:', { reservationToken, user: req.user._id });

    if (!reservationToken) {
      return res.status(400).json({
        success: false,
        message: 'Reservation token is required'
      });
    }

    // Get local reservation data
    const localReservation = activeReservations.get(reservationToken);
    
    console.log('[Booking] Local reservation found:', localReservation ? 'YES' : 'NO');
    
    if (!localReservation) {
      console.log('[Booking] Active reservations:', Array.from(activeReservations.keys()));
      return res.status(404).json({
        success: false,
        message: 'Reservation not found or expired'
      });
    }

    // Set external user info for Hackwow
    hackwowClient.setExternalUser(req.user);

    console.log('[Booking] Calling Hackwow createRazorpayOrder with:', {
      reservationToken,
      amount: localReservation.fare,
      metadata: {
        scheduleId: localReservation.scheduleId,
        journeyDate: localReservation.journeyDate,
        seatNumber: localReservation.seatNumber,
        userId: localReservation.userId.toString()
      }
    });

    // Create Razorpay order via Hackwow
    const order = await hackwowClient.createRazorpayOrder(
      reservationToken,
      localReservation.fare,
      {
        scheduleId: localReservation.scheduleId,
        journeyDate: localReservation.journeyDate,
        seatNumber: localReservation.seatNumber,
        userId: localReservation.userId.toString()
      }
    );

    console.log('[Booking] Hackwow order response:', JSON.stringify(order, null, 2));

    // Extract the actual order data from Hackwow's response
    // Hackwow returns: { success, message, data: { orderId, amount, currency, keyId, ... }, timestamp }
    const orderData = order.data || order;

    if (!orderData.orderId || !orderData.keyId) {
      console.error('[Booking] Invalid order data:', order);
      return res.status(500).json({
        success: false,
        message: 'Failed to get order details from booking service'
      });
    }

    res.status(200).json({
      success: true,
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: orderData.keyId, // Razorpay key at top level
      data: {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.keyId,
        reservationToken
      }
    });

  } catch (error) {
    if (error.isHackwowError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
        source: 'hackwow'
      });
    }
    next(error);
  }
};

/**
 * @desc    Confirm booking after payment (Step 3 of booking)
 * @route   POST /api/bookings/confirm
 * @access  Private
 * 
 * DELEGATES TO: Hackwow /confirm-booking
 * 
 * This is the CRITICAL endpoint that:
 * 1. Verifies Razorpay signature
 * 2. Finalizes booking in Hackwow
 * 3. Creates local booking record
 * 4. Updates seat availability
 */
exports.confirmBooking = async (req, res, next) => {
  try {
    const { 
      reservationToken,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      passengerDetails
    } = req.body;

    // Validate required fields
    if (!reservationToken || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    if (!passengerDetails?.name || !passengerDetails?.email || !passengerDetails?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Passenger details are required'
      });
    }

    // Get local reservation data
    const localReservation = activeReservations.get(reservationToken);
    
    if (!localReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found or expired'
      });
    }

    // Set external user info for Hackwow
    hackwowClient.setExternalUser(req.user);

    console.log('[Booking] Confirming booking with Hackwow:', {
      reservationToken,
      razorpay_order_id,
      razorpay_payment_id
    });

    // Confirm booking via Hackwow (includes Razorpay signature verification)
    const hackwowBooking = await hackwowClient.confirmBooking({
      reservationToken,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    console.log('[Booking] Hackwow confirmation response:', JSON.stringify(hackwowBooking, null, 2));

    // Extract the actual booking data from Hackwow's response
    // Hackwow returns: { success, message, data: { bookingId, booking, seat }, timestamp }
    const bookingData = hackwowBooking.data || hackwowBooking;

    if (!bookingData.bookingId) {
      console.error('[Booking] No bookingId in Hackwow response:', hackwowBooking);
      return res.status(500).json({
        success: false,
        message: 'Failed to confirm booking with booking service'
      });
    }

    // ====================================
    // CREATE LOCAL BOOKING RECORD
    // (For backward compatibility with existing system)
    // ====================================

    const schedule = await Schedule.findById(localReservation.scheduleId)
      .populate('route')
      .populate('bus');

    // Generate local booking ID
    const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create local booking
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      schedule: localReservation.scheduleId,
      route: schedule.route._id,
      bus: schedule.bus._id,
      journeyDate: new Date(localReservation.journeyDate),
      seats: [{
        seatNumber: localReservation.seatNumber,
        fare: localReservation.fare
      }],
      totalFare: localReservation.fare,
      passengerDetails,
      status: 'confirmed',
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      hackwowBookingId: bookingData.bookingId // Link to Hackwow booking
    });

    // Update seat availability
    const journeyDate = new Date(localReservation.journeyDate);
    const startOfDay = new Date(journeyDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(journeyDate.setHours(23, 59, 59, 999));

    let seatAvailability = await SeatAvailability.findOne({
      schedule: localReservation.scheduleId,
      journeyDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (!seatAvailability) {
      seatAvailability = await SeatAvailability.create({
        schedule: localReservation.scheduleId,
        journeyDate: new Date(localReservation.journeyDate),
        bookedSeats: [{
          seatNumber: localReservation.seatNumber,
          booking: booking._id
        }]
      });
    } else {
      seatAvailability.bookedSeats.push({
        seatNumber: localReservation.seatNumber,
        booking: booking._id
      });
      await seatAvailability.save();
    }

    // Clean up local reservation cache
    activeReservations.delete(reservationToken);

    // Populate booking for response
    await booking.populate(['route', 'bus', 'schedule']);

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(booking, passengerDetails);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking,
        hackwowBookingId: bookingData.bookingId
      }
    });

  } catch (error) {
    if (error.isHackwowError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
        source: 'hackwow'
      });
    }
    next(error);
  }
};

/**
 * @desc    Release seat reservation (cancel before payment)
 * @route   POST /api/bookings/release
 * @access  Private
 * 
 * DELEGATES TO: Hackwow /release-seat
 */
exports.releaseReservation = async (req, res, next) => {
  try {
    const { reservationToken } = req.body;

    if (!reservationToken) {
      return res.status(400).json({
        success: false,
        message: 'Reservation token is required'
      });
    }

    // Set external user info for Hackwow
    hackwowClient.setExternalUser(req.user);

    // Release via Hackwow
    await hackwowClient.releaseSeat(reservationToken);

    // Clean up local cache
    activeReservations.delete(reservationToken);

    res.status(200).json({
      success: true,
      message: 'Reservation released successfully'
    });

  } catch (error) {
    if (error.isHackwowError) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.message,
        source: 'hackwow'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get user's bookings (from local DB)
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 * 
 * Uses LOCAL database (no change from original)
 */
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('route', 'from to distance duration')
      .populate('bus', 'busName busNumber busType')
      .populate('schedule', 'departureTime arrivalTime')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 * 
 * Uses LOCAL database (no change from original)
 */
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('route', 'from to distance duration')
      .populate('bus', 'busName busNumber busType totalSeats')
      .populate({
        path: 'schedule',
        select: 'departureTime arrivalTime fare',
        populate: [
          { path: 'route', select: 'from to distance duration' },
          { path: 'bus', select: 'busName busNumber busType totalSeats' }
        ]
      })
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    console.log('[BOOKING] Fetched booking details:', {
      bookingId: booking.bookingId,
      seats: booking.seats,
      totalFare: booking.totalFare,
      journeyDate: booking.journeyDate,
      paymentId: booking.paymentId
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 * 
 * Uses LOCAL database + notifies Hackwow (for refund if needed)
 */
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update local booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Remove from seat availability
    const journeyDate = new Date(booking.journeyDate);
    const seatAvailability = await SeatAvailability.findOne({
      schedule: booking.schedule,
      journeyDate: {
        $gte: new Date(journeyDate.setHours(0, 0, 0, 0)),
        $lt: new Date(journeyDate.setHours(23, 59, 59, 999))
      }
    });

    if (seatAvailability) {
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      seatAvailability.bookedSeats = seatAvailability.bookedSeats.filter(
        s => !seatNumbers.includes(s.seatNumber)
      );
      await seatAvailability.save();
    }

    // TODO: Notify Hackwow for refund processing
    // hackwowClient.cancelBooking(booking.hackwowBookingId);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (Admin)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('route', 'from to')
      .populate('bus', 'busName busNumber')
      .populate('schedule', 'departureTime arrivalTime')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};
