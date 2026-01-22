import apiClient from './apiClient';
import { API_ENDPOINTS, APP_CONFIG } from '@/config/apiConfig';

/**
 * Admin Service
 * Handles all admin-related API calls
 */
export const adminService = {
  /**
   * Admin login
   * @param {Object} credentials - Admin credentials
   * @param {string} credentials.email - Admin email
   * @param {string} credentials.password - Admin password
   * @returns {Promise<Object>} Admin data and token
   */
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.adminLogin, credentials);
    
    if (response.data.token) {
      localStorage.setItem(APP_CONFIG.tokenKey, response.data.token);
      localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Logout admin
   */
  logout() {
    localStorage.removeItem(APP_CONFIG.tokenKey);
    localStorage.removeItem(APP_CONFIG.userKey);
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  async getDashboard() {
    const response = await apiClient.get(API_ENDPOINTS.adminDashboard);
    return response.data;
  },

  /**
   * Get all buses
   * @returns {Promise<Array>} List of buses
   */
  async getAllBuses() {
    const response = await apiClient.get(API_ENDPOINTS.adminBuses);
    return response.data;
  },

  /**
   * Create a new bus
   * @param {Object} busData - Bus details
   * @returns {Promise<Object>} Created bus
   */
  async createBus(busData) {
    const response = await apiClient.post(API_ENDPOINTS.adminBuses, busData);
    return response.data;
  },

  /**
   * Update a bus
   * @param {string} busId - Bus ID
   * @param {Object} busData - Updated bus details
   * @returns {Promise<Object>} Updated bus
   */
  async updateBus(busId, busData) {
    const response = await apiClient.put(API_ENDPOINTS.adminBusById(busId), busData);
    return response.data;
  },

  /**
   * Delete a bus
   * @param {string} busId - Bus ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteBus(busId) {
    const response = await apiClient.delete(API_ENDPOINTS.adminBusById(busId));
    return response.data;
  },

  /**
   * Get all routes
   * @returns {Promise<Array>} List of routes
   */
  async getAllRoutes() {
    const response = await apiClient.get(API_ENDPOINTS.adminRoutes);
    return response.data;
  },

  /**
   * Create a new route
   * @param {Object} routeData - Route details
   * @returns {Promise<Object>} Created route
   */
  async createRoute(routeData) {
    const response = await apiClient.post(API_ENDPOINTS.adminRoutes, routeData);
    return response.data;
  },

  /**
   * Update a route
   * @param {string} routeId - Route ID
   * @param {Object} routeData - Updated route details
   * @returns {Promise<Object>} Updated route
   */
  async updateRoute(routeId, routeData) {
    const response = await apiClient.put(API_ENDPOINTS.adminRouteById(routeId), routeData);
    return response.data;
  },

  /**
   * Delete a route
   * @param {string} routeId - Route ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteRoute(routeId) {
    const response = await apiClient.delete(API_ENDPOINTS.adminRouteById(routeId));
    return response.data;
  },

  /**
   * Get all schedules
   * @returns {Promise<Array>} List of schedules
   */
  async getAllSchedules() {
    const response = await apiClient.get(API_ENDPOINTS.adminSchedules);
    return response.data;
  },

  /**
   * Create a new schedule
   * @param {Object} scheduleData - Schedule details
   * @returns {Promise<Object>} Created schedule
   */
  async createSchedule(scheduleData) {
    const response = await apiClient.post(API_ENDPOINTS.adminSchedules, scheduleData);
    return response.data;
  },

  /**
   * Update a schedule
   * @param {string} scheduleId - Schedule ID
   * @param {Object} scheduleData - Updated schedule details
   * @returns {Promise<Object>} Updated schedule
   */
  async updateSchedule(scheduleId, scheduleData) {
    const response = await apiClient.put(API_ENDPOINTS.adminScheduleById(scheduleId), scheduleData);
    return response.data;
  },

  /**
   * Delete a schedule
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteSchedule(scheduleId) {
    const response = await apiClient.delete(API_ENDPOINTS.adminScheduleById(scheduleId));
    return response.data;
  },

  /**
   * Get all bookings
   * @returns {Promise<Array>} List of all bookings
   */
  async getAllBookings() {
    const response = await apiClient.get(API_ENDPOINTS.adminBookings);
    return response.data;
  },
};
