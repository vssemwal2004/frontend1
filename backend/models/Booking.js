const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user']
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Please provide schedule']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  journeyDate: {
    type: Date,
    required: [true, 'Please provide journey date']
  },
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    fare: {
      type: Number,
      required: true
    }
  }],
  totalFare: {
    type: Number,
    required: [true, 'Please provide total fare'],
    min: [0, 'Total fare cannot be negative']
  },
  passengerDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  // Razorpay integration fields
  paymentId: {
    type: String,
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  // Hackwow integration field
  hackwowBookingId: {
    type: String,
    default: null
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingId = `BUS${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Create indexes
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ schedule: 1, journeyDate: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
