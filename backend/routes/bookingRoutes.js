const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

// TOGGLE: Use Hackwow or Original booking logic
const USE_HACKWOW = process.env.USE_HACKWOW === 'true';

// Import appropriate controller
const originalController = require('../controllers/bookingController');
const hackwowController = require('../controllers/hackwowBookingController');

// Select controller based on config
const bookingController = USE_HACKWOW ? hackwowController : originalController;

const router = express.Router();

// Original validation rules
const bookingValidation = [
  body('scheduleId').notEmpty().withMessage('Schedule ID is required'),
  body('journeyDate').isISO8601().withMessage('Valid journey date is required'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('passengerDetails.name').notEmpty().withMessage('Passenger name is required'),
  body('passengerDetails.email').isEmail().withMessage('Valid email is required'),
  body('passengerDetails.phone').notEmpty().withMessage('Phone number is required')
];

// New Hackwow reservation validation
const reserveValidation = [
  body('scheduleId').notEmpty().withMessage('Schedule ID is required'),
  body('journeyDate').isISO8601().withMessage('Valid journey date is required'),
  body('seatNumber').notEmpty().withMessage('Seat number is required')
];

// Razorpay order validation
const orderValidation = [
  body('reservationToken').notEmpty().withMessage('Reservation token is required')
];

// Payment confirmation validation
const confirmValidation = [
  body('reservationToken').notEmpty().withMessage('Reservation token is required'),
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  body('passengerDetails.name').notEmpty().withMessage('Passenger name is required'),
  body('passengerDetails.email').isEmail().withMessage('Valid email is required'),
  body('passengerDetails.phone').notEmpty().withMessage('Phone number is required')
];

// Protect all routes
router.use(protect);

// NOTE: We do NOT need syncHackwowToken middleware anymore!
// The new externalUserAuth middleware in Hackwow allows apps to pass
// user info directly without requiring Hackwow user registration.
// The hackwowBookingController.js now calls hackwowClient.setExternalUser(req.user)

// =============================================
// HACKWOW BOOKING FLOW (NEW - 3-step process)
// =============================================

if (USE_HACKWOW) {
  // Step 1: Reserve seat (gets 2-minute lock)
  router.post('/reserve', reserveValidation, validate, bookingController.reserveSeat);

  // Step 2: Create Razorpay order
  router.post('/create-order', orderValidation, validate, bookingController.createRazorpayOrder);

  // Step 3: Confirm booking after payment
  router.post('/confirm', confirmValidation, validate, bookingController.confirmBooking);

  // Release reservation (user cancels before payment)
  router.post('/release', orderValidation, validate, bookingController.releaseReservation);
}

// =============================================
// ORIGINAL BOOKING FLOW (Legacy - single step)
// =============================================

// POST /api/bookings - Create booking (legacy single-step)
router.post('/', bookingValidation, validate, 
  USE_HACKWOW ? (req, res) => res.status(400).json({
    success: false,
    message: 'Use /reserve + /create-order + /confirm flow instead'
  }) : originalController.createBooking
);

// =============================================
// COMMON ROUTES (work with both flows)
// =============================================

// GET /api/bookings/my-bookings
router.get('/my-bookings', bookingController.getMyBookings);

// GET /api/bookings/:id
router.get('/:id', bookingController.getBooking);

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
