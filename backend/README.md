# Bus Booking System - Backend API

A complete end-to-end bus booking system backend built with Node.js, Express.js, and MongoDB.

## Features

### Admin Features
- Secure admin login with credentials stored in environment variables
- Dashboard with comprehensive statistics
- Create, read, update, and delete buses
- Manage routes (from, to, timing, fares)
- Define seat layouts for buses
- Create and manage schedules (assign buses to routes)
- View all bookings
- Role-based access control

### User Features
- User registration and login with JWT authentication
- Search buses by source and destination
- View bus details with seat layout
- Real-time seat availability
- Book seats with automatic fare calculation
- View booking history
- Cancel bookings
- Email confirmation for bookings

### System Features
- Secure password hashing with bcrypt
- JWT-based authentication
- Email notifications using Nodemailer (SMTP)
- Seat availability management
- Input validation with express-validator
- Error handling middleware
- MongoDB for data persistence
- Production-ready code structure

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Express Validator** - Input validation

## Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the following variables in `.env`:
     - `MONGODB_URI` - Your MongoDB connection string
     - `JWT_SECRET` - A secure random string
     - `ADMIN_EMAIL` - Admin login email
     - `ADMIN_PASSWORD` - Admin login password
     - `EMAIL_USER` - SMTP email username
     - `EMAIL_PASSWORD` - SMTP email password (app password for Gmail)
     - `FRONTEND_URL` - Your frontend URL

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updatedetails` - Update user details (Protected)
- `PUT /api/auth/updatepassword` - Update password (Protected)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)
- `GET /api/admin/buses` - Get all buses (Admin)
- `POST /api/admin/buses` - Create bus (Admin)
- `GET /api/admin/buses/:id` - Get single bus (Admin)
- `PUT /api/admin/buses/:id` - Update bus (Admin)
- `DELETE /api/admin/buses/:id` - Delete bus (Admin)
- `GET /api/admin/routes` - Get all routes (Admin)
- `POST /api/admin/routes` - Create route (Admin)
- `GET /api/admin/routes/:id` - Get single route (Admin)
- `PUT /api/admin/routes/:id` - Update route (Admin)
- `DELETE /api/admin/routes/:id` - Delete route (Admin)
- `GET /api/admin/schedules` - Get all schedules (Admin)
- `POST /api/admin/schedules` - Create schedule (Admin)
- `GET /api/admin/schedules/:id` - Get single schedule (Admin)
- `PUT /api/admin/schedules/:id` - Update schedule (Admin)
- `DELETE /api/admin/schedules/:id` - Delete schedule (Admin)
- `GET /api/admin/bookings` - Get all bookings (Admin)

### Buses
- `GET /api/buses/search?from=source&to=destination&date=2026-01-22` - Search buses
- `GET /api/buses/:scheduleId/seats?date=2026-01-22` - Get seat layout and availability

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings/my-bookings` - Get user bookings (Protected)
- `GET /api/bookings/:id` - Get single booking (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)

### Health Check
- `GET /api/health` - Health check endpoint
- `GET /` - API information

## Data Models

### User
- name, email, password (hashed), role (user/admin), phone

### Bus
- busNumber, busName, busType, totalSeats, seatLayout, amenities, isActive

### Route
- from, to, distance, duration, baseFare, stops, isActive

### Schedule
- route, bus, departureTime, arrivalTime, fare, availableDays, validFrom, validTo, isActive

### Booking
- bookingId (auto-generated), user, schedule, route, bus, journeyDate, seats, totalFare, passengerDetails, status, paymentStatus

### SeatAvailability
- schedule, journeyDate, bookedSeats

## Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the app password in `EMAIL_PASSWORD`

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected routes with middleware
- Role-based access control (admin/user)
- Input validation on all routes
- CORS enabled with specific origin
- Error handling middleware

## Booking Flow

1. User searches for buses (source, destination, date)
2. System returns available buses with seat availability
3. User selects bus and views seat layout
4. User selects seats and provides passenger details
5. System verifies seat availability
6. Booking is created and seats are marked as booked
7. Confirmation email is sent to user
8. User receives booking confirmation with details

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── adminController.js    # Admin dashboard logic
│   ├── authController.js     # User authentication
│   ├── bookingController.js  # Booking management
│   ├── busController.js      # Bus CRUD operations
│   ├── routeController.js    # Route CRUD operations
│   ├── scheduleController.js # Schedule management
│   └── searchController.js   # Bus search logic
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Error handling
│   └── validator.js         # Request validation
├── models/
│   ├── Booking.js           # Booking schema
│   ├── Bus.js               # Bus schema
│   ├── Route.js             # Route schema
│   ├── Schedule.js          # Schedule schema
│   ├── SeatAvailability.js  # Seat tracking schema
│   └── User.js              # User schema
├── routes/
│   ├── adminRoutes.js       # Admin routes
│   ├── authRoutes.js        # Auth routes
│   ├── bookingRoutes.js     # Booking routes
│   └── busRoutes.js         # Bus search routes
├── services/
│   └── emailService.js      # Email service
├── utils/
│   └── jwt.js               # JWT utilities
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── README.md               # This file
└── server.js               # Entry point
```

## Example Requests

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

### Admin Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@busbooking.com",
  "password": "Admin@123456"
}
```

### Search Buses
```bash
GET /api/buses/search?from=Bangalore&to=Chennai&date=2026-01-22
```

### Create Booking
```bash
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduleId": "schedule_id_here",
  "journeyDate": "2026-01-22",
  "seats": ["A1", "A2"],
  "passengerDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

## License

ISC

## Author

Bus Booking System Backend Team
