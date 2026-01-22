const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixUsers() {
  try {
    // Find all users without passwords
    const usersWithoutPassword = await User.find({ password: { $exists: false } });
    
    console.log(`Found ${usersWithoutPassword.length} users without passwords`);
    
    for (const user of usersWithoutPassword) {
      console.log(`Fixing user: ${user.email}`);
      // Set a default password (user will need to change this)
      user.password = 'Password123!';
      await user.save();
      console.log(`✓ Fixed user: ${user.email}`);
    }
    
    console.log('\n✅ All users fixed! Default password: Password123!');
    console.log('Users should change their password after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing users:', error);
    process.exit(1);
  }
}

fixUsers();
