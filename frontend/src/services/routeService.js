import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/**
 * Route Service
 * Handles route-related API calls
 */
export const routeService = {
  /**
   * Get all unique cities from routes
   * @returns {Promise<Object>} Object with sources and destinations arrays
   */
  async getAvailableCities() {
    const response = await apiClient.get('/routes/cities');
    return response.data;
  },

  /**
   * Get all active routes
   * @returns {Promise<Array>} List of active routes
   */
  async getAllRoutes() {
    const response = await apiClient.get('/routes');
    return response.data;
  },
};

export default routeService;
