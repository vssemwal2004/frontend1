import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Payment Service
 * Handles all payment-related API calls
 */
export const paymentService = {
  /**
   * Initiate payment for a booking
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.bookingId - Booking ID
   * @param {number} paymentData.amount - Payment amount
   * @returns {Promise<Object>} Payment initiation data
   */
  async initiatePayment(paymentData) {
    const response = await apiClient.post(API_ENDPOINTS.initiatePayment, paymentData);
    return response.data;
  },

  /**
   * Confirm payment (simulation)
   * @param {Object} confirmationData - Confirmation details
   * @param {string} confirmationData.paymentId - Payment ID
   * @param {string} confirmationData.status - Payment status
   * @returns {Promise<Object>} Payment confirmation
   */
  async confirmPayment(confirmationData) {
    const response = await apiClient.post(API_ENDPOINTS.confirmPayment, confirmationData);
    return response.data;
  },

  /**
   * Simulate payment (for demo purposes)
   * @param {number} amount - Amount to pay
   * @returns {Promise<Object>} Simulated payment result
   */
  async simulatePayment(amount) {
    // Simulate a 2-second payment process
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `PAY_${Date.now()}`,
          amount,
          timestamp: new Date().toISOString(),
        });
      }, 2000);
    });
  },
};
