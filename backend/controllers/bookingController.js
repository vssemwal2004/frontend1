const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const SeatAvailability = require('../models/SeatAvailability');
const { sendBookingConfirmationEmail } = require('../services/emailService');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { scheduleId, journeyDate, seats, passengerDetails } = req.body;

    // Validate input
    if (!scheduleId || !journeyDate || !seats || seats.length === 0 || !passengerDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get schedule details
    const schedule = await Schedule.findById(scheduleId)
      .populate('route')
      .populate('bus');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Parse journey date
    const bookingDate = new Date(journeyDate);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    // Check seat availability
    let seatAvailability = await SeatAvailability.findOne({
      schedule: scheduleId,
      journeyDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    // Extract seat numbers from request
    const requestedSeats = seats.map(s => s.seatNumber || s);

    // Check if any requested seats are already booked
    if (seatAvailability) {
      const bookedSeatNumbers = seatAvailability.bookedSeats.map(s => s.seatNumber);
      const alreadyBooked = requestedSeats.filter(seat => bookedSeatNumbers.includes(seat));

      if (alreadyBooked.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Seats ${alreadyBooked.join(', ')} are already booked`
        });
      }
    }

    // Calculate total fare
    const farePerSeat = schedule.fare;
    const totalFare = farePerSeat * requestedSeats.length;

    // Prepare seats data
    const seatsData = requestedSeats.map(seatNumber => ({
      seatNumber,
      fare: farePerSeat
    }));

    // Generate unique booking ID
    const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create booking
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      schedule: scheduleId,
      route: schedule.route._id,
      bus: schedule.bus._id,
      journeyDate: new Date(journeyDate),
      seats: seatsData,
      totalFare,
      passengerDetails,
      status: 'confirmed',
      paymentStatus: 'completed'
    });

    // Update or create seat availability
    if (!seatAvailability) {
      seatAvailability = await SeatAvailability.create({
        schedule: scheduleId,
        journeyDate: new Date(journeyDate),
        bookedSeats: requestedSeats.map(seatNumber => ({
          seatNumber,
          booking: booking._id
        }))
      });
    } else {
      seatAvailability.bookedSeats.push(
        ...requestedSeats.map(seatNumber => ({
          seatNumber,
          booking: booking._id
        }))
      );
      await seatAvailability.save();
    }

    // Populate booking details
    await booking.populate(['route', 'bus', 'schedule']);

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(booking, passengerDetails);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('route')
      .populate('bus')
      .populate('schedule')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user owns booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user owns booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Remove seats from availability
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

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
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
