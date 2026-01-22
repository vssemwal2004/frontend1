require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Seed Script - Now manages dynamic data
 * Static data removed - admin manages all routes, buses, and schedules via dashboard
 * 
 * To use:
 * 1. Login as admin using credentials from .env (ADMIN_EMAIL, ADMIN_PASSWORD)
 * 2. Navigate to /admin/dashboard
 * 3. Add routes, buses, and schedules through the admin interface
 */

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Database connected');
    console.log('ℹ️  Static data seeding is disabled');
    console.log('ℹ️  Use admin dashboard to manage routes, buses, and schedules');
    console.log(`\n📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`🔐 Admin Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('\n🌐 Access admin panel at: http://localhost:3000/admin/login\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
        distance: 980,
        duration: '16 hours',
        baseFare: 900,
        isActive: true
      },
      {
        from: 'Delhi',
        to: 'Jaipur',
        distance: 280,
        duration: '5 hours',
        baseFare: 400,
        isActive: true
      },
      {
        from: 'Bangalore',
        to: 'Chennai',
        distance: 350,
        duration: '7 hours',
        baseFare: 600,
        isActive: true
      }
    ]);
    console.log(`✅ Created ${routes.length} routes`);

    // Create buses
    console.log('\nCreating buses...');
    
    // Helper function to generate seat layout
    const generateSeatLayout = (totalSeats) => {
      const seatsPerRow = 4;
      const rows = Math.ceil(totalSeats / seatsPerRow);
      const seats = [];
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < seatsPerRow; col++) {
          const seatNumber = row * seatsPerRow + col + 1;
          if (seatNumber <= totalSeats) {
            seats.push({
              seatNumber: seatNumber.toString(),
              type: 'seat',
              position: { row, column: col }
            });
          }
        }
      }
      
      return {
        rows,
        columns: seatsPerRow,
        seats
      };
    };
    
    const buses = await Bus.insertMany([
      {
        busNumber: 'DL01AB1234',
        busName: 'Volvo Multiaxle',
        busType: 'Volvo',
        totalSeats: 40,
        seatLayout: generateSeatLayout(40),
        amenities: ['WiFi', 'Charging Point', 'Blanket', 'Pillow'],
        isActive: true
      },
      {
        busNumber: 'MH02CD5678',
        busName: 'Scania Luxury Coach',
        busType: 'AC',
        totalSeats: 45,
        seatLayout: generateSeatLayout(45),
        amenities: ['WiFi', 'Charging Point', 'Water Bottle'],
        isActive: true
      },
      {
        busNumber: 'RJ03EF9012',
        busName: 'Mercedes Benz Travego',
        busType: 'Sleeper',
        totalSeats: 36,
        seatLayout: generateSeatLayout(36),
        amenities: ['WiFi', 'Charging Point', 'Blanket', 'Pillow', 'Reading Light'],
        isActive: true
      },
      {
        busNumber: 'KA04GH3456',
        busName: 'Ashok Leyland',
        busType: 'Non-AC',
        totalSeats: 50,
        seatLayout: generateSeatLayout(50),
        amenities: ['Charging Point'],
        isActive: true
      }
    ]);
    console.log(`✅ Created ${buses.length} buses`);

    // Create schedules
    console.log('\nCreating schedules...');
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    const schedules = await Schedule.insertMany([
      // Delhi to Mumbai - 2 buses
      {
        bus: buses[0]._id,
        route: routes[0]._id,
        departureTime: '09:00',
        arrivalTime: '09:00', // Next day
        fare: 1500,
        validFrom: today,
        validTo: threeMonthsLater,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true
      },
      {
        bus: buses[1]._id,
        route: routes[0]._id,
        departureTime: '21:00',
        arrivalTime: '21:00', // Next day
        fare: 1800,
        validFrom: today,
        validTo: threeMonthsLater,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true
      },
      // Mumbai to Bangalore
      {
        bus: buses[2]._id,
        route: routes[1]._id,
        departureTime: '18:00',
        arrivalTime: '10:00', // Next day
        fare: 1200,
        validFrom: today,
        validTo: threeMonthsLater,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true
      },
      // Delhi to Jaipur
      {
        bus: buses[3]._id,
        route: routes[2]._id,
        departureTime: '06:00',
        arrivalTime: '11:00',
        fare: 500,
        validFrom: today,
        validTo: threeMonthsLater,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true
      },
      // Bangalore to Chennai
      {
        bus: buses[0]._id,
        route: routes[3]._id,
        departureTime: '22:00',
        arrivalTime: '05:00', // Next day
        fare: 800,
        validFrom: today,
        validTo: threeMonthsLater,
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        isActive: true
      }
    ]);
    console.log(`✅ Created ${schedules.length} schedules`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Sample data created successfully!');
    console.log('='.repeat(50));
    console.log('\n📋 Summary:');
    console.log(`   - Routes: ${routes.length}`);
    console.log(`   - Buses: ${buses.length}`);
    console.log(`   - Schedules: ${schedules.length}`);
    console.log(`   - Admin: admin@busbooking.com / Admin@123456`);
    
    console.log('\n🔍 Available Routes:');
    routes.forEach((route, i) => {
      console.log(`   ${i + 1}. ${route.from} → ${route.to} (${route.distance}km, ${route.duration})`);
    });

    console.log('\n🚌 Available Buses:');
    buses.forEach((bus, i) => {
      console.log(`   ${i + 1}. ${bus.busName} (${bus.busNumber}) - ${bus.busType}, ${bus.totalSeats} seats`);
    });

    console.log('\n📅 Schedules Created:');
    for (const schedule of schedules) {
      const bus = await Bus.findById(schedule.bus);
      const route = await Route.findById(schedule.route);
      console.log(`   - ${route.from} → ${route.to} | ${bus.busName} | ${schedule.departureTime} | ₹${schedule.fare}`);
    }

    console.log('\n🚀 Next Steps:');
    console.log('   1. Start backend: cd backend && npm start');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Open browser: http://localhost:3000');
    console.log('   4. Try searching: Delhi → Mumbai');
    console.log('   5. Login as admin: admin@busbooking.com / Admin@123456');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
