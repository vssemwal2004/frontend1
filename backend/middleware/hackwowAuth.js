/**
 * Hackwow Token Sync Middleware
 * 
 * This middleware handles authentication bridging between
 * the Bus Ticketing system and Hackwow Unified Booking Service.
 * 
 * STRATEGIES:
 * 
 * 1. PROXY MODE (Recommended for new integrations):
 *    - Users authenticate directly with Hackwow
 *    - Bus backend just passes through the token
 *    - Single source of truth for users
 * 
 * 2. BRIDGE MODE (For existing systems):
 *    - Users authenticate with Bus backend
 *    - Backend syncs user to Hackwow
 *    - Backend gets Hackwow token for API calls
 * 
 * Currently using BRIDGE MODE for minimal frontend changes.
 */

const hackwowClient = require('../services/hackwowClient');

// Cache Hackwow tokens (user email → token)
// In production, use Redis
const tokenCache = new Map();

/**
 * Sync user with Hackwow and get token
 * 
 * This middleware runs after local auth (protect middleware)
 * and ensures we have a Hackwow token for the user.
 */
const syncHackwowToken = async (req, res, next) => {
  // Skip if Hackwow is disabled
  if (process.env.USE_HACKWOW !== 'true') {
    return next();
  }

  // Skip if no user (not authenticated locally)
  if (!req.user) {
    return next();
  }

  try {
    const userEmail = req.user.email;
    
    // Check cache first
    if (tokenCache.has(userEmail)) {
      const cached = tokenCache.get(userEmail);
      
      // Check if token is still valid (1 hour cache)
      if (cached.expires > Date.now()) {
        req.hackwowToken = cached.token;
        hackwowClient.setUserToken(cached.token);
        return next();
      }
    }

    // Try to login to Hackwow
    // Note: This assumes user exists in Hackwow with same credentials
    // In production, implement proper user sync
    try {
      const loginResponse = await hackwowClient.login({
        email: userEmail,
        password: req.user.password || 'synced_user' // Use a default for synced users
      });

      const token = loginResponse.token;
      
      // Cache the token
      tokenCache.set(userEmail, {
        token,
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      });

      req.hackwowToken = token;
      hackwowClient.setUserToken(token);
      
    } catch (loginError) {
      // User doesn't exist in Hackwow - create them
      if (loginError.statusCode === 401 || loginError.statusCode === 404) {
        try {
          const signupResponse = await hackwowClient.signup({
            name: req.user.name,
            email: userEmail,
            password: 'synced_user_' + Date.now(), // Generate unique password
            phone: req.user.phone
          });

          const token = signupResponse.token;
          
          // Cache the token
          tokenCache.set(userEmail, {
            token,
            expires: Date.now() + (60 * 60 * 1000)
          });

          req.hackwowToken = token;
          hackwowClient.setUserToken(token);
          
        } catch (signupError) {
          console.error('[Hackwow] Failed to sync user:', signupError.message);
          // Continue without Hackwow token - will fail later on booking calls
        }
      } else {
        console.error('[Hackwow] Login error:', loginError.message);
      }
    }

    next();
    
  } catch (error) {
    console.error('[Hackwow] Token sync error:', error.message);
    next(); // Continue anyway - booking calls will fail with proper error
  }
};

/**
 * Clear cached token for a user
 * Call this on logout
 */
const clearHackwowToken = (email) => {
  tokenCache.delete(email);
};

/**
 * Check Hackwow health
 */
const checkHackwowHealth = async () => {
  try {
    return await hackwowClient.healthCheck();
  } catch (error) {
    return false;
  }
};

module.exports = {
  syncHackwowToken,
  clearHackwowToken,
  checkHackwowHealth
};
