# Bus Booking System - Complete Full-Stack Application

A production-ready bus booking system with React frontend and Node.js backend, featuring JWT authentication, real-time seat availability, and automated email confirmations.

## 🚀 Features

### User Features
- ✅ User registration and login with JWT authentication
- ✅ Search buses by source, destination, and date
- ✅ View bus details with real-time seat availability
- ✅ Interactive seat selection (multiple seats)
- ✅ Instant booking confirmation
- ✅ Email notifications with booking details
- ✅ View booking history
- ✅ Cancel bookings

### Admin Features
- ✅ Secure admin login (credentials in environment variables)
- ✅ Dashboard with statistics
- ✅ Create and manage buses
- ✅ Define seat layouts
- ✅ Create and manage routes
- ✅ Create schedules (assign buses to routes)
- ✅ View all bookings

### System Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (admin/user)
- ✅ Real-time seat availability tracking
- ✅ Automatic seat locking on booking
- ✅ Email service with Nodemailer (SMTP)
- ✅ Input validation
- ✅ Error handling middleware
- ✅ MongoDB data persistence
- ✅ Responsive UI design
- ✅ Production-ready code structure

## 🛠 Tech Stack

### Frontend
- React 18
- React Router v6
- Context API (State Management)
- Axios (HTTP Client)
- Tailwind CSS
- Lucide React (Icons)
- Vite (Build Tool)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js
- Nodemailer
- Express Validator
- Cors

## 📁 Project Structure

```
bus-booking-system/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # Context providers
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── config/             # Configuration files
│   │   ├── utils/              # Utility functions
│   │   └── home/               # Home page components
│   ├── public/
│   ├── .env                    # Environment variables
│   └── package.json
│
└── backend/                     # Node.js Backend
    ├── config/                  # Database config
    ├── controllers/             # Request handlers
    ├── middleware/              # Custom middleware
    ├── models/                  # MongoDB models
    ├── routes/                  # API routes
    ├── services/                # Business logic
    ├── utils/                   # Utility functions
    ├── .env                     # Environment variables
    ├── server.js                # Entry point
    └── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Gmail account (for SMTP) or any SMTP service

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in backend folder:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/bus-booking
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   
   # Admin Credentials
   ADMIN_EMAIL=admin@busbooking.com
   ADMIN_PASSWORD=Admin@123456
   
   # Email (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   EMAIL_FROM=Bus Booking System <noreply@busbooking.com>
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in frontend folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run frontend**
   ```bash
   npm run dev
   ```

   App will start on `http://localhost:5173`

## 📧 Email Configuration (Gmail)

1. Enable 2-Factor Authentication in your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
3. Use this app password in `EMAIL_PASSWORD` in backend `.env`

## 🔐 Authentication Flow

### User Authentication
1. User registers with email and password
2. Password is hashed using bcrypt (10 salt rounds)
3. JWT token generated and returned
4. Token stored in localStorage
5. Token included in all authenticated requests via Authorization header

### Admin Authentication
1. Admin credentials stored securely in `.env`
2. Admin logs in using environment credentials
3. First login creates admin user in database
4. JWT token with admin role issued
5. Admin routes protected with role-based middleware

## 🎫 Booking Flow

1. **User searches** for buses by entering source, destination, and date
2. **System returns** available buses with route and seat details
3. **User selects** a bus and views seat layout
4. **User selects** one or more seats
5. **User enters** passenger details (name, email, phone)
6. **System verifies** seat availability
7. **Booking created** and seats marked as booked in database
8. **Email sent** to user with complete booking details
9. **User receives** booking confirmation with booking ID

## 📊 Database Models

### User
- name, email, password (hashed), role, phone, createdAt

### Bus
- busNumber, busName, busType, totalSeats, seatLayout, amenities, isActive

### Route
- from, to, distance, duration, baseFare, stops, isActive

### Schedule
- route (ref), bus (ref), departureTime, arrivalTime, fare, availableDays, validFrom, validTo, isActive

### Booking
- bookingId (auto-generated), user (ref), schedule (ref), route (ref), bus (ref), journeyDate, seats, totalFare, passengerDetails, status, paymentStatus

### SeatAvailability
- schedule (ref), journeyDate, bookedSeats (array)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats (Admin)
- `GET/POST /api/admin/buses` - Manage buses (Admin)
- `GET/POST /api/admin/routes` - Manage routes (Admin)
- `GET/POST /api/admin/schedules` - Manage schedules (Admin)
- `GET /api/admin/bookings` - View all bookings (Admin)

### Bus Search
- `GET /api/buses/search` - Search available buses
- `GET /api/buses/:scheduleId/seats` - Get seat layout

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings/my-bookings` - User bookings (Protected)
- `GET /api/bookings/:id` - Booking details (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)

## 🧪 Testing the Application

### 1. Test Backend
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Test@123","phone":"9876543210"}'
```

### 2. Test Frontend
1. Open `http://localhost:5173`
2. Register a new account
3. Login
4. Search for buses
5. Select seats and book
6. Check email for confirmation

### 3. Quick Connection Test
Run in browser console:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend Status:', data));
```

## 🎨 Frontend-Backend Integration

All frontend services are fully integrated:

- ✅ **authService** → `/api/auth/*`
- ✅ **eventService** → `/api/buses/*`
- ✅ **bookingService** → `/api/bookings/*`
- ✅ **adminService** → `/api/admin/*`

See [BACKEND_CONNECTION.md](frontend/BACKEND_CONNECTION.md) for detailed integration docs.

## 🚢 Deployment

### Backend (Node.js)
- Deploy to: Heroku, Railway, Render, or any Node.js hosting
- Set environment variables in hosting platform
- Update MongoDB URI to cloud MongoDB (MongoDB Atlas)

### Frontend (React)
- Build: `npm run build`
- Deploy to: Vercel, Netlify, or any static hosting
- Update `VITE_API_BASE_URL` to production backend URL

## 📝 Sample Data

To test the system, you'll need to:

1. **Login as Admin** (using credentials from `.env`)
2. **Create Buses** with seat layouts
3. **Create Routes** (e.g., Bangalore to Chennai)
4. **Create Schedules** (assign buses to routes with timings)
5. **Users can then search and book**

## 🔒 Security Features

- ✅ Password hashing (bcrypt with 10 salt rounds)
- ✅ JWT token authentication
- ✅ HTTP-only recommendations for production
- ✅ CORS enabled with specific origin
- ✅ Input validation on all routes
- ✅ Error handling middleware
- ✅ Protected routes with authentication middleware
- ✅ Role-based access control

## 📄 License

ISC

## 👥 Support

For issues or questions:
1. Check backend logs in terminal
2. Check frontend console for errors
3. Verify MongoDB is running
4. Ensure environment variables are set correctly
5. Check API endpoint responses in Network tab

## 🎯 Next Steps

1. ✅ Complete backend API
2. ✅ Integrate frontend with backend
3. ⚠️ Update UI components for new data structure
4. ⚠️ Add admin dashboard UI
5. ⚠️ Add payment gateway integration
6. ⚠️ Deploy to production
7. ⚠️ Add more bus operators
8. ⚠️ Add user reviews and ratings

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
