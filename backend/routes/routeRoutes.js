const express = require('express');
const router = express.Router();
const { getAllRoutes, getAvailableCities } = require('../controllers/adminController');

// Public routes for users
router.get('/cities', getAvailableCities);
router.get('/', getAllRoutes);

module.exports = router;
