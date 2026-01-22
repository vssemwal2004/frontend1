import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Booking Service
 * Handles all booking-related API calls
 */
export const bookingService = {
  /**
   * Reserve a seat
   * @param {Object} reservationData - Reservation details
   * @param {string} reservationData.eventId - Event ID
   * @param {string} reservationData.seatId - Seat ID
   * @returns {Promise<Object>} Reservation data with lock details
   */
  async reserveSeat(reservationData) {
    const response = await apiClient.post(API_ENDPOINTS.reserveSeat, reservationData);
    return response.data;
  },

  /**
   * Release a reserved seat
   * @param {Object} releaseData - Release details
   * @param {string} releaseData.reservationId - Reservation ID
   * @returns {Promise<Object>} Release confirmation
   */
  async releaseSeat(releaseData) {
    const response = await apiClient.post(API_ENDPOINTS.releaseSeat, releaseData);
    return response.data;
  },

  /**
   * Create a booking
   * @param {Object} bookingData - Booking details
   * @param {string} bookingData.eventId - Event ID
   * @param {string} bookingData.seatId - Seat ID
   * @param {string} bookingData.reservationId - Reservation ID
   * @returns {Promise<Object>} Booking data
   */
  async createBooking(bookingData) {
    const response = await apiClient.post(API_ENDPOINTS.createBooking, bookingData);
    return response.data;
  },

  /**
   * Confirm booking after payment
   * @param {Object} confirmationData - Confirmation details
   * @param {string} confirmationData.bookingId - Booking ID
   * @param {string} confirmationData.paymentId - Payment ID
   * @returns {Promise<Object>} Confirmed booking
   */
  async confirmBooking(confirmationData) {
    const response = await apiClient.post(API_ENDPOINTS.confirmBooking, confirmationData);
    return response.data;
  },

  /**
   * Get user's bookings
   * @returns {Promise<Array>} List of user bookings
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
};
