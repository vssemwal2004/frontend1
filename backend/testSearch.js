const mongoose = require('mongoose');
const Schedule = require('./models/Schedule');
const Route = require('./models/Route');
const Bus = require('./models/Bus');

const testSearch = async () => {
  try {
    const mongoUri = 'mongodb+srv://adhyani1105:MdJapr9PfhR8kZN2@anubhav.vwkxmeg.mongodb.net/test?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const from = 'Delhi';
    const to = 'Mumbai';
    const date = '2026-01-22';

    console.log('=== SEARCH PARAMETERS ===');
    console.log('From:', from);
    console.log('To:', to);
    console.log('Date:', date);
    console.log();

    // Step 1: Find routes
    const routes = await Route.find({
      from: { $regex: new RegExp(from, 'i') },
      to: { $regex: new RegExp(to, 'i') },
      isActive: true
    });

    console.log('=== STEP 1: FIND ROUTES ===');
    console.log('Routes found:', routes.length);
    routes.forEach(r => console.log(`  - ${r.from} → ${r.to} (ID: ${r._id})`));
    console.log();

    if (routes.length === 0) {
      console.log('❌ No routes found!');
      await mongoose.connection.close();
      return;
    }

    const routeIds = routes.map(route => route._id);

    // Step 2: Parse date
    const journeyDate = new Date(date);
    const dayName = journeyDate.toLocaleDateString('en-US', { weekday: 'long' });

    console.log('=== STEP 2: PARSE DATE ===');
    console.log('Journey Date:', journeyDate);
    console.log('Day Name:', dayName);
    console.log();

    // Step 3: Build query
    const query = {
      route: { $in: routeIds },
      isActive: true,
      validFrom: { $lte: journeyDate },
      validTo: { $gte: journeyDate },
      availableDays: dayName
    };

    console.log('=== STEP 3: SCHEDULE QUERY ===');
    console.log(JSON.stringify(query, null, 2));
    console.log();

    // Step 4: Find schedules
    const schedules = await Schedule.find(query)
      .populate('route', 'from to distance duration baseFare')
      .populate('bus', 'busName busNumber busType totalSeats');

    console.log('=== STEP 4: SCHEDULES FOUND ===');
    console.log('Total schedules:', schedules.length);
    
    if (schedules.length === 0) {
      console.log('\n❌ No schedules found!');
      console.log('\nLet me check all schedules for these routes...\n');
      
      const allSchedules = await Schedule.find({ route: { $in: routeIds } })
        .populate('route', 'from to')
        .populate('bus', 'busNumber');
      
      console.log('All schedules for these routes:', allSchedules.length);
      allSchedules.forEach((s, i) => {
        console.log(`\n${i + 1}. Route: ${s.route?.from} → ${s.route?.to}`);
        console.log(`   Bus: ${s.bus?.busNumber}`);
        console.log(`   Available Days: ${s.availableDays}`);
        console.log(`   Valid From: ${s.validFrom}`);
        console.log(`   Valid To: ${s.validTo}`);
        console.log(`   Is Active: ${s.isActive}`);
        console.log(`   Matches dayName? ${s.availableDays.includes(dayName)}`);
        console.log(`   validFrom <= journeyDate? ${s.validFrom <= journeyDate}`);
        console.log(`   validTo >= journeyDate? ${s.validTo >= journeyDate}`);
      });
    } else {
      schedules.forEach((s, i) => {
        console.log(`\n${i + 1}. ${s.route?.from} → ${s.route?.to}`);
        console.log(`   Bus: ${s.bus?.busNumber} (${s.bus?.busName})`);
        console.log(`   Type: ${s.bus?.busType}`);
        console.log(`   Seats: ${s.bus?.totalSeats}`);
        console.log(`   Departure: ${s.departureTime}`);
        console.log(`   Arrival: ${s.arrivalTime}`);
        console.log(`   Fare: ₹${s.fare}`);
      });
      console.log('\n✓ Schedules found successfully!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testSearch();
