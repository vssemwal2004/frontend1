/**
 * Hackwow Client Service
 * 
 * Adapter layer for integrating with Hackwow Unified Booking Service.
 * 
 * This service handles:
 * - Authentication with Hackwow (APP_ID + API_KEY)
 * - External user identification (no Hackwow registration required)
 * - Seat reservation (with Redis locking)
 * - Razorpay order creation
 * - Payment confirmation
 * - Booking finalization
 * 
 * USAGE:
 * Replace direct booking logic with calls to this service.
 * The existing frontend and most backend code remains unchanged.
 * 
 * REQUIREMENTS:
 * Add to your .env:
 *   HACKWOW_API_URL=http://localhost:5000  (or production URL)
 *   HACKWOW_APP_ID=APP-xxx
 *   HACKWOW_API_KEY=sk_live_xxx
 */

const axios = require('axios');

class HackwowClient {
  constructor() {
    this.baseUrl = process.env.HACKWOW_API_URL || 'http://localhost:5000';
    this.appId = process.env.HACKWOW_APP_ID;
    this.apiKey = process.env.HACKWOW_API_KEY;
    
    if (!this.appId || !this.apiKey) {
      console.warn('[HACKWOW] Warning: HACKWOW_APP_ID or HACKWOW_API_KEY not configured');
    }

    // Create axios instance with default headers
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': this.appId,
        'x-api-key': this.apiKey
      }
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[HACKWOW] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        console.error(`[HACKWOW] Error: ${error.response?.status || error.code} - ${error.response?.data?.message || error.message}`);
        throw error;
      }
    );
    
    // Current external user context
    this.externalUser = null;
  }

  /**
   * Set external user context
   * Call this before any user-specific operations
   * 
   * For apps that manage their own users (like Bus Ticketing),
   * this passes user info to Hackwow without requiring Hackwow registration.
   * 
   * @param {Object} user - { id, email, name } from your system
   */
  setExternalUser(user) {
    if (user) {
      this.externalUser = {
        id: user._id?.toString() || user.id?.toString(),
        email: user.email,
        name: user.name
      };
    } else {
      this.externalUser = null;
    }
  }

  /**
   * Set user authorization token (legacy - for Hackwow-registered users)
   * @param {String} token - User's JWT token from Hackwow
   */
  setUserToken(token) {
    this.userToken = token;
  }

  /**
   * Get headers with user identification
   * @private
   */
  getHeaders() {
    const headers = {};
    
    // If we have a Hackwow token, use it
    if (this.userToken) {
      headers['Authorization'] = `Bearer ${this.userToken}`;
    }
    
    // If we have external user info, send it in headers
    if (this.externalUser) {
      headers['x-external-user-id'] = this.externalUser.id;
      headers['x-external-user-email'] = this.externalUser.email || '';
      headers['x-external-user-name'] = this.externalUser.name || '';
    }
    
    return { headers };
  }

  // ==========================================
  // USER AUTHENTICATION (via Hackwow)
  // ==========================================

  /**
   * Register user with Hackwow
   * This creates a user under YOUR app's tenant
   * 
   * @param {Object} userData - { name, email, password, phone? }
   * @returns {Object} { token, user }
   */
  async signup(userData) {
    try {
      const response = await this.client.post('/auth/signup', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Signup failed');
    }
  }

  /**
   * Login user via Hackwow
   * 
   * @param {Object} credentials - { email, password }
   * @returns {Object} { token, user }
   */
  async login(credentials) {
    try {
      const response = await this.client.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Login failed');
    }
  }

  // ==========================================
  // SEAT MANAGEMENT
  // ==========================================

  /**
   * Sync seats to Hackwow
   * Call this when creating/updating seats in your system
   * 
   * @param {Array} seats - Array of seat objects
   * @param {String} entityId - Unique ID for the entity (schedule+date combo)
   * @returns {Object} Sync result
   */
  async syncSeats(seats, entityId) {
    try {
      const response = await this.client.post('/admin/sync-seats', {
        entityId,
        seats: seats.map(seat => ({
          seatNumber: seat.seatNumber || seat.number,
          price: seat.price || seat.fare,
          status: 'AVAILABLE',
          metadata: seat.metadata || {}
        }))
      }, this.getHeaders());
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Seat sync failed');
    }
  }

  /**
   * Get available seats from Hackwow
   * 
   * @param {String} entityId - Entity identifier
   * @returns {Array} Available seats
   */
  async getAvailableSeats(entityId) {
    try {
      const response = await this.client.get('/seats', {
        params: { entityId },
        ...this.getHeaders()
      });
      const seats = response.data.seats || response.data.data?.seats || response.data;
      // Always return an array
      return Array.isArray(seats) ? seats : [];
    } catch (error) {
      throw this.formatError(error, 'Get seats failed');
    }
  }

  /**
   * Get all seats with their lock status
   * This includes both available and locked seats (useful for showing grey locked seats in UI)
   * 
   * @param {String} entityId - Entity identifier
   * @returns {Array} All seats with isLocked and lockExpiresAt properties
   */
  async getAllSeatsWithStatus(entityId) {
    try {
      const response = await this.client.get('/seats/status', {
        params: { entityId },
        ...this.getHeaders()
      });
      const seats = response.data.seats || response.data.data?.seats || response.data;
      // Always return an array
      return Array.isArray(seats) ? seats : [];
    } catch (error) {
      throw this.formatError(error, 'Get seat status failed');
    }
  }

  // ==========================================
  // BOOKING FLOW
  // ==========================================

  /**
   * STEP 1: Reserve Seat
   * 
   * Acquires a Redis lock on the seat for 2 minutes.
   * No one else can book this seat while lock is held.
   * 
   * @param {String} seatId - Hackwow seat ID
   * @returns {Object} { reservationToken, expiresAt, seat, ttl }
   */
  async reserveSeat(seatId) {
    try {
      const response = await this.client.post('/reserve-seat', 
        { seatId },
        this.getHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Seat reservation failed');
    }
  }

  /**
   * STEP 2: Create Razorpay Order
   * 
   * Creates a Razorpay order for the reserved seat.
   * IDEMPOTENT: Same reservationToken always returns same order.
   * 
   * @param {String} reservationToken - From reserveSeat()
   * @param {Number} amount - Amount in INR
   * @param {Object} metadata - Additional data
   * @returns {Object} { orderId, amount, currency, keyId }
   */
  async createRazorpayOrder(reservationToken, amount, metadata = {}) {
    try {
      const response = await this.client.post('/create-order', {
        reservationToken,
        amount,
        currency: 'INR',
        metadata
      }, this.getHeaders());
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Order creation failed');
    }
  }

  /**
   * STEP 3: Confirm Booking
   * 
   * Called after Razorpay payment is successful.
   * Verifies payment and finalizes booking.
   * 
   * @param {Object} confirmData
   * @param {String} confirmData.reservationToken - From reserveSeat()
   * @param {String} confirmData.razorpay_order_id - From Razorpay
   * @param {String} confirmData.razorpay_payment_id - From Razorpay
   * @param {String} confirmData.razorpay_signature - From Razorpay
   * @returns {Object} { bookingId, booking, seat }
   */
  async confirmBooking(confirmData) {
    try {
      const response = await this.client.post('/confirm-booking', {
        reservationToken: confirmData.reservationToken,
        razorpay_order_id: confirmData.razorpay_order_id,
        razorpay_payment_id: confirmData.razorpay_payment_id,
        razorpay_signature: confirmData.razorpay_signature
      }, this.getHeaders());
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Booking confirmation failed');
    }
  }

  /**
   * Release Seat Reservation
   * 
   * Call this if user cancels or times out.
   * Releases the Redis lock so others can book.
   * 
   * @param {String} reservationToken - From reserveSeat()
   * @returns {Boolean} Success
   */
  async releaseSeat(reservationToken) {
    try {
      const response = await this.client.post('/release-seat', 
        { reservationToken },
        this.getHeaders()
      );
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Seat release failed');
    }
  }

  /**
   * Get User Bookings
   * 
   * @param {Number} page - Page number
   * @param {Number} limit - Results per page
   * @returns {Object} { bookings, pagination }
   */
  async getMyBookings(page = 1, limit = 10) {
    try {
      const response = await this.client.get('/my-bookings', {
        params: { page, limit },
        ...this.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error, 'Get bookings failed');
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Health check
   * @returns {Boolean} Hackwow is reachable
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format error for consistent error handling
   * @private
   */
  formatError(error, defaultMessage) {
    const message = error.response?.data?.message || error.message || defaultMessage;
    const code = error.response?.status || 500;
    
    const formattedError = new Error(message);
    formattedError.statusCode = code;
    formattedError.isHackwowError = true;
    formattedError.originalError = error;
    
    return formattedError;
  }

  /**
   * Generate entity ID for bus booking
   * Combines schedule ID and journey date for uniqueness
   * 
   * @param {String} scheduleId - Bus schedule ID
   * @param {Date|String} journeyDate - Journey date
   * @returns {String} Entity ID
   */
  static generateEntityId(scheduleId, journeyDate) {
    const date = new Date(journeyDate);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `bus-${scheduleId}-${dateStr}`;
  }

  /**
   * Generate seat ID mapping
   * Maps your local seat format to Hackwow seat ID
   * 
   * @param {String} scheduleId - Schedule ID  
   * @param {String} journeyDate - Journey date
   * @param {String} seatNumber - Seat number
   * @returns {String} Combined seat identifier
   */
  static generateSeatKey(scheduleId, journeyDate, seatNumber) {
    const entityId = this.generateEntityId(scheduleId, journeyDate);
    return `${entityId}:${seatNumber}`;
  }
}

// Export singleton instance
module.exports = new HackwowClient();

// Also export class for testing
module.exports.HackwowClient = HackwowClient;
