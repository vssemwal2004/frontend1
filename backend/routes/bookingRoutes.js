const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('scheduleId').notEmpty().withMessage('Schedule ID is required'),
  body('journeyDate').isISO8601().withMessage('Valid journey date is required'),
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('passengerDetails.name').notEmpty().withMessage('Passenger name is required'),
  body('passengerDetails.email').isEmail().withMessage('Valid email is required'),
  body('passengerDetails.phone').notEmpty().withMessage('Phone number is required')
];

// Protect all routes
router.use(protect);

// Routes
router.post('/', bookingValidation, validate, createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
