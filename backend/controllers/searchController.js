const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const SeatAvailability = require('../models/SeatAvailability');

// @desc    Search buses by source and destination
// @route   GET /api/buses/search
// @access  Public
exports.searchBuses = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;

    console.log('Search buses request:', { from, to, date });

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from, to, and date parameters'
      });
    }

    // Find routes matching source and destination
    const routes = await Route.find({
      from: { $regex: new RegExp(from, 'i') },
      to: { $regex: new RegExp(to, 'i') },
      isActive: true
    });

    console.log('Found routes:', routes.length);

    if (routes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No routes found for this search',
        data: []
      });
    }

    const routeIds = routes.map(route => route._id);

    // Parse the journey date
    const journeyDate = new Date(date);
    const dayName = journeyDate.toLocaleDateString('en-US', { weekday: 'long' });

    console.log('Searching schedules for:', { routeIds, dayName, journeyDate });

    // Find schedules for these routes
    const schedules = await Schedule.find({
      route: { $in: routeIds },
      isActive: true,
      validFrom: { $lte: journeyDate },
      validTo: { $gte: journeyDate },
      availableDays: dayName
    })
      .populate('route', 'from to distance duration baseFare stops')
      .populate('bus', 'busName busNumber busType totalSeats seatLayout amenities');

    console.log('Found schedules:', schedules.length);
    console.log('Schedules details:', schedules.map(s => ({
      id: s._id,
      route: s.route?.from + ' -> ' + s.route?.to,
      bus: s.bus?.busNumber,
      days: s.availableDays,
      validFrom: s.validFrom,
      validTo: s.validTo
    })));

    // Get seat availability for each schedule
    const schedulesWithAvailability = await Promise.all(
      schedules.map(async (schedule) => {
        const seatAvailability = await SeatAvailability.findOne({
          schedule: schedule._id,
          journeyDate: {
            $gte: new Date(journeyDate.setHours(0, 0, 0, 0)),
            $lt: new Date(journeyDate.setHours(23, 59, 59, 999))
          }
        });

        const bookedSeats = seatAvailability ? seatAvailability.bookedSeats.map(s => s.seatNumber) : [];
        const availableSeats = schedule.bus.totalSeats - bookedSeats.length;

        return {
          ...schedule.toObject(),
          availableSeats,
          bookedSeats
        };
      })
    );

    console.log('Returning buses:', schedulesWithAvailability.length);

    res.status(200).json({
      success: true,
      count: schedulesWithAvailability.length,
      data: schedulesWithAvailability
    });
  } catch (error) {
    console.error('Search buses error:', error);
    next(error);
  }
};

// @desc    Get bus details with seat layout
// @route   GET /api/buses/:scheduleId/seats
// @access  Public
exports.getBusSeats = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date parameter'
      });
    }

    const schedule = await Schedule.findById(scheduleId)
      .populate('bus')
      .populate('route');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Get booked seats for this date
    const journeyDate = new Date(date);
    const seatAvailability = await SeatAvailability.findOne({
      schedule: scheduleId,
      journeyDate: {
        $gte: new Date(journeyDate.setHours(0, 0, 0, 0)),
        $lt: new Date(journeyDate.setHours(23, 59, 59, 999))
      }
    });

    const bookedSeats = seatAvailability ? seatAvailability.bookedSeats.map(s => s.seatNumber) : [];

    res.status(200).json({
      success: true,
      data: {
        schedule,
        seatLayout: schedule.bus.seatLayout,
        bookedSeats,
        availableSeats: schedule.bus.totalSeats - bookedSeats.length
      }
    });
  } catch (error) {
    next(error);
  }
};
