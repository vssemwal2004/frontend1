# Frontend-Backend Integration Guide

## Overview
This frontend is fully integrated with the bus booking backend API. All services, contexts, and components are configured to work with the backend endpoints.

## Configuration

### Environment Variables
Create a `.env` file in the frontend root with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production, update to your deployed backend URL.

## API Integration

### Authentication Flow
1. **Register**: `POST /api/auth/register`
   - User signs up with name, email, password, phone
   - Backend returns JWT token and user data
   - Token stored in localStorage

2. **Login**: `POST /api/auth/login`
   - User logs in with email and password
   - Backend validates and returns token
   - User data cached in localStorage

3. **Protected Routes**: All authenticated requests include JWT token in headers

### Bus Search Flow
1. **Search Buses**: `GET /api/buses/search?from=Bangalore&to=Chennai&date=2026-01-22`
   - Returns available schedules with bus and route details
   - Shows real-time seat availability

2. **Get Seat Layout**: `GET /api/buses/:scheduleId/seats?date=2026-01-22`
   - Returns bus seat layout
   - Shows booked and available seats

### Booking Flow
1. **User selects seats** from the seat layout
2. **Create Booking**: `POST /api/bookings`
   ```json
   {
     "scheduleId": "schedule_id",
     "journeyDate": "2026-01-22",
     "seats": ["A1", "A2"],
     "passengerDetails": {
       "name": "John Doe",
       "email": "john@example.com",
       "phone": "9876543210"
     }
   }
   ```
3. **Backend verifies** seat availability
4. **Booking confirmed** and seats marked as booked
5. **Email sent** to user with booking details
6. **Navigate** to confirmation page

### My Bookings
- **Get User Bookings**: `GET /api/bookings/my-bookings`
- **Get Booking Details**: `GET /api/bookings/:id`
- **Cancel Booking**: `PUT /api/bookings/:id/cancel`

## Updated Files

### Configuration & Services
- ✅ `.env.example` - Environment template
- ✅ `.env` - Local environment configuration
- ✅ `src/config/apiConfig.js` - API endpoints configuration
- ✅ `src/services/apiClient.js` - Axios instance with interceptors
- ✅ `src/services/authService.js` - Authentication methods
- ✅ `src/services/eventService.js` - Bus search methods
- ✅ `src/services/bookingService.js` - Booking methods

### Contexts
- ✅ `src/contexts/AuthContext.jsx` - User authentication state
- ✅ `src/contexts/BookingContext.jsx` - Booking and seat selection state

## Key Changes from Original

### API Endpoints
- Changed from `/events` to `/buses/search` for bus search
- Changed from separate reserve/confirm to direct booking
- Added JWT authentication
- Removed app_id and api_key (not needed)

### Booking Flow
- **Old**: Reserve seat → Lock timer → Payment → Confirm
- **New**: Select seats → Create booking → Confirmed (with email)
- Simpler, more reliable flow
- Backend handles seat locking automatically

### Data Structure
- Events → Schedules (bus routes with timings)
- Event details → Bus + Route + Schedule
- Single seat selection → Multiple seat selection
- Reservation object → Direct booking

## Component Updates Needed

The following components may need updates to work with the new backend:

### 1. EventsListPage.jsx
Update to use bus search instead of events:
```jsx
// Use search params from HomePage
const { from, to, date } = useLocation().state;
const data = await eventService.searchBuses({ from, to, date });
```

### 2. EventDetailPage.jsx
Update to load schedule and show seat layout:
```jsx
const { scheduleId, date } = useParams();
await loadSchedule(scheduleId, date);
```

### 3. SeatSelection.jsx
Update to use multiple seat selection:
```jsx
const { selectedSeats, toggleSeatSelection, bookedSeats } = useBooking();
// Allow multiple seat selection
// Disable booked seats
```

### 4. PaymentModal.jsx
Update to directly create booking:
```jsx
const booking = await completeBooking(passengerDetails);
// Navigate to confirmation
navigate(`/booking/confirmation/${booking.data.bookingId}`);
```

### 5. BookingConfirmationPage.jsx
Display booking details from backend response:
```jsx
// Show bookingId, route, bus, seats, fare, passenger details
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Flow
1. Register a new user
2. Login
3. Search for buses (e.g., Bangalore to Chennai)
4. Select a bus and view seats
5. Select seats and book
6. Check email for confirmation
7. View booking in "My Bookings"

## Error Handling

All services include proper error handling:
- Network errors
- Validation errors
- Authentication errors (401)
- Server errors (500)

Errors are displayed to users with helpful messages.

## Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend configured to connect
3. ⚠️ Update UI components for new data structure
4. ⚠️ Test complete booking flow
5. ⚠️ Add loading states and error boundaries
6. ⚠️ Configure SMTP for email sending

## Admin Features

If you need admin functionality in frontend, create admin pages:
- Login with admin credentials from `.env`
- Access admin endpoints (`/api/admin/*`)
- Manage buses, routes, schedules
- View all bookings

## Support

For issues or questions:
1. Check backend logs
2. Check browser console
3. Verify API endpoints in Network tab
4. Ensure backend is running and accessible
