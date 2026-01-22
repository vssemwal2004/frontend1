import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Bus/Event Service
 * Handles all bus search and schedule-related API calls
 */
export const eventService = {
  /**
   * Search buses by source, destination, and date
   * @param {Object} params - Query parameters
   * @param {string} params.from - Source location
   * @param {string} params.to - Destination location
   * @param {string} params.date - Journey date (YYYY-MM-DD)
   * @returns {Promise<Object>} List of available buses/schedules
   */
  async searchBuses(params) {
    const response = await apiClient.get(API_ENDPOINTS.searchBuses, { params });
    return response.data;
  },

  /**
   * Get bus seat layout and availability
   * @param {string} scheduleId - Schedule ID
   * @param {string} date - Journey date (YYYY-MM-DD)
   * @returns {Promise<Object>} Seat layout and booked seats
   */
  async getBusSeats(scheduleId, date) {
    const response = await apiClient.get(API_ENDPOINTS.busSeats(scheduleId), {
      params: { date }
    });
    return response.data;
  },

  /**
   * Get all events (alias for searchBuses for backward compatibility)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of events
   */
  async getAllEvents(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.searchBuses, { params });
    return response.data;
  },

  /**
   * Get event by ID (schedule details)
   * @param {string} eventId - Event/Schedule ID
   * @returns {Promise<Object>} Event details
   */
  async getEventById(eventId) {
    // Using admin endpoint to get schedule details
    // In production, you might want a dedicated public endpoint
    const response = await apiClient.get(API_ENDPOINTS.adminScheduleById(eventId));
    return response.data;
  },

  /**
   * Get seat layout for an event
   * @param {string} eventId - Event/Schedule ID
   * @param {string} date - Journey date
   * @returns {Promise<Object>} Seat layout data
   */
  async getSeatLayout(eventId, date) {
    return this.getBusSeats(eventId, date);
  },
};

