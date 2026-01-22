import { createContext, useContext, useState, useCallback } from 'react';
import { bookingService } from '@/services/bookingService';
import { eventService } from '@/services/eventService';
import { handleApiError } from '@/utils/helpers';
import { APP_CONFIG } from '@/config/apiConfig';
import { completeBookingFlow } from '@/utils/razorpayHelper';

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
  const [lockedSeats, setLockedSeats] = useState([]); // Temporarily reserved seats (Redis locks)
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
        setLockedSeats(layoutData.data.lockedSeats || []); // Get locked seats from response
        
        // Debug logging
        console.log('[BOOKING] Seat data loaded:', {
          totalSeats: layoutData.data.schedule?.bus?.totalSeats,
          bookedSeats: layoutData.data.bookedSeats,
          bookedSeatsCount: layoutData.data.bookedSeats?.length || 0,
          lockedSeats: layoutData.data.lockedSeats,
          lockedSeatsCount: layoutData.data.lockedSeats?.length || 0,
          availableSeats: layoutData.data.availableSeats
        });
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
    // Convert to both string and number for comparison
    const seatNumStr = String(seatNumber);
    const seatNumInt = Number(seatNumber);
    
    // Check if seat is already booked
    if (bookedSeats.includes(seatNumStr) || bookedSeats.includes(seatNumInt)) {
      setError('This seat is already booked');
      return;
    }

    // Check if seat is temporarily locked (reserved by someone else)
    const lockedSeat = lockedSeats.find(ls => 
      String(ls.seatNumber) === seatNumStr || Number(ls.seatNumber) === seatNumInt
    );
    if (lockedSeat) {
      setError('This seat is temporarily reserved by another user. Please wait or choose another seat.');
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
   * Complete booking with Hackwow 3-step flow
   * 1. Reserve seat (2 min lock)
   * 2. Create Razorpay order
   * 3. Show Razorpay checkout → Confirm booking
   * 
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

    // Currently only supports single seat booking
    // TODO: Support multiple seats by calling reserveSeat for each
    if (selectedSeats.length > 1) {
      throw new Error('Multiple seat booking not yet supported. Please select one seat at a time.');
    }

    const seatNumber = selectedSeats[0];

    try {
      setLoading(true);
      setError(null);

      const seatData = {
        scheduleId: currentSchedule._id,
        journeyDate,
        seatNumber
      };

      const razorpayConfig = {
        name: 'Bus Booking System',
        description: `${currentSchedule.route?.from} → ${currentSchedule.route?.to} | Seat ${seatNumber}`,
        themeColor: '#3399cc'
      };

      // Use the 3-step Hackwow booking flow with Razorpay
      const result = await completeBookingFlow({
        bookingService,
        seatData,
        passengerDetails,
        razorpayConfig,
        onReserved: (reservation) => {
          console.log('[Booking] Seat reserved:', reservation.reservationToken);
        },
        onOrderCreated: (order) => {
          console.log('[Booking] Order created:', order.orderId);
        },
        onPaymentSuccess: (payment) => {
          console.log('[Booking] Payment successful:', payment.razorpay_payment_id);
        },
        onBookingConfirmed: (booking) => {
          console.log('[Booking] Booking confirmed:', booking.booking?.bookingId);
        },
        onError: (err) => {
          console.error('[Booking] Error:', err);
        }
      });

      // Clear booking state on success
      setSelectedSeats([]);
      
      return result;
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
    setLockedSeats([]);
    setError(null);
  }, []);

  const value = {
    currentSchedule,
    seatLayout,
    selectedSeats,
    journeyDate,
    bookedSeats,
    lockedSeats, // Add locked seats to context
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
