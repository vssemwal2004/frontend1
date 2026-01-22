import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Event Service
 * Handles all event-related API calls
 */
export const eventService = {
  /**
   * Get all events
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of events
   */
  async getAllEvents(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.events, { params });
    return response.data;
  },

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  async getEventById(eventId) {
    const response = await apiClient.get(API_ENDPOINTS.eventById(eventId));
    return response.data;
  },

  /**
   * Get seat layout for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Seat layout data
   */
  async getSeatLayout(eventId) {
    const response = await apiClient.get(API_ENDPOINTS.seatLayout(eventId));
    return response.data;
  },
};
