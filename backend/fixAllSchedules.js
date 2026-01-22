const mongoose = require('mongoose');
const Schedule = require('./models/Schedule');
const Route = require('./models/Route');
const Bus = require('./models/Bus');

const fixAllSchedules = async () => {
  try {
    const mongoUri = 'mongodb+srv://adhyani1105:MdJapr9PfhR8kZN2@anubhav.vwkxmeg.mongodb.net/test?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Get all schedules
    const schedules = await Schedule.find();
    
    console.log(`Found ${schedules.length} schedules to fix\n`);
    
    for (const schedule of schedules) {
      const updates = {};
      
      // Fix availableDays if empty or not an array
      if (!schedule.availableDays || schedule.availableDays.length === 0) {
        updates.availableDays = allDays;
        console.log(`✓ Fixing availableDays for schedule ${schedule._id}`);
      }
      
      // Fix dates - set to start of day
      const validFrom = new Date(schedule.validFrom);
      validFrom.setHours(0, 0, 0, 0);
      updates.validFrom = validFrom;
      
      const validTo = new Date(schedule.validTo);
      validTo.setHours(23, 59, 59, 999);
      updates.validTo = validTo;
      
      console.log(`✓ Fixing dates for schedule ${schedule._id}`);
      console.log(`  Old validFrom: ${schedule.validFrom}`);
      console.log(`  New validFrom: ${validFrom}`);
      console.log(`  Old validTo: ${schedule.validTo}`);
      console.log(`  New validTo: ${validTo}`);
      
      await Schedule.findByIdAndUpdate(schedule._id, updates);
    }
    
    console.log('\n=== VERIFICATION ===');
    const updated = await Schedule.find()
      .populate('route', 'from to')
      .populate('bus', 'busNumber');
    
    updated.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.route?.from} → ${s.route?.to} (${s.bus?.busNumber})`);
      console.log(`   Days: ${s.availableDays.join(', ')}`);
      console.log(`   Valid: ${s.validFrom.toISOString()} to ${s.validTo.toISOString()}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✓ All schedules fixed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAllSchedules();
