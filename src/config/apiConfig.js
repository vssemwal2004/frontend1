/**
 * Configuration for API and App
 * @module config/apiConfig
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  appId: import.meta.env.VITE_APP_ID || '',
  apiKey: import.meta.env.VITE_API_KEY || '',
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
  signup: '/auth/signup',
  logout: '/auth/logout',
  refreshToken: '/auth/refresh',
  
  // Event endpoints
  events: '/events',
  eventById: (id) => `/events/${id}`,
  
  // Seat endpoints
  seatLayout: (eventId) => `/events/${eventId}/seats`,
  reserveSeat: '/seats/reserve',
  releaseSeat: '/seats/release',
  
  // Booking endpoints
  createBooking: '/bookings/create',
  confirmBooking: '/bookings/confirm',
  myBookings: '/bookings/my-bookings',
  bookingById: (id) => `/bookings/${id}`,
  
  // Payment endpoints
  initiatePayment: '/payments/initiate',
  confirmPayment: '/payments/confirm',
};
