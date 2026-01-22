const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Please provide bus number'],
    unique: true,
    trim: true
  },
  busName: {
    type: String,
    required: [true, 'Please provide bus name'],
    trim: true
  },
  busType: {
    type: String,
    enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'Volvo'],
    required: [true, 'Please provide bus type']
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please provide total seats'],
    min: [1, 'Total seats must be at least 1']
  },
  seatLayout: {
    type: {
      rows: {
        type: Number,
        required: true
      },
      columns: {
        type: Number,
        required: true
      },
      seats: [{
        seatNumber: String,
        type: {
          type: String,
          enum: ['seat', 'sleeper', 'empty'],
          default: 'seat'
        },
        position: {
          row: Number,
          column: Number
        }
      }]
    },
    required: true
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Pillow', 'Reading Light', 'Emergency Exit']
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

module.exports = mongoose.model('Bus', busSchema);
