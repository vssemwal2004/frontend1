# Testing Guide - Bus Booking System

## Prerequisites
- Node.js installed
- MongoDB Atlas connection string working
- Gmail SMTP credentials configured

## Start the Application

### 1. Start Backend Server (Port 5000)
```bash
cd D:\geu\frontend1\backend
npm install
npm start
```

Backend should start on: `http://localhost:5000`

### 2. Start Frontend Server (Port 3000)
```bash
cd D:\geu\frontend1\frontend
npm install
npm run dev
```

Frontend should start on: `http://localhost:3000`

## Create Sample Data

Before testing the booking flow, you need to create sample data:

### Step 1: Create Admin Account
1. Go to frontend: `http://localhost:3000/login`
2. Click "Sign Up"
3. Register with email: `admin@busbooking.com` password: `Admin@123456`
4. Or login if admin already exists

### Step 2: Add Sample Bus, Route, and Schedule (Using API)

Use Postman or cURL to create sample data:

#### 1. Login as Admin
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@busbooking.com",
  "password": "Admin@123456"
}
```

Save the `token` from response.

#### 2. Create a Route
```bash
POST http://localhost:5000/api/admin/routes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "from": "Delhi",
  "to": "Mumbai",
  "distance": 1400,
  "duration": "24 hours"
}
```

Save the `_id` as `routeId`.

#### 3. Create a Bus
```bash
POST http://localhost:5000/api/admin/buses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "busNumber": "DL01AB1234",
  "busName": "Volvo Multiaxle",
  "busType": "AC Sleeper",
  "totalSeats": 40,
  "amenities": ["AC", "WiFi", "Charging Point", "Entertainment"]
}
```

Save the `_id` as `busId`.

#### 4. Create a Schedule
```bash
POST http://localhost:5000/api/admin/schedules
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "bus": "YOUR_BUS_ID",
  "route": "YOUR_ROUTE_ID",
  "departureTime": "09:00",
  "arrivalTime": "09:00",
  "fare": 1500,
  "daysOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
}
```

## Test the Booking Flow

### Step 1: Search for Buses
1. Go to `http://localhost:3000`
2. Fill in the search form:
   - From: "Delhi"
   - To: "Mumbai"
   - Date: Select today or future date
3. Click "Search buses"

### Step 2: View Bus Details
1. Click on a bus card from the search results
2. You should see bus details and seat layout

### Step 3: Select Seats
1. Click on available seats (green)
2. You can select multiple seats
3. See total fare update

### Step 4: Book Seats
1. Click "Proceed to Payment"
2. Fill in passenger details:
   - Name
   - Email (booking confirmation will be sent here)
   - Phone
3. Click "Confirm & Book"
4. Check your email for booking confirmation

### Step 5: View Bookings
1. Go to "My Account" from navbar
2. Click "My Bookings" tab
3. See your booking details

## Troubleshooting

### 400 Bad Request on /api/buses/search
- Ensure you've created at least one Route, Bus, and Schedule
- Check that the `from` and `to` in search match the route you created
- Check browser console for errors

### No Seats Showing
- Verify that the bus has `totalSeats` > 0
- Check if the schedule is active for the selected date

### Email Not Received
- Check `.env` file has correct Gmail SMTP credentials
- Verify `EMAIL_PASSWORD` is an App Password (not regular Gmail password)
- Check spam folder

### CORS Errors
- Verify backend `.env` has `FRONTEND_URL=http://localhost:3000`
- Verify frontend `.env` has `VITE_API_BASE_URL=http://localhost:5000/api`
- Restart both servers after changing .env files

## Quick Sample Data Script

Create a file `D:\geu\frontend1\backend\seedData.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Schedule = require('./models/Schedule');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const admin = await User.findOne({ email: 'admin@busbooking.com' });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: 'admin@busbooking.com',
        password: 'Admin@123456',
        role: 'admin'
      });
      console.log('Admin created');
    }

    // Create route
    const route = await Route.create({
      from: 'Delhi',
      to: 'Mumbai',
      distance: 1400,
      duration: '24 hours',
      isActive: true
    });
    console.log('Route created:', route._id);

    // Create bus
    const bus = await Bus.create({
      busNumber: 'DL01AB1234',
      busName: 'Volvo Multiaxle',
      busType: 'AC Sleeper',
      totalSeats: 40,
      amenities: ['AC', 'WiFi', 'Charging Point', 'Entertainment'],
      isActive: true
    });
    console.log('Bus created:', bus._id);

    // Create schedule
    const schedule = await Schedule.create({
      bus: bus._id,
      route: route._id,
      departureTime: '09:00',
      arrivalTime: '09:00',
      fare: 1500,
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      isActive: true
    });
    console.log('Schedule created:', schedule._id);

    console.log('\n✅ Sample data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedData();
```

Run it:
```bash
cd D:\geu\frontend1\backend
node seedData.js
```

## API Endpoints Reference

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/buses/search?from=X&to=Y&date=Z` - Search buses
- `GET /api/buses/:scheduleId/seats?date=Y` - Get seat layout

### Protected Endpoints (Require JWT Token)
- `GET /api/auth/me` - Get current user
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin Endpoints (Require Admin Role)
- `POST /api/admin/buses` - Create bus
- `POST /api/admin/routes` - Create route
- `POST /api/admin/schedules` - Create schedule
- `GET /api/admin/bookings` - Get all bookings
