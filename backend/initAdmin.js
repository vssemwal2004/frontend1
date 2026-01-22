require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Initialize Admin User
 * Creates admin user in database with credentials from .env
 */

const initAdmin = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin exists
    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (admin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔐 Role: ${admin.isAdmin ? 'Admin' : 'User'}`);
      
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        admin.isVerified = true;
        await admin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Create admin user
      admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        phone: '0000000000',
        isAdmin: true,
        isVerified: true,
      });
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`📧 Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`🔐 Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('\n🌐 Access admin panel at: http://localhost:3000/admin/login\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

initAdmin();
