const mongoose = require('mongoose');
const Schedule = require('./models/Schedule');
const Route = require('./models/Route');
const Bus = require('./models/Bus');

const checkSchedules = async () => {
  try {
    const mongoUri = 'mongodb+srv://adhyani1105:MdJapr9PfhR8kZN2@anubhav.vwkxmeg.mongodb.net/test?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const schedules = await Schedule.find()
      .populate('route', 'from to')
      .populate('bus', 'busNumber');

    console.log('\n=== ALL SCHEDULES ===');
    schedules.forEach((schedule, index) => {
      console.log(`\n${index + 1}. ${schedule.route?.from} → ${schedule.route?.to}`);
      console.log(`   Bus: ${schedule.bus?.busNumber}`);
      console.log(`   Available Days: ${schedule.availableDays}`);
      console.log(`   Valid From: ${schedule.validFrom}`);
      console.log(`   Valid To: ${schedule.validTo}`);
      console.log(`   Departure: ${schedule.departureTime}`);
      console.log(`   Arrival: ${schedule.arrivalTime}`);
    });

    console.log('\n=== CHECKING THURSDAY ===');
    const thursdaySchedules = schedules.filter(s => s.availableDays.includes('Thursday'));
    console.log(`Schedules available on Thursday: ${thursdaySchedules.length}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSchedules();
