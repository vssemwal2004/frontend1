const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  from: {
    type: String,
    required: [true, 'Please provide source location'],
    trim: true
  },
  to: {
    type: String,
    required: [true, 'Please provide destination location'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Please provide distance in kilometers']
  },
  duration: {
    type: String,
    required: [true, 'Please provide estimated duration']
  },
  baseFare: {
    type: Number,
    required: [true, 'Please provide base fare'],
    min: [0, 'Fare cannot be negative']
  },
  stops: [{
    name: String,
    arrivalTime: String,
    departureTime: String,
    stopDuration: Number // in minutes
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for searching routes
routeSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Route', routeSchema);
