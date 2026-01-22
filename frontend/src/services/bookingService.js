import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Booking Service
 * Handles all booking-related API calls
 */
export const bookingService = {
  /**
   * Create a booking
   * @param {Object} bookingData - Booking details
   * @param {string} bookingData.scheduleId - Schedule ID
   * @param {string} bookingData.journeyDate - Journey date (YYYY-MM-DD)
   * @param {Array} bookingData.seats - Array of seat numbers or objects
   * @param {Object} bookingData.passengerDetails - Passenger information
   * @param {string} bookingData.passengerDetails.name - Passenger name
   * @param {string} bookingData.passengerDetails.email - Passenger email
   * @param {string} bookingData.passengerDetails.phone - Passenger phone
   * @returns {Promise<Object>} Booking confirmation
   */
  async createBooking(bookingData) {
    const response = await apiClient.post(API_ENDPOINTS.createBooking, bookingData);
    return response.data;
  },

  /**
   * Get user's bookings
   * @returns {Promise<Object>} List of user bookings
   */
  async getMyBookings() {
    const response = await apiClient.get(API_ENDPOINTS.myBookings);
    return response.data;
  },

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(bookingId) {
    const response = await apiClient.get(API_ENDPOINTS.bookingById(bookingId));
    return response.data;
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Cancellation confirmation
   */
  async cancelBooking(bookingId) {
    const response = await apiClient.put(API_ENDPOINTS.cancelBooking(bookingId));
    return response.data;
  },

  // Legacy methods for backward compatibility
  
  /**
   * Reserve a seat (deprecated - booking is now direct)
   * @deprecated Use createBooking instead
   */
  async reserveSeat(reservationData) {
    console.warn('reserveSeat is deprecated. Use createBooking instead.');
    return { success: true, message: 'Use createBooking for direct booking' };
  },

  /**
   * Release a reserved seat (deprecated)
   * @deprecated No longer needed with direct booking
   */
  async releaseSeat(releaseData) {
    console.warn('releaseSeat is deprecated. Seats are managed automatically.');
    return { success: true };
  },

  /**
   * Confirm booking after payment (deprecated)
   * @deprecated Booking is confirmed immediately on creation
   */
  async confirmBooking(confirmationData) {
    console.warn('confirmBooking is deprecated. Booking is confirmed on creation.');
    return { success: true };
  },
};

