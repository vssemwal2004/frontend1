import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { handleApiError } from '@/utils/helpers';

const AuthContext = createContext(null);

/**
 * Authentication Context Provider
 * Manages user authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const userStr = localStorage.getItem('user_data');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user (temporary mock)
   * @param {Object} credentials - User credentials
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const mockUser = {
        name: credentials.email?.split('@')[0] || 'Guest',
        email: credentials.email || 'guest@example.com'
      };
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup new user (temporary mock)
   * @param {Object} userData - User registration data
   */
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const mockUser = {
        name: userData.name || 'Guest',
        email: userData.email || 'guest@example.com'
      };
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user (temporary mock)
   */
  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('user_data');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
