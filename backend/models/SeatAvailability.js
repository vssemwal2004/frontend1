const mongoose = require('mongoose');

const seatAvailabilitySchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  journeyDate: {
    type: Date,
    required: true
  },
  bookedSeats: [{
    seatNumber: String,
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create unique index for schedule and journey date
seatAvailabilitySchema.index({ schedule: 1, journeyDate: 1 }, { unique: true });

// Update timestamp on save
seatAvailabilitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SeatAvailability', seatAvailabilitySchema);
