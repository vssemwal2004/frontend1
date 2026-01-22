import axios from 'axios';
import { API_CONFIG, APP_CONFIG } from '@/config/apiConfig';

/**
 * Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth headers
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add APP_ID and API_KEY to headers
    config.headers['X-App-Id'] = API_CONFIG.appId;
    config.headers['X-Api-Key'] = API_CONFIG.apiKey;

    // Add JWT token if available
    const token = localStorage.getItem(APP_CONFIG.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data and redirect to login
      localStorage.removeItem(APP_CONFIG.tokenKey);
      localStorage.removeItem(APP_CONFIG.userKey);
      
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        type: 'network_error',
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
