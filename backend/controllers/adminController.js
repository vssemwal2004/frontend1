const User = require('../models/User');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Admin login with credentials from .env
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check against admin credentials from .env
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    // Find or create admin user in database
    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');

    if (!admin) {
      // Create admin user if doesn't exist (password will be hashed by pre-save hook)
      admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phone: '0000000000',
        isAdmin: true,
        isVerified: true,
      });
      console.log('✅ Admin user created in database');
    } else {
      // Update admin flag if needed
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        admin.isVerified = true;
        await admin.save();
        console.log('✅ Existing user updated to admin');
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('🔐 Admin logged in:', admin.email);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message,
    });
  }
};

/**
 * Get admin dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalRoutes, totalBuses, totalSchedules, totalBookings, totalRevenue] = await Promise.all([
      Route.countDocuments(),
      Bus.countDocuments(),
      Schedule.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalRoutes,
        totalBuses,
        totalSchedules,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Get all routes
 */
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch routes',
      error: error.message,
    });
  }
};

/**
 * Get available cities from routes (for user search)
 */
exports.getAvailableCities = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true });
    
    const sources = [...new Set(routes.map(r => r.from))].sort();
    const destinations = [...new Set(routes.map(r => r.to))].sort();
    const allCities = [...new Set([...sources, ...destinations])].sort();
    
    res.json({
      success: true,
      data: {
        sources,
        destinations,
        cities: allCities,
      },
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: error.message,
    });
  }
};

/**
 * Get all buses
 */
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: buses,
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buses',
      error: error.message,
    });
  }
};

/**
 * Create a new route
 */
exports.createRoute = async (req, res) => {
  try {
    const { source, destination, distance, duration, price } = req.body;

    console.log('Creating route with data:', { source, destination, distance, duration, price });

    const route = await Route.create({
      from: source,
      to: destination,
      distance,
      duration,
      baseFare: price,
    });

    console.log('Route created successfully:', route);

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route,
    });
  } catch (error) {
    console.error('Create route error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create route',
      error: error.message,
    });
  }
};

/**
 * Update a route
 */
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, destination, distance, duration, price } = req.body;

    const updates = {};
    if (source) updates.from = source;
    if (destination) updates.to = destination;
    if (distance) updates.distance = distance;
    if (duration) updates.duration = duration;
    if (price) updates.baseFare = price;

    const route = await Route.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route,
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update route',
      error: error.message,
    });
  }
};

/**
 * Delete a route
 */
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Route.findByIdAndDelete(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete route',
      error: error.message,
    });
  }
};

/**
 * Create a new bus
 */
exports.createBus = async (req, res) => {
  try {
    const { busNumber, busName, busType, totalSeats, amenities } = req.body;

    const bus = await Bus.create({
      busNumber,
      busName,
      busType,
      totalSeats,
      amenities,
    });

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: bus,
    });
  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bus',
      error: error.message,
    });
  }
};

/**
 * Update a bus
 */
exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const bus = await Bus.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.json({
      success: true,
      message: 'Bus updated successfully',
      data: bus,
    });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bus',
      error: error.message,
    });
  }
};

/**
 * Delete a bus
 */
exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    const bus = await Bus.findByIdAndDelete(id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }

    res.json({
      success: true,
      message: 'Bus deleted successfully',
    });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bus',
      error: error.message,
    });
  }
};

/**
 * Get all schedules
 */
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('route', 'from to distance')
      .populate('bus', 'busNumber busName busType totalSeats')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message,
    });
  }
};

/**
 * Create a new schedule
 */
exports.createSchedule = async (req, res) => {
  try {
    const { routeId, busId, departureTime, arrivalTime, fare, availableDays, validFrom, validTo } = req.body;

    const schedule = await Schedule.create({
      route: routeId,
      bus: busId,
      departureTime,
      arrivalTime,
      fare,
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      validFrom,
      validTo,
    });

    await schedule.populate('route bus');

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule,
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message,
    });
  }
};

/**
 * Update a schedule
 */
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { routeId, busId, departureTime, arrivalTime, fare, availableDays, validFrom, validTo } = req.body;

    const updates = {};
    if (routeId) updates.route = routeId;
    if (busId) updates.bus = busId;
    if (departureTime) updates.departureTime = departureTime;
    if (arrivalTime) updates.arrivalTime = arrivalTime;
    if (fare) updates.fare = fare;
    if (availableDays) updates.availableDays = availableDays;
    if (validFrom) updates.validFrom = validFrom;
    if (validTo) updates.validTo = validTo;

    const schedule = await Schedule.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('route bus');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule,
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message,
    });
  }
};

/**
 * Delete a schedule
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message,
    });
  }
};

/**
 * Get all bookings (admin view)
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'schedule',
        populate: {
          path: 'route bus',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};
