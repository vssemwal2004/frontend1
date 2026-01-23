import { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const [seatReservations, setSeatReservations] = useState({}); // Map: seatNumber -> reservationToken
  const [seatTimers, setSeatTimers] = useState({}); // Map: seatNumber -> timeoutId for auto-release
  const [journeyDate, setJourneyDate] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]); // Temporarily reserved seats (Redis locks)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-refresh seat status every 10 seconds to show real-time changes
  useEffect(() => {
    if (!currentSchedule || !journeyDate) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log('[Booking] Auto-refreshing seat status...');
        const layoutData = await eventService.getBusSeats(currentSchedule._id, journeyDate);
        
        if (layoutData.success && layoutData.data) {
          setLockedSeats(layoutData.data.lockedSeats || []);
          setBookedSeats(layoutData.data.bookedSeats || []);
        }
      } catch (err) {
        // Silent fail - don't interrupt user experience
        console.error('[Booking] Auto-refresh failed:', err);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [currentSchedule, journeyDate]);

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
   * Toggle seat selection with Hackwow API calls
   * @param {string} seatNumber - Seat number to toggle
   */
  const toggleSeatSelection = async (seatNumber) => {
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

    const isCurrentlySelected = selectedSeats.includes(seatNumber);

    if (isCurrentlySelected) {
      // User is DESELECTING - release the seat lock
      const reservationToken = seatReservations[seatNumber];
      const timerId = seatTimers[seatNumber];
      
      console.log(`[Booking] User deselecting seat ${seatNumber}`, { reservationToken, hasTimer: !!timerId });
      
      // Clear auto-release timer if exists
      if (timerId) {
        clearTimeout(timerId);
        console.log(`[Booking] Cleared auto-release timer for seat ${seatNumber}`);
      }
      
      if (reservationToken) {
        try {
          await bookingService.releaseSeat(reservationToken);
          console.log(`[Booking] Released seat ${seatNumber} from Hackwow`);
        } catch (err) {
          // 409 means seat is already booked - this is actually fine
          if (err.response?.status === 409) {
            console.log(`[Booking] Seat ${seatNumber} already confirmed/booked - skipping release`);
          } else {
            console.error('[Booking] Failed to release seat:', err);
          }
          // Continue with local cleanup regardless
        }
      }
      
      // Remove from selected seats, reservations, and timers
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
      setSeatReservations(prev => {
        const updated = { ...prev };
        delete updated[seatNumber];
        return updated;
      });
      setSeatTimers(prev => {
        const updated = { ...prev };
        delete updated[seatNumber];
        return updated;
      });
      setError(null);
      
      // Refresh to show seat as available to others
      setTimeout(() => loadSchedule(currentSchedule._id, journeyDate), 500);
    } else {
      // User is SELECTING - reserve the seat (temporary lock)
      try {
        setLoading(true);
        const response = await bookingService.reserveSeat({
          scheduleId: currentSchedule._id,
          journeyDate,
          seatNumber
        });
        
        console.log(`[Booking] Reserved seat ${seatNumber}, token:`, response.reservationToken);
        
        // Store reservation token for later release
        setSeatReservations(prev => ({
          ...prev,
          [seatNumber]: response.reservationToken
        }));
        
        // Add to selected seats
        setSelectedSeats(prev => [...prev, seatNumber]);
        setError(null);
        
        // Auto-release after 2 minutes (same as backend TTL)
        const timerId = setTimeout(async () => {
          console.log(`[Booking] Auto-releasing seat ${seatNumber} after 2 minutes`);
          setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
          setSeatReservations(prev => {
            const updated = { ...prev };
            delete updated[seatNumber];
            return updated;
          });
          setSeatTimers(prev => {
            const updated = { ...prev };
            delete updated[seatNumber];
            return updated;
          });
          setError('Your seat selection expired. Please select again.');
          
          // Refresh seat layout to update colors (green for everyone)
          try {
            await loadSchedule(currentSchedule._id, journeyDate);
          } catch (err) {
            console.error('[Booking] Failed to refresh after auto-release:', err);
          }
        }, 120000); // 2 minutes = 120000ms
        
        setSeatTimers(prev => ({
          ...prev,
          [seatNumber]: timerId
        }));
        
        // Refresh to show seat as locked to others
        setTimeout(() => loadSchedule(currentSchedule._id, journeyDate), 500);
      } catch (err) {
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        console.error('[Booking] Failed to reserve seat:', err);
      } finally {
        setLoading(false);
      }
    }
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
   * 1. Reserve seat (ALREADY DONE on seat click)
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
    if (selectedSeats.length > 1) {
      throw new Error('Multiple seat booking not yet supported. Please select one seat at a time.');
    }

    const seatNumber = selectedSeats[0];
    const reservationToken = seatReservations[seatNumber];

    console.log('[Booking] Payment flow starting:', {
      seatNumber,
      reservationToken,
      allReservations: seatReservations,
      selectedSeats
    });

    if (!reservationToken) {
      console.error('[Booking] Reservation token missing!', {
        seatNumber,
        seatReservations,
        selectedSeats
      });
      throw new Error('Reservation token not found. Please reselect the seat.');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[Booking] Step 1: Using existing reservation token:', reservationToken);

      // Step 2: Create Razorpay order with existing reservation
      const orderResponse = await bookingService.createOrder(reservationToken);
      console.log('[Booking] Step 2: Order created:', orderResponse);

      // Validate Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
      }

      // Extract order data from response (handle nested structure)
      const orderData = orderResponse.data || orderResponse;
      const razorpayKey = orderData.keyId || orderData.razorpayKeyId || orderResponse.keyId;
      
      if (!razorpayKey) {
        console.error('[Booking] Missing Razorpay key in response:', orderResponse);
        throw new Error('Payment configuration error. Please contact support.');
      }

      console.log('[Booking] Razorpay key:', razorpayKey);
      console.log('[Booking] Order ID:', orderData.orderId || orderResponse.orderId);

      // Step 3: Show Razorpay checkout
      return new Promise((resolve, reject) => {
        const options = {
          key: razorpayKey,
          amount: orderData.amount || orderResponse.amount,
          currency: orderData.currency || orderResponse.currency || 'INR',
          name: 'Bus Booking System',
          description: `${currentSchedule.route?.from} → ${currentSchedule.route?.to} | Seat ${seatNumber}`,
          order_id: orderData.orderId || orderResponse.orderId,
          handler: async function (response) {
            try {
              console.log('[Booking] Step 4: Payment successful, confirming booking...');
              
              // Step 4: Confirm booking after payment
              const confirmResponse = await bookingService.confirmBooking({
                reservationToken,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                passengerDetails
              });

              console.log('[Booking] Booking confirmed:', confirmResponse);

              // Clear the timer since booking is complete
              const timerId = seatTimers[seatNumber];
              if (timerId) {
                clearTimeout(timerId);
              }

              // Clear selections
              setSelectedSeats([]);
              setSeatReservations({});
              setSeatTimers({});
              setError(null);

              resolve(confirmResponse);
            } catch (err) {
              console.error('[Booking] Confirmation failed:', err);
              
              // Release seat if confirmation fails
              await releaseSeatOnFailure(seatNumber, reservationToken);
              
              reject(err);
            }
          },
          modal: {
            ondismiss: async function() {
              console.log('[Booking] Payment cancelled by user');
              
              // Release seat immediately when payment is cancelled
              await releaseSeatOnFailure(seatNumber, reservationToken);
              
              reject(new Error('Payment cancelled by user'));
            }
          },
          theme: {
            color: '#3399cc'
          },
          prefill: {
            name: passengerDetails.name,
            email: passengerDetails.email,
            contact: passengerDetails.phone
          }
        };

        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            console.error('[Booking] Payment failed:', response.error);
            reject(new Error(response.error.description || 'Payment failed'));
          });
          rzp.open();
        } catch (rzpError) {
          console.error('[Booking] Razorpay initialization error:', rzpError);
          reject(new Error('Failed to initialize payment gateway. Please try again.'));
        }
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      // Release seat on any error (order creation failed, etc.)
      const reservationToken = seatReservations[seatNumber];
      if (reservationToken) {
        await releaseSeatOnFailure(seatNumber, reservationToken);
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper function to release seat when payment/booking fails
   * @private
   */
  const releaseSeatOnFailure = async (seatNumber, reservationToken) => {
    try {
      console.log(`[Booking] Releasing seat ${seatNumber} due to payment failure/cancellation`);
      
      // Clear timer
      const timerId = seatTimers[seatNumber];
      if (timerId) {
        clearTimeout(timerId);
      }
      
      // Call backend to release
      if (reservationToken) {
        try {
          await bookingService.releaseSeat(reservationToken);
          console.log(`[Booking] Seat ${seatNumber} released from Hackwow`);
        } catch (releaseApiErr) {
          // 409 means seat is already booked/confirmed - this is fine
          if (releaseApiErr.response?.status === 409) {
            console.log(`[Booking] Seat ${seatNumber} already booked/confirmed - no need to release`);
          } else {
            console.error('[Booking] API release failed:', releaseApiErr.message);
          }
          // Don't throw - continue with local cleanup
        }
      }
      
      // Clear local state
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
      setSeatReservations(prev => {
        const updated = { ...prev };
        delete updated[seatNumber];
        return updated;
      });
      setSeatTimers(prev => {
        const updated = { ...prev };
        delete updated[seatNumber];
        return updated;
      });
      
      // Refresh to show current seat status
      try {
        await loadSchedule(currentSchedule._id, journeyDate);
      } catch (loadErr) {
        console.error('[Booking] Failed to refresh seat layout:', loadErr);
      }
      
      console.log(`[Booking] Local state cleaned for seat ${seatNumber}`);
    } catch (releaseErr) {
      console.error('[Booking] Failed to release seat:', releaseErr);
      // Don't throw - just log the error
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
