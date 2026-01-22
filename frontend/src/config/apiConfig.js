/**
 * Configuration for API and App
 * @module config/apiConfig
 */

export const API_CONFIG = {
  // Points to Bus Ticketing Backend (NOT Hackwow directly)
  // Bus Backend handles auth, routes, etc. and delegates only booking to Hackwow
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 30000,
};

export const APP_CONFIG = {
  seatLockDuration: 120, // 2 minutes in seconds
  tokenKey: 'auth_token',
  userKey: 'user_data',
};

export const API_ENDPOINTS = {
  // Auth endpoints
  login: '/auth/login',
  register: '/auth/register',
  verifyOTP: '/auth/verify-otp',
  resendOTP: '/auth/resend-otp',
  getMe: '/auth/me',
  updateDetails: '/auth/updatedetails',
  updatePassword: '/auth/updatepassword',
  
  // Admin endpoints
  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard/stats',
  adminBuses: '/admin/buses',
  adminBusById: (id) => `/admin/buses/${id}`,
  adminRoutes: '/admin/routes',
  adminRouteById: (id) => `/admin/routes/${id}`,
  adminSchedules: '/admin/schedules',
  adminScheduleById: (id) => `/admin/schedules/${id}`,
  adminBookings: '/admin/bookings',
  
  // Bus search endpoints
  searchBuses: '/buses/search',
  busSeats: (scheduleId) => `/buses/${scheduleId}/seats`,
  
  // Booking endpoints (Hackwow 3-step flow)
  reserveSeat: '/bookings/reserve',          // Step 1: Lock seat
  createOrder: '/bookings/create-order',     // Step 2: Create Razorpay order
  confirmBooking: '/bookings/confirm',       // Step 3: Confirm after payment
  releaseSeat: '/bookings/release',          // Cancel reservation
  
  // Booking endpoints (Legacy single-step)
  createBooking: '/bookings',
  myBookings: '/bookings/my-bookings',
  bookingById: (id) => `/bookings/${id}`,
  cancelBooking: (id) => `/bookings/${id}/cancel`,
  
  // Health check
  health: '/health',
};
