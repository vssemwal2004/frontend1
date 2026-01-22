import apiClient from './apiClient';
import { API_ENDPOINTS, APP_CONFIG } from '@/config/apiConfig';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * User login
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    const response = await apiClient.post(API_ENDPOINTS.login, credentials);
    
    if (response.data.token) {
      localStorage.setItem(APP_CONFIG.tokenKey, response.data.token);
      localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * User signup
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} User data and token
   */
  async signup(userData) {
    const response = await apiClient.post(API_ENDPOINTS.signup, userData);
    
    if (response.data.token) {
      localStorage.setItem(APP_CONFIG.tokenKey, response.data.token);
      localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * User logout
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.logout);
    } finally {
      localStorage.removeItem(APP_CONFIG.tokenKey);
      localStorage.removeItem(APP_CONFIG.userKey);
    }
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User data
   */
  getCurrentUser() {
    const userStr = localStorage.getItem(APP_CONFIG.userKey);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get auth token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(APP_CONFIG.tokenKey);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },
};
