# EventBook - Event Booking Frontend

A professional FAANG-level React event booking application with seat selection, real-time countdown timer, and payment simulation.

## 🚀 Features

- **User Authentication** - Login/Signup with JWT
- **Event Browsing** - View and search available events
- **Interactive Seat Selection** - Real-time seat availability
- **2-Minute Lock Timer** - Countdown timer for seat reservation
- **Payment Simulation** - Mock payment gateway integration
- **Booking Confirmation** - Digital ticket generation
- **Responsive Design** - Mobile-first Tailwind CSS

## 🏗️ Tech Stack

- **React 18** - Modern React with Hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **Context API** - State management

## 📁 Project Structure

```
frontend1/
├── src/
│   ├── components/
│   │   ├── booking/
│   │   │   ├── SeatSelection.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   └── PaymentModal.jsx
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       └── ProtectedRoute.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── BookingContext.jsx
│   ├── hooks/
│   │   └── useTimer.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── EventsListPage.jsx
│   │   ├── EventDetailPage.jsx
│   │   └── BookingConfirmationPage.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   ├── bookingService.js
│   │   └── paymentService.js
│   ├── utils/
│   │   └── helpers.js
│   ├── config/
│   │   └── apiConfig.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#a855f7)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Neutral**: Gray scale

### Seat Status Colors

- **Available**: Green
- **Selected**: Blue
- **Reserved**: Yellow
- **Booked**: Red
- **VIP**: Purple

## 🔐 Security

- APP_ID and API_KEY sent via headers (`X-App-Id`, `X-Api-Key`)
- JWT token sent via `Authorization: Bearer <token>`
- Tokens stored in localStorage
- Protected routes with authentication check
- Never commit `.env` file

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API credentials:
```env
VITE_API_BASE_URL=https://your-api-url.com
VITE_APP_ID=your_app_id
VITE_API_KEY=your_api_key
```

### Development

Run the development server:
```bash
npm run dev
```

Application will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🔄 Booking Flow

1. **User Login/Signup** → Authenticate with backend
2. **Browse Events** → View available events
3. **Select Event** → View event details and seat layout
4. **Select Seat** → Click on available seat
5. **Seat Reserved** → 2-minute countdown timer starts
6. **Complete Payment** → Simulate payment
7. **Booking Confirmed** → Download ticket

## 📡 API Integration

All API calls include:
```javascript
headers: {
  'X-App-Id': 'your_app_id',
  'X-Api-Key': 'your_api_key',
  'Authorization': 'Bearer <jwt_token>'
}
```

### API Endpoints

- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /events` - Get all events
- `GET /events/:id` - Get event details
- `GET /events/:id/seats` - Get seat layout
- `POST /seats/reserve` - Reserve a seat
- `POST /bookings/create` - Create booking
- `POST /bookings/confirm` - Confirm booking

## 🎯 Key Components

### AuthContext
Manages user authentication state and provides login/signup/logout methods.

### BookingContext
Handles booking flow, seat selection, and timer management.

### SeatSelection
Interactive seat map with real-time availability.

### CountdownTimer
Visual countdown with progress bar and warnings.

### PaymentModal
Payment simulation with booking summary.

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly seat selection
- Optimized for all screen sizes

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📝 License

MIT

## 👨‍💻 Author

FAANG-level Frontend Engineer

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
