const Bus = require('../models/Bus');

// @desc    Create new bus
// @route   POST /api/admin/buses
// @access  Private/Admin
exports.createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: bus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all buses
// @route   GET /api/admin/buses
// @access  Private/Admin
exports.getAllBuses = async (req, res, next) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bus
// @route   GET /api/admin/buses/:id
// @access  Private/Admin
exports.getBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bus
// @route   PUT /api/admin/buses/:id
// @access  Private/Admin
exports.updateBus = async (req, res, next) => {
  try {
    let bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: bus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bus
// @route   DELETE /api/admin/buses/:id
// @access  Private/Admin
exports.deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    await bus.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
