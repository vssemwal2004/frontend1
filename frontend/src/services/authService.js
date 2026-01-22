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
    // Don't store token yet, wait for OTP verification
    return response.data;
  },

  /**
   * User signup/register
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.phone - User phone (optional)
   * @returns {Promise<Object>} User data and token
   */
  async signup(userData) {
    const response = await apiClient.post(API_ENDPOINTS.register, userData);
    // Don't store token yet, wait for OTP verification
    return response.data;
  },

  /**
   * Verify OTP
   * @param {string} email - User email
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<Object>} User data and token
   */
  async verifyOTP(email, otp) {
    const response = await apiClient.post(API_ENDPOINTS.verifyOTP, { email, otp });
    
    if (response.data.token) {
      localStorage.setItem(APP_CONFIG.tokenKey, response.data.token);
      localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Resend OTP
   * @param {string} email - User email
   * @returns {Promise<Object>} Response
   */
  async resendOTP(email) {
    const response = await apiClient.post(API_ENDPOINTS.resendOTP, { email });
    return response.data;
  },

  /**
   * User logout (client-side only)
   * @returns {void}
   */
  logout() {
    localStorage.removeItem(APP_CONFIG.tokenKey);
    localStorage.removeItem(APP_CONFIG.userKey);
  },

  /**
   * Get current user profile from backend
   * @returns {Promise<Object>} User data
   */
  async getMe() {
    const response = await apiClient.get(API_ENDPOINTS.getMe);
    if (response.data.success && response.data.data) {
      localStorage.setItem(APP_CONFIG.userKey, JSON.stringify(response.data.data));
      return response.data.data;
    }
    return response.data;
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
