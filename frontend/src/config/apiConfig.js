/**
 * Configuration for API and App
 * @module config/apiConfig
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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
  
  // Booking endpoints
  createBooking: '/bookings',
  myBookings: '/bookings/my-bookings',
  bookingById: (id) => `/bookings/${id}`,
  cancelBooking: (id) => `/bookings/${id}/cancel`,
  
  // Health check
  health: '/health',
};
