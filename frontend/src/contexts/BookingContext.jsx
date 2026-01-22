import { createContext, useContext, useState, useCallback } from 'react';
import { bookingService } from '@/services/bookingService';
import { eventService } from '@/services/eventService';
import { handleApiError } from '@/utils/helpers';
import { APP_CONFIG } from '@/config/apiConfig';

const BookingContext = createContext(null);

/**
 * Booking Context Provider
 * Manages booking state and seat selection
 */
export const BookingProvider = ({ children }) => {
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [journeyDate, setJourneyDate] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load schedule details and seat layout
   * @param {string} scheduleId - Schedule ID
   * @param {string} date - Journey date (YYYY-MM-DD)
   */
  const loadSchedule = async (scheduleId, date) => {
    try {
      setLoading(true);
      setError(null);
      setJourneyDate(date);

      const layoutData = await eventService.getBusSeats(scheduleId, date);

      if (layoutData.success && layoutData.data) {
        setCurrentSchedule(layoutData.data.schedule);
        setSeatLayout(layoutData.data.seatLayout);
        setBookedSeats(layoutData.data.bookedSeats || []);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle seat selection
   * @param {string} seatNumber - Seat number to toggle
   */
  const toggleSeatSelection = (seatNumber) => {
    // Check if seat is already booked
    if (bookedSeats.includes(seatNumber)) {
      setError('This seat is already booked');
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        // Deselect seat
        return prev.filter(s => s !== seatNumber);
      } else {
        // Select seat
        return [...prev, seatNumber];
      }
    });
    setError(null);
  };

  /**
   * Clear seat selection
   */
  const clearSeatSelection = () => {
    setSelectedSeats([]);
    setError(null);
  };

  /**
   * Complete booking
   * @param {Object} passengerDetails - Passenger information
   * @param {string} passengerDetails.name - Passenger name
   * @param {string} passengerDetails.email - Passenger email
   * @param {string} passengerDetails.phone - Passenger phone
   */
  const completeBooking = async (passengerDetails) => {
    if (!currentSchedule || selectedSeats.length === 0) {
      throw new Error('Please select at least one seat');
    }

    if (!journeyDate) {
      throw new Error('Journey date is required');
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        scheduleId: currentSchedule._id,
        journeyDate,
        seats: selectedSeats,
        passengerDetails
      };

      const response = await bookingService.createBooking(bookingData);

      // Clear booking state on success
      setSelectedSeats([]);
      
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear all booking state
   */
  const clearBooking = useCallback(() => {
    setCurrentSchedule(null);
    setSeatLayout(null);
    setSelectedSeats([]);
    setJourneyDate(null);
    setBookedSeats([]);
    setError(null);
  }, []);

  const value = {
    currentSchedule,
    seatLayout,
    selectedSeats,
    journeyDate,
    bookedSeats,
    loading,
    error,
    loadSchedule,
    toggleSeatSelection,
    clearSeatSelection,
    completeBooking,
    clearBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

/**
 * Custom hook to use booking context
 */
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
