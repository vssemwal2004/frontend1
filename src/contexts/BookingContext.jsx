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
  const [currentEvent, setCurrentEvent] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load event details and seat layout
   * @param {string} eventId - Event ID
   */
  const loadEvent = async (eventId) => {
    try {
      setLoading(true);
      setError(null);

      const [eventData, layoutData] = await Promise.all([
        eventService.getEventById(eventId),
        eventService.getSeatLayout(eventId),
      ]);

      setCurrentEvent(eventData);
      setSeatLayout(layoutData);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select a seat and reserve it
   * @param {Object} seat - Seat object
   */
  const selectSeat = async (seat) => {
    if (!currentEvent) {
      throw new Error('No event selected');
    }

    // If already selected, deselect
    if (selectedSeat?.id === seat.id) {
      await releaseSeat();
      return;
    }

    // If another seat is selected, release it first
    if (selectedSeat) {
      await releaseSeat();
    }

    try {
      setLoading(true);
      setError(null);

      const reservationData = await bookingService.reserveSeat({
        eventId: currentEvent.id,
        seatId: seat.id,
      });

      setSelectedSeat(seat);
      setReservation(reservationData);
      setTimeRemaining(APP_CONFIG.seatLockDuration);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Release the currently reserved seat
   */
  const releaseSeat = async () => {
    if (!reservation) return;

    try {
      await bookingService.releaseSeat({
        reservationId: reservation.id,
      });

      setSelectedSeat(null);
      setReservation(null);
      setTimeRemaining(null);
    } catch (err) {
      console.error('Release seat error:', err);
    }
  };

  /**
   * Complete booking after payment
   * @param {Object} paymentData - Payment confirmation data
   */
  const completeBooking = async (paymentData) => {
    if (!reservation) {
      throw new Error('No active reservation');
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData = await bookingService.createBooking({
        eventId: currentEvent.id,
        seatId: selectedSeat.id,
        reservationId: reservation.id,
      });

      const confirmedBooking = await bookingService.confirmBooking({
        bookingId: bookingData.id,
        paymentId: paymentData.paymentId,
      });

      // Clear booking state
      setSelectedSeat(null);
      setReservation(null);
      setTimeRemaining(null);

      return confirmedBooking;
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
    setCurrentEvent(null);
    setSeatLayout(null);
    setSelectedSeat(null);
    setReservation(null);
    setTimeRemaining(null);
    setError(null);
  }, []);

  const value = {
    currentEvent,
    seatLayout,
    selectedSeat,
    reservation,
    timeRemaining,
    loading,
    error,
    loadEvent,
    selectSeat,
    releaseSeat,
    completeBooking,
    clearBooking,
    setTimeRemaining,
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
