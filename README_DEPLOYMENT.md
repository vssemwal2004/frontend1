# 🏨 Hotel Krishna & Restaurant — Full-Stack Hotel Management System

A comprehensive, production-ready hotel management web application built for **Hotel Krishna and Restaurant**, located on Kedarnath Road, Sersi, Uttarakhand. The system handles everything from guest-facing room browsing and online booking to admin dashboards, worker room allotment, and payment processing.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features Overview](#-features-overview)
  - [Guest-Facing Features](#1-guest-facing-features)
  - [Booking System](#2-booking-system)
  - [Authentication & Authorization](#3-authentication--authorization)
  - [Admin Panel](#4-admin-panel)
  - [Worker Portal](#5-worker-portal)
  - [Payment Integration](#6-payment-integration)
  - [Email Notifications](#7-email-notifications)
  - [GST Tax Calculation](#8-gst-tax-calculation)
  - [Chatbot (Placeholder)](#9-chatbot)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment (Vercel)](#-deployment-vercel)
- [API Reference](#-api-reference)
- [Database Models](#-database-models)
- [Role-Based Access Matrix](#-role-based-access-matrix)

---

## 🛠 Tech Stack

| Layer       | Technology                                                              |
|-------------|-------------------------------------------------------------------------|
| **Frontend** | Next.js 13, React 18, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend**  | Node.js 18+, Express 4, Mongoose (MongoDB), Zod validation             |
| **Auth**     | JWT (HttpOnly cookies + localStorage), Google OAuth 2.0, bcrypt         |
| **Payments** | Razorpay (order creation + signature verification)                      |
| **Storage**  | Cloudinary (room photos, gallery images)                                |
| **Email**    | Nodemailer (Gmail / custom SMTP)                                        |
| **Hosting**  | Vercel (serverless functions for backend, Next.js for frontend)         |
| **Database** | MongoDB Atlas                                                           |

---

## 📁 Project Structure

```
hotel/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── app.js            # Express app setup (CORS, helmet, routes)
│   │   ├── server.js          # Server entry point + MongoDB connection
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication middleware
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── Booking.js     # Bookings with guests, items, payments
│   │   │   ├── User.js        # Users (admin, worker, user roles)
│   │   │   ├── Room.js        # Individual physical rooms
│   │   │   ├── RoomType.js    # Room categories with pricing tiers
│   │   │   ├── Gallery.js     # Gallery images (max 8 slots)
│   │   │   ├── ContactMessage.js  # Contact form submissions
│   │   │   └── Testimonial.js # Guest reviews with approval workflow
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.js        # Login, register, Google OAuth, /me
│   │   │   ├── bookings.js    # CRUD bookings, room allotment
│   │   │   ├── payments.js    # Razorpay order + verification
│   │   │   ├── rooms.js       # Room management
│   │   │   ├── roomTypes.js   # Room type CRUD + photos
│   │   │   ├── users.js       # Admin user/worker management
│   │   │   ├── gallery.js     # Gallery CRUD
│   │   │   ├── contact.js     # Contact form handling
│   │   │   ├── testimonials.js# Review CRUD + approval
│   │   │   └── packages.js    # Offers/packages (placeholder)
│   │   ├── utils/
│   │   │   ├── email.js       # Booking confirmation & admin notification emails
│   │   │   ├── gst.js         # Indian GST tax slab calculator
│   │   │   ├── cloudinary.js  # Cloudinary upload config
│   │   │   └── seedAdmin.js   # Auto-create admin from env vars
│   │   └── scheduler/
│   │       └── availabilityReset.js  # Cron-based room availability resets
│   └── package.json
│
├── frontend/                  # Next.js client application
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingBar.jsx     # Horizontal booking widget
│   │   │   ├── BookingCard.jsx    # Booking summary cards
│   │   │   ├── BookingWidget.jsx  # Booking flow widget
│   │   │   ├── Chatbot.jsx        # Floating chatbot FAB (placeholder)
│   │   │   ├── Footer.jsx         # Site footer
│   │   │   ├── header.jsx         # Navigation header
│   │   │   ├── RoomCard.jsx       # Room display card
│   │   │   └── ToastProvider.jsx  # Toast notifications
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Authentication state + JWT management
│   │   │   └── ThemeContext.jsx   # Theme toggling
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx     # Public pages layout (redirects workers)
│   │   │   ├── AdminLayout.jsx    # Admin sidebar layout (purple theme)
│   │   │   └── WorkerLayout.jsx   # Worker sidebar layout (teal theme)
│   │   ├── pages/
│   │   │   ├── home.jsx           # Landing page with hero + booking bar
│   │   │   ├── rooms.jsx          # Room listing
│   │   │   ├── about.jsx          # About the hotel
│   │   │   ├── contact.jsx        # Contact form + info
│   │   │   ├── gallery.jsx        # Photo gallery
│   │   │   ├── testimonials.jsx   # Guest reviews + submit form
│   │   │   ├── offers.jsx         # Special packages & deals
│   │   │   ├── in-around.jsx      # Nearby attractions (Kedarnath, Badrinath...)
│   │   │   ├── privacy.jsx        # Privacy policy
│   │   │   ├── terms.jsx          # Terms & conditions
│   │   │   ├── booking/           # Multi-step booking flow
│   │   │   ├── auth/              # Login, register, Google OAuth pages
│   │   │   ├── admin/             # Admin dashboard & management pages
│   │   │   └── worker/            # Worker portal pages
│   │   ├── hooks/
│   │   │   ├── useAuth.js         # Auth hook
│   │   │   ├── useBooking.js      # Booking logic hook
│   │   │   └── useChatbot.js      # Chatbot hook
│   │   └── utils/
│   │       ├── api.js             # Axios instance with JWT interceptor
│   │       ├── gst.js             # Frontend GST calculation
│   │       └── siteConfig.js      # Hotel name, address, socials, Maps URL
│   └── package.json
│
├── vercel.json                # Root Vercel config
└── README.md                  # ← You are here
```

---

## ✨ Features Overview

### 1. Guest-Facing Features

#### 🏠 Landing Page (`/home`)
- **Animated hero section** with parallax scrolling (Framer Motion)
- **Booking bar** — horizontal widget with date pickers, guest/room selectors, and a "Book Now" CTA
- Room type highlights, about section, and quick navigation
- Fully responsive across mobile, tablet, and desktop

#### 🛏 Rooms Page (`/rooms`)
- Browse available room types with photos, amenities, and pricing
- Room cards displaying base price, capacity, and package options
- Direct "Book Now" action from each room card

#### 📸 Gallery (`/gallery`)
- Photo gallery showcasing hotel interiors, exteriors, and surroundings
- Admin-managed gallery slots (up to 8 images via Cloudinary)

#### ⭐ Testimonials (`/testimonials`)
- View approved guest reviews with star ratings and aggregate statistics
- "Write a Review" form with name, email, rating (1–5 stars), message, and role
- Admin approval workflow — reviews only appear publicly after admin approves

#### 📞 Contact (`/contact`)
- Contact information cards (address with Google Maps link, phone, email)
- Validated contact form (name, email, phone, subject, message)
- Submissions stored in database with admin read/reply tracking

#### 🎁 Offers & Packages (`/offers`)
- Special deals and seasonal packages
- Package details with pricing and inclusions

#### 🏔 In & Around (`/in-around`)
- Showcase of 9+ nearby sacred destinations and attractions
- Locations include Kedarnath, Badrinath, Chopta, Tungnath, Deoria Tal, and more
- Distance from hotel, historical descriptions, and photos
- Animated hero with Framer Motion parallax effects

#### 📄 Legal Pages
- Privacy Policy (`/privacy`)
- Terms & Conditions (`/terms`)

---

### 2. Booking System

The booking system provides a complete end-to-end flow from browsing to payment:

#### Booking Flow
```
1. Guest visits landing page → sees Booking Bar
2. Selects check-in/out dates, rooms, adults, children
3. Clicks "Book Now" → navigates to /booking with query params
4. Booking page shows available room types for selected dates
5. Guest selects rooms, chooses package type (Room Only / Room+Breakfast / Full Board)
6. Reviews cart with GST breakdown
7. Proceeds to Razorpay payment
8. Booking confirmed → email sent to guest & admin
```

#### Booking Bar (`BookingBar.jsx`)
- Horizontal layout: Check In | Check Out | Rooms | Adults | Children | **Book Now**
- Smart defaults (today's date + tomorrow)
- Check-in/check-out time selection
- Increment/decrement controls for guests and rooms
- Orange-themed design with smooth hover effects

#### Booking Model Features
- Multi-room support (multiple room types per booking)
- Per-item guest list with individual details (name, email, phone, age, type)
- Package tiers: `roomOnly`, `roomBreakfast`, `roomBreakfastDinner`
- Extra bed and extra person charges
- GST calculation (automatic slab-based or custom per room type)
- Status tracking: `pending` → `paid` → `completed` | `cancelled`
- Razorpay payment integration (order ID, payment ID, signature verification)

---

### 3. Authentication & Authorization

#### Authentication Methods
- **Email/Password** — Registration with bcrypt-hashed passwords, JWT token-based login
- **Google OAuth 2.0** — One-click Google sign-in
- **Session Persistence** — JWT stored in HttpOnly cookies + localStorage fallback
- **Auto-Hydration** — `/auth/me` endpoint restores session on page reload

#### Three User Roles
| Role     | Description                                    |
|----------|------------------------------------------------|
| `user`   | Guest — can browse, book rooms, leave reviews  |
| `worker` | Staff — manages check-ins, room allotment       |
| `admin`  | Full control — dashboard, users, rooms, content |

#### Role-Based Routing
- Workers logging in are **automatically redirected** to `/worker` portal
- If a worker navigates to public pages (`/home`, `/rooms`, etc.), they are **redirected back** to `/worker`
- Admins are redirected to `/admin` on login
- Regular users go to `/home` or their pending booking page

---

### 4. Admin Panel

Accessible at `/admin` — requires `admin` role. Features a **purple/pink themed sidebar** layout.

#### 📊 Dashboard (`/admin`)
- **20+ real-time statistics**: total bookings, today's/week's/month's bookings & revenue
- Occupancy rate, growth trends, pending payments
- Active, completed, and cancelled booking counts
- Average booking value
- Stat cards with trend indicators
- 5 most recent bookings list

#### 👥 User Management (`/admin/users`)
- Create, edit, and delete user accounts
- Assign roles: `user`, `worker`, `admin`
- Set department, phone, and status (active/inactive)
- Worker account creation for hotel staff

#### 🛏 Room Type Management (`/admin/rooms`)
- Full CRUD for room categories
- Configure pricing tiers (Room Only, Room+Breakfast, Full Board)
- Set capacity limits (max adults, children, extra beds)
- Upload cover photos and gallery images (Cloudinary)
- Define amenities list
- **Room number management** — add individual room numbers (e.g., 101, 102, 103)
- Room count validation against room numbers

#### 📅 Booking Management (`/admin/bookings`)
- View all bookings with search and status filters
- Update booking status
- View payment details and guest information

#### 📸 Gallery Management (`/admin/gallery`)
- Upload and manage up to 8 gallery images
- Drag-to-reorder functionality
- Cloudinary integration for image storage
- Toggle active/inactive per image

#### 💬 Content Management (`/admin/content`)
- Review and manage contact form submissions
- Approve/reject guest testimonials
- Admin notes and read/reply tracking on contact messages

#### 🏨 Room Availability (`/admin/available-rooms`)
- View real-time room availability across all room types
- Date-range based availability checking

---

### 5. Worker Portal

Accessible at `/worker` — requires `worker` role. Features a **teal/emerald themed sidebar** layout, distinct from the admin panel.

#### 📊 Worker Dashboard (`/worker`)
- **Stats cards**: Total Bookings, Pending (amber), Paid (emerald), Completed (blue), Total Revenue (teal)
- **Search & filter**: Search by guest name, email, or booking ID
- **Status filter buttons**: All, Pending, Paid, Completed
- Booking list with detailed cards showing dates, rooms, guests, and amounts

#### 🔑 Room Allotment (`/worker/allot`)
- **Multiple guest management** — add unlimited guests per booking
- Each guest record: Name, Email, Phone, Age, Type (Adult/Child)
- Primary guest (first) is required; additional guests are optional
- **Dynamic room types** — automatically fetched from admin settings
- Package selection per room type
- Real-time availability checking with date-range conflict prevention
- Visual room number selection interface (color-coded available/selected)

#### ✏️ Booking Edit
- Extend check-out dates with automatic price recalculation
- Add additional guests to existing bookings
- Real-time price comparison (old vs. new totals)
- Availability validation for extended stay periods

#### 📱 Mobile Responsive
- Stats cards: 3 per row on mobile, 5 on desktop
- Compact icons and text on small screens
- Filter buttons wrap on mobile
- Guest cards stack vertically
- Full-width buttons on mobile

---

### 6. Payment Integration

Powered by **Razorpay** — India's leading payment gateway.

#### Flow
```
1. Guest completes room selection → clicks "Pay Now"
2. Backend creates Razorpay order (POST /api/payments/create-order)
3. Razorpay checkout opens in browser
4. Guest completes payment (UPI, Card, Net Banking, Wallet)
5. Frontend sends payment details to backend (POST /api/payments/verify)
6. Backend verifies HMAC-SHA256 signature
7. Booking status updated: pending → paid
8. Confirmation email sent to guest & admin
```

#### Security
- Server-side order creation (amount cannot be tampered)
- HMAC-SHA256 signature verification on payment completion
- Payment details stored: `orderId`, `paymentId`, `signature`, `status`

---

### 7. Email Notifications

Transactional emails sent via **Nodemailer** (Gmail / custom SMTP):

- **Booking Confirmation to Guest** — booking details, room info, dates, amount with GST breakdown
- **Booking Notification to Admin** — new booking alert with guest details
- Formatted dates (Indian format) and INR currency formatting
- IPv4-forced SMTP transport for reliability

---

### 8. GST Tax Calculation

Implements **Indian GST rules for hotels** with automatic slab-based calculation:

| Room Tariff (per night) | GST Rate |
|--------------------------|----------|
| Up to ₹1,000            | 0%       |
| ₹1,001 — ₹7,500        | 5%       |
| Above ₹7,500            | 18%      |

- Automatic slab detection based on base room price
- Admin can override with custom GST percentage per room type
- GST breakdown shown in booking summary and emails
- Utility functions: `getGSTSlabPercentage()`, `calculateGST()`, `formatGSTLabel()`

---

### 9. Chatbot

- Floating action button (FAB) in bottom-right corner with message icon
- Currently a **placeholder** for future AI chatbot integration (Dialogflow planned)
- Hook-based architecture (`useChatbot.js`) ready for implementation

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **MongoDB** (local or Atlas cloud instance)
- **Cloudinary** account (for image uploads)
- **Razorpay** account (for payments)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hotel
```

### 2. Backend Setup
```powershell
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/hoteldb
JWT_SECRET=your-jwt-secret-here
COOKIE_SECRET=your-cookie-secret-here
CLIENT_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Seed Admin
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@hotel.com
ADMIN_PASSWORD=admin123
```

Start the backend:
```powershell
npm run dev      # Development (with nodemon)
npm start        # Production
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

Start the frontend:
```powershell
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable                 | Required | Description                                |
|--------------------------|----------|--------------------------------------------|
| `MONGODB_URI`            | ✅       | MongoDB connection string                  |
| `JWT_SECRET`             | ✅       | Secret for signing JWT tokens              |
| `COOKIE_SECRET`          | ✅       | Secret for cookie signing                  |
| `CLIENT_ORIGIN`          | ✅       | Frontend URL for CORS                      |
| `GOOGLE_CLIENT_ID`       | ❌       | Google OAuth client ID                     |
| `CLOUDINARY_CLOUD_NAME`  | ✅       | Cloudinary cloud name                      |
| `CLOUDINARY_API_KEY`     | ✅       | Cloudinary API key                         |
| `CLOUDINARY_API_SECRET`  | ✅       | Cloudinary API secret                      |
| `RAZORPAY_KEY_ID`        | ✅       | Razorpay key ID                            |
| `RAZORPAY_KEY_SECRET`    | ✅       | Razorpay key secret                        |
| `EMAIL_USER`             | ❌       | SMTP email address                         |
| `EMAIL_PASS`             | ❌       | SMTP email password / app password         |
| `ADMIN_NAME`             | ❌       | Auto-seed admin name                       |
| `ADMIN_EMAIL`            | ❌       | Auto-seed admin email                      |
| `ADMIN_PASSWORD`         | ❌       | Auto-seed admin password                   |

### Frontend (`frontend/.env.local`)

| Variable                         | Required | Description               |
|----------------------------------|----------|---------------------------|
| `NEXT_PUBLIC_API_URL`            | ✅       | Backend API base URL      |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`   | ❌       | Google OAuth client ID    |

---

## 🌐 Deployment (Vercel)

This is a **monorepo** deployed as two separate Vercel projects:

### Backend (Express Serverless)
- **Root Directory**: `backend`
- **Framework Preset**: Other
- **Node.js Runtime**: 20.x
- API exposed as serverless function at `backend/api/index.js`
- Health check: `GET /api/health` → `{ ok: true }`

### Frontend (Next.js)
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- Set `NEXT_PUBLIC_API_URL` to the deployed backend URL

> See [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md) for detailed step-by-step instructions.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint              | Auth | Description                |
|--------|-----------------------|------|----------------------------|
| POST   | `/auth/register`      | ❌   | Register new user          |
| POST   | `/auth/login`         | ❌   | Login with email/password  |
| POST   | `/auth/google`        | ❌   | Google OAuth login         |
| GET    | `/auth/me`            | ✅   | Get current user profile   |
| POST   | `/auth/logout`        | ✅   | Logout (clear cookie)      |

### Bookings
| Method | Endpoint                           | Auth   | Description                          |
|--------|------------------------------------|--------|--------------------------------------|
| GET    | `/bookings`                        | ✅     | List bookings (user's own or all for admin/worker) |
| POST   | `/bookings`                        | ✅     | Create new booking                   |
| PUT    | `/bookings/:id`                    | ✅     | Update booking (extend stay, add guests) |
| PATCH  | `/bookings/:id/status`             | ✅     | Update booking status (admin/worker) |
| GET    | `/bookings/available-rooms/:key`   | ✅     | Get available room numbers for dates |
| POST   | `/bookings/:id/allot-rooms`        | ✅     | Allot room numbers to booking        |

### Payments
| Method | Endpoint                 | Auth | Description                    |
|--------|--------------------------|------|--------------------------------|
| POST   | `/payments/create-order` | ✅   | Create Razorpay payment order  |
| POST   | `/payments/verify`       | ✅   | Verify payment signature       |

### Room Types
| Method | Endpoint          | Auth   | Description                    |
|--------|-------------------|--------|--------------------------------|
| GET    | `/room-types`     | ❌     | List all room types            |
| GET    | `/room-types/:id` | ❌     | Get room type details          |
| POST   | `/room-types`     | Admin  | Create room type               |
| PUT    | `/room-types/:id` | Admin  | Update room type               |
| DELETE | `/room-types/:id` | Admin  | Delete room type               |

### Users (Admin Only)
| Method | Endpoint       | Auth  | Description              |
|--------|----------------|-------|--------------------------|
| GET    | `/users`       | Admin | List all users           |
| GET    | `/users/:id`   | Admin | Get user details         |
| POST   | `/users`       | Admin | Create user/worker       |
| PUT    | `/users/:id`   | Admin | Update user              |
| DELETE | `/users/:id`   | Admin | Delete user              |

### Gallery
| Method | Endpoint        | Auth  | Description              |
|--------|-----------------|-------|--------------------------|
| GET    | `/gallery`      | ❌    | List gallery images      |
| POST   | `/gallery`      | Admin | Upload gallery image     |
| PUT    | `/gallery/:id`  | Admin | Update gallery image     |
| DELETE | `/gallery/:id`  | Admin | Delete gallery image     |

### Testimonials
| Method | Endpoint               | Auth  | Description               |
|--------|------------------------|-------|---------------------------|
| GET    | `/testimonials`        | ❌    | List approved testimonials |
| POST   | `/testimonials`        | ❌    | Submit a review            |
| PATCH  | `/testimonials/:id`    | Admin | Approve/reject review      |

### Contact
| Method | Endpoint       | Auth  | Description                |
|--------|----------------|-------|----------------------------|
| POST   | `/contact`     | ❌    | Submit contact form        |
| GET    | `/contact`     | Admin | List contact messages      |
| PATCH  | `/contact/:id` | Admin | Mark as read / add notes   |

---

## 🗄 Database Models

### User
| Field        | Type   | Description                         |
|--------------|--------|-------------------------------------|
| name         | String | Full name                           |
| email        | String | Unique, lowercase, indexed          |
| password     | String | Bcrypt hashed (min 6 chars)         |
| role         | Enum   | `user` / `admin` / `worker`         |
| phone        | String | Optional contact number             |
| status       | Enum   | `active` / `inactive`               |
| department   | String | Worker department (e.g., Front Desk)|

### Booking
| Field         | Type     | Description                              |
|---------------|----------|------------------------------------------|
| user          | ObjectId | Reference to User                        |
| checkIn       | Date     | Check-in date                            |
| checkOut      | Date     | Check-out date                           |
| nights        | Number   | Number of nights                         |
| items[]       | Array    | Room selections (roomTypeKey, quantity, guests, package, allottedRoomNumbers) |
| subtotal      | Number   | Pre-tax amount                           |
| gstPercentage | Number   | GST % applied                            |
| gstAmount     | Number   | GST amount in ₹                          |
| total         | Number   | Final amount including GST               |
| status        | Enum     | `pending` → `paid` → `completed` / `cancelled` |
| payment       | Object   | Razorpay details (orderId, paymentId, signature) |

### RoomType
| Field        | Type   | Description                                 |
|--------------|--------|---------------------------------------------|
| key          | String | Unique slug (e.g., `deluxe-valley-view`)    |
| title        | String | Display name                                |
| pricing      | Object | Tiered: roomOnly, roomBreakfast, roomBreakfastDinner |
| capacity     | Object | Max adults, children, extra beds            |
| roomNumbers  | Array  | Physical room numbers (e.g., ["101", "102"])|
| photos       | Array  | Cloudinary URLs with publicId               |
| amenities    | Array  | List of amenities                           |
| gst          | Object | Auto slab or custom percentage              |
| count        | Number | Total rooms of this type                    |
| status       | Enum   | Active/inactive                             |

### Room
| Field       | Type   | Description                           |
|-------------|--------|---------------------------------------|
| roomNumber  | String | Unique room identifier                |
| floor       | Number | Floor number                          |
| type        | String | Room category                         |
| capacity    | Object | Adults + children limits              |
| basePrice   | Number | Base price per night                  |
| amenities   | Array  | Room-specific amenities               |
| photos      | Array  | Cloudinary URLs                       |
| status      | Enum   | `available` / `blocked` / `maintenance` |

---

## 🔒 Role-Based Access Matrix

| Feature                      | Guest (user) | Worker   | Admin    |
|------------------------------|:------------:|:--------:|:--------:|
| Browse rooms, gallery, pages | ✅           | ❌ (redirected) | ✅ |
| Book rooms & pay online      | ✅           | ❌       | ✅       |
| View own bookings            | ✅           | ❌       | ✅       |
| Submit reviews & contact     | ✅           | ❌       | ✅       |
| Worker dashboard             | ❌           | ✅       | ✅       |
| Allot room numbers           | ❌           | ✅       | ✅       |
| Edit bookings (extend stay)  | ❌           | ✅       | ✅       |
| Manage all bookings          | ❌           | ✅       | ✅       |
| Admin dashboard & stats      | ❌           | ❌       | ✅       |
| Manage users/workers         | ❌           | ❌       | ✅       |
| Manage room types & pricing  | ❌           | ❌       | ✅       |
| Manage gallery & content     | ❌           | ❌       | ✅       |
| Approve/reject testimonials  | ❌           | ❌       | ✅       |

---

## 📜 License

This project is private and proprietary to **Hotel Krishna and Restaurant**.

---

## 📍 Contact

**Hotel Krishna and Restaurant**
Kedarnath Road, Sersi, Rudraprayag, Uttarakhand, India

- 📧 Email: info@hotelkrishna.com
- 📱 Phone: Available in site configuration
- 🌐 [Google Maps Location](https://maps.google.com)
