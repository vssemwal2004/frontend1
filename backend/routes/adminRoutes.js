const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Admin login (no auth required)
router.post('/login', adminController.adminLogin);

// Protected admin routes
router.use(adminAuth);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Route management
router.get('/routes', adminController.getAllRoutes);
router.post('/routes', adminController.createRoute);
router.put('/routes/:id', adminController.updateRoute);
router.delete('/routes/:id', adminController.deleteRoute);

// Bus management
router.get('/buses', adminController.getAllBuses);
router.post('/buses', adminController.createBus);
router.put('/buses/:id', adminController.updateBus);
router.delete('/buses/:id', adminController.deleteBus);

// Schedule management
router.get('/schedules', adminController.getAllSchedules);
router.post('/schedules', adminController.createSchedule);
router.put('/schedules/:id', adminController.updateSchedule);
router.delete('/schedules/:id', adminController.deleteSchedule);

// Booking management
router.get('/bookings', adminController.getAllBookings);

module.exports = router;
