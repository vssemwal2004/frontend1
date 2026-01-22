const express = require('express');
const { searchBuses, getBusSeats } = require('../controllers/searchController');

const router = express.Router();

// Search buses
router.get('/search', searchBuses);

// Get bus seat layout and availability
router.get('/:scheduleId/seats', getBusSeats);

module.exports = router;
