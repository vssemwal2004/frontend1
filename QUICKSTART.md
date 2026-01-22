# 🚀 Quick Start Guide

## Start the Application in 3 Steps

### Step 1: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

✅ Backend will start on **http://localhost:5000**

You should see:
```
╔════════════════════════════════════════╗
║   Bus Booking System API Server       ║
║   Environment: development             ║
║   Port: 5000                           ║
║   Status: Running ✓                    ║
╚════════════════════════════════════════╝

MongoDB Connected: <your-mongodb-host>
```

### Step 2: Start Frontend App

Open a **new terminal window**:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend will start on **http://localhost:5173**

### Step 3: Access the Application

Open your browser and go to:
**http://localhost:5173**

## 🧪 Test the System

### 1. Register a User
1. Click "Sign Up" or "Register"
2. Fill in your details:
   - Name: Your Name
   - Email: your.email@example.com
   - Password: Test@123456
   - Phone: 9876543210
3. Click "Register"

### 2. Login
1. Use the credentials you just created
2. You'll be logged in automatically after registration

### 3. Add Sample Data (Admin)

To test booking, you need to add buses, routes, and schedules. You can do this via:

**Option A: Use API directly (Postman/cURL)**

**Admin Login:**
```bash
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@busbooking.com",
  "password": "Admin@123456"
}
```

Save the token returned.

**Create a Bus:**
```bash
POST http://localhost:5000/api/admin/buses
Authorization: Bearer <your-admin-token>
Content-Type: application/json

{
  "busNumber": "KA01AB1234",
  "busName": "Volvo Multi-Axle",
  "busType": "AC",
  "totalSeats": 40,
  "seatLayout": {
    "rows": 10,
    "columns": 4,
    "seats": [
      {"seatNumber": "A1", "type": "seat", "position": {"row": 0, "column": 0}},
      {"seatNumber": "A2", "type": "seat", "position": {"row": 0, "column": 1}},
      {"seatNumber": "A3", "type": "seat", "position": {"row": 0, "column": 2}},
      {"seatNumber": "A4", "type": "seat", "position": {"row": 0, "column": 3}}
    ]
  },
  "amenities": ["WiFi", "Charging Point", "Water Bottle"]
}
```

**Create a Route:**
```bash
POST http://localhost:5000/api/admin/routes
Authorization: Bearer <your-admin-token>
Content-Type: application/json

{
  "from": "Bangalore",
  "to": "Chennai",
  "distance": 350,
  "duration": "7 hours",
  "baseFare": 800,
  "stops": [
    {"name": "Electronics City", "arrivalTime": "22:30", "departureTime": "22:35"},
    {"name": "Hosur", "arrivalTime": "23:15", "departureTime": "23:20"}
  ]
}
```

**Create a Schedule:**
```bash
POST http://localhost:5000/api/admin/schedules
Authorization: Bearer <your-admin-token>
Content-Type: application/json

{
  "route": "<route-id-from-previous-step>",
  "bus": "<bus-id-from-previous-step>",
  "departureTime": "22:00",
  "arrivalTime": "05:00",
  "fare": 850,
  "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "validFrom": "2026-01-01",
  "validTo": "2026-12-31"
}
```

### 4. Search for Buses

1. Go to homepage
2. Enter:
   - From: Karnataka (or Bangalore)
   - To: Tamil Nadu (or Chennai)
   - Date: Pick any date
3. Click "Search buses"

### 5. Book a Ticket

1. Click on a bus from search results
2. View the seat layout
3. Click on available seats to select
4. Click "Book Now"
5. Enter passenger details
6. Confirm booking
7. Check your email for confirmation! 📧

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend app running on port 5173
- [ ] MongoDB connected (check backend logs)
- [ ] Can register a new user
- [ ] Can login
- [ ] Can search buses (after adding sample data)
- [ ] Can view seat layout
- [ ] Can select seats
- [ ] Can create booking
- [ ] Receive email confirmation

## 🐛 Common Issues

### Backend won't start
- Check if MongoDB is running
- Verify MONGODB_URI in backend/.env
- Check if port 5000 is available

### Frontend won't start
- Check if backend is running
- Verify VITE_API_BASE_URL in frontend/.env
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### No buses showing
- Make sure you've added buses, routes, and schedules via admin API
- Check if the from/to locations match your route
- Check backend logs for errors

### Email not received
- Check SMTP settings in backend/.env
- Verify EMAIL_PASSWORD is correct (use app password for Gmail)
- Check spam folder
- Look at backend logs for email errors

## 📚 Next Steps

1. ✅ System is running
2. Create admin panel UI (optional)
3. Add more buses and routes
4. Customize the frontend design
5. Add payment gateway integration
6. Deploy to production

## 🆘 Need Help?

1. Check backend terminal for API errors
2. Check frontend browser console for errors
3. Check MongoDB logs
4. Verify all .env files are configured
5. Check [INTEGRATION.md](frontend/INTEGRATION.md) for detailed docs

---

**Happy Booking! 🎫**
