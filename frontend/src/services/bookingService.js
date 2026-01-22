import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Booking Service
 * Handles all booking-related API calls
 * 
 * HACKWOW INTEGRATION:
 * The booking flow is now 3 steps:
 * 1. reserveSeat() - Lock seat for 2 minutes
 * 2. createOrder() - Create Razorpay order
 * 3. confirmBooking() - Confirm after payment
 * 
 * This prevents race conditions and double bookings.
 */
export const bookingService = {
  /**
   * STEP 1: Reserve a seat
   * 
   * This locks the seat in Hackwow for 2 minutes.
   * No one else can book this seat while lock is held.
   * 
   * @param {Object} data - Reservation data
   * @param {string} data.scheduleId - Schedule ID
   * @param {string} data.journeyDate - Journey date (YYYY-MM-DD)
   * @param {string} data.seatNumber - Seat number to reserve
   * @returns {Promise<Object>} { reservationToken, expiresAt, seat, schedule }
   */
  async reserveSeat(data) {
    const response = await apiClient.post(API_ENDPOINTS.reserveSeat, {
      scheduleId: data.scheduleId,
      journeyDate: data.journeyDate,
      seatNumber: data.seatNumber
    });
    return response.data;
  },

  /**
   * STEP 2: Create Razorpay order
   * 
   * Creates a Razorpay order for the reserved seat.
   * This is IDEMPOTENT - same token returns same order.
   * 
   * @param {string} reservationToken - From reserveSeat()
   * @returns {Promise<Object>} { orderId, amount, currency, keyId }
   */
  async createOrder(reservationToken) {
    const response = await apiClient.post(API_ENDPOINTS.createOrder, {
      reservationToken
    });
    return response.data;
  },

  /**
   * STEP 3: Confirm booking after Razorpay payment
   * 
   * Call this after Razorpay checkout success callback.
   * Verifies payment signature and finalizes booking.
   * 
   * @param {Object} data - Confirmation data
   * @param {string} data.reservationToken - From reserveSeat()
   * @param {string} data.razorpay_order_id - From Razorpay
   * @param {string} data.razorpay_payment_id - From Razorpay
   * @param {string} data.razorpay_signature - From Razorpay
   * @param {Object} data.passengerDetails - Passenger info
   * @returns {Promise<Object>} { booking, hackwowBookingId }
   */
  async confirmBooking(data) {
    const response = await apiClient.post(API_ENDPOINTS.confirmBooking, {
      reservationToken: data.reservationToken,
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
      passengerDetails: data.passengerDetails
    });
    return response.data;
  },

  /**
   * Release seat reservation (cancel before payment)
   * 
   * Call this if user cancels or times out.
   * Releases the lock so others can book.
   * 
   * @param {string} reservationToken - From reserveSeat()
   * @returns {Promise<Object>} Success confirmation
   */
  async releaseSeat(reservationToken) {
    const response = await apiClient.post(API_ENDPOINTS.releaseSeat, {
      reservationToken
    });
    return response.data;
  },

  /**
   * Legacy: Create booking (single-step, deprecated)
   * 
   * @deprecated Use reserveSeat + createOrder + confirmBooking instead
   * @param {Object} bookingData - Booking details
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
};
