const mongoose = require('mongoose');
const Schedule = require('./models/Schedule');
const Route = require('./models/Route');
const Bus = require('./models/Bus');

const fixSchedules = async () => {
  try {
    const mongoUri = 'mongodb+srv://adhyani1105:MdJapr9PfhR8kZN2@anubhav.vwkxmeg.mongodb.net/test?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Update all schedules to include all days
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const result = await Schedule.updateMany(
      { availableDays: { $exists: true, $size: 0 } }, // Find schedules with empty availableDays
      { $set: { availableDays: allDays } } // Set to all days
    );

    console.log(`✓ Updated ${result.modifiedCount} schedules with all days of the week`);

    // Show updated schedules
    const schedules = await Schedule.find()
      .populate('route', 'from to')
      .populate('bus', 'busNumber');

    console.log('\n=== UPDATED SCHEDULES ===');
    schedules.forEach((schedule, index) => {
      console.log(`\n${index + 1}. ${schedule.route?.from} → ${schedule.route?.to}`);
      console.log(`   Bus: ${schedule.bus?.busNumber}`);
      console.log(`   Available Days: ${schedule.availableDays.join(', ')}`);
    });

    await mongoose.connection.close();
    console.log('\n✓ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixSchedules();
