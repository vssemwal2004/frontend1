const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Bus = require('../models/Bus');

// @desc    Create new schedule
// @route   POST /api/admin/schedules
// @access  Private/Admin
exports.createSchedule = async (req, res, next) => {
  try {
    const { route, bus } = req.body;

    // Verify route exists
    const routeExists = await Route.findById(route);
    if (!routeExists) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Verify bus exists
    const busExists = await Bus.findById(bus);
    if (!busExists) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    const schedule = await Schedule.create(req.body);

    // Populate the created schedule
    await schedule.populate(['route', 'bus']);

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all schedules
// @route   GET /api/admin/schedules
// @access  Private/Admin
exports.getAllSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find()
      .populate('route', 'from to distance duration baseFare')
      .populate('bus', 'busName busNumber busType totalSeats')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single schedule
// @route   GET /api/admin/schedules/:id
// @access  Private/Admin
exports.getSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('route')
      .populate('bus');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update schedule
// @route   PUT /api/admin/schedules/:id
// @access  Private/Admin
exports.updateSchedule = async (req, res, next) => {
  try {
    let schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate(['route', 'bus']);

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/admin/schedules/:id
// @access  Private/Admin
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
