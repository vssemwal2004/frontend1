/**
 * Razorpay Checkout Helper
 * 
 * Utility functions for integrating Razorpay payment gateway
 * with Hackwow Unified Booking Service.
 * 
 * USAGE:
 * 1. User selects seat
 * 2. Call bookingService.reserveSeat() → get reservationToken
 * 3. Call bookingService.createOrder() → get Razorpay orderId
 * 4. Call openRazorpayCheckout() → show payment modal
 * 5. On success, call bookingService.confirmBooking()
 */

/**
 * Check if Razorpay SDK is loaded
 * @returns {boolean}
 */
export const isRazorpayLoaded = () => {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
};

/**
 * Load Razorpay SDK dynamically
 * @returns {Promise<void>}
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (isRazorpayLoaded()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay Checkout Modal
 * 
 * @param {Object} options - Checkout options
 * @param {string} options.keyId - Razorpay Key ID
 * @param {string} options.orderId - Order ID from Hackwow createOrder
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency (INR)
 * @param {string} options.name - Business name
 * @param {string} options.description - Payment description
 * @param {Object} options.prefill - Prefill customer details
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onCancel - Modal closed callback
 * @returns {Promise<Object>} Payment response
 */
export const openRazorpayCheckout = async (options) => {
  // Ensure SDK is loaded
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || 'INR',
      name: options.name || 'Bus Booking',
      description: options.description || 'Ticket Booking',
      order_id: options.orderId,
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.phone || ''
      },
      notes: options.notes || {},
      theme: {
        color: options.themeColor || '#3399cc'
      },
      handler: function(response) {
        // Payment successful
        const paymentData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        };
        
        if (options.onSuccess) {
          options.onSuccess(paymentData);
        }
        resolve(paymentData);
      },
      modal: {
        ondismiss: function() {
          // User closed modal
          if (options.onCancel) {
            options.onCancel();
          }
          reject(new Error('Payment cancelled by user'));
        },
        escape: true,
        animation: true
      }
    });

    rzp.on('payment.failed', function(response) {
      const error = {
        code: response.error.code,
        description: response.error.description,
        source: response.error.source,
        step: response.error.step,
        reason: response.error.reason,
        orderId: response.error.metadata?.order_id,
        paymentId: response.error.metadata?.payment_id
      };
      
      if (options.onError) {
        options.onError(error);
      }
      reject(error);
    });

    rzp.open();
  });
};

/**
 * Complete Booking Flow
 * 
 * Helper that handles the entire 3-step booking flow:
 * 1. Reserve seat
 * 2. Create Razorpay order
 * 3. Show Razorpay checkout
 * 4. Confirm booking
 * 
 * @param {Object} params - Booking parameters
 * @param {Object} params.bookingService - Booking service instance
 * @param {Object} params.seatData - { scheduleId, journeyDate, seatNumber }
 * @param {Object} params.passengerDetails - { name, email, phone }
 * @param {Object} params.razorpayConfig - { name, description, themeColor }
 * @param {Function} params.onReserved - Called after seat reserved
 * @param {Function} params.onOrderCreated - Called after order created
 * @param {Function} params.onPaymentSuccess - Called after payment success
 * @param {Function} params.onBookingConfirmed - Called after booking confirmed
 * @param {Function} params.onError - Called on any error
 * @returns {Promise<Object>} Booking result
 */
export const completeBookingFlow = async (params) => {
  const {
    bookingService,
    seatData,
    passengerDetails,
    razorpayConfig = {},
    onReserved,
    onOrderCreated,
    onPaymentSuccess,
    onBookingConfirmed,
    onError
  } = params;

  let reservationToken = null;

  try {
    // Step 1: Reserve seat
    console.log('[Booking] Step 1: Reserving seat...');
    const reservation = await bookingService.reserveSeat(seatData);
    console.log('[Booking] Raw reservation response:', reservation);
    reservationToken = reservation?.data?.reservationToken || reservation?.reservationToken;
    console.log('[Booking] Derived reservationToken:', reservationToken);
    
    if (onReserved) {
      onReserved(reservation.data);
    }
    
    console.log('[Booking] Seat reserved:', reservationToken);

    // Step 2: Create Razorpay order
    console.log('[Booking] Step 2: Creating order...');
    const order = await bookingService.createOrder(reservationToken);
    console.log('[Booking] Raw order response:', order);
    
    if (onOrderCreated) {
      onOrderCreated(order.data);
    }
    
    console.log('[Booking] Order created:', order.data.orderId);

    // Step 3: Open Razorpay checkout
    console.log('[Booking] Step 3: Opening payment modal...');
    const paymentResponse = await openRazorpayCheckout({
      keyId: order.data.keyId,
      orderId: order.data.orderId,
      amount: order.data.amount,
      currency: order.data.currency,
      name: razorpayConfig.name || 'Bus Booking',
      description: razorpayConfig.description || `Seat ${seatData.seatNumber}`,
      themeColor: razorpayConfig.themeColor,
      prefill: passengerDetails,
      notes: {
        seatNumber: seatData.seatNumber,
        scheduleId: seatData.scheduleId
      }
    });

    if (onPaymentSuccess) {
      onPaymentSuccess(paymentResponse);
    }
    
    console.log('[Booking] Payment successful:', paymentResponse.razorpay_payment_id);

    // Step 4: Confirm booking
    console.log('[Booking] Step 4: Confirming booking...');
    const booking = await bookingService.confirmBooking({
      reservationToken,
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      passengerDetails
    });

    if (onBookingConfirmed) {
      onBookingConfirmed(booking.data);
    }
    
    console.log('[Booking] Booking confirmed:', booking.data.booking?.bookingId);

    return {
      success: true,
      booking: booking.data,
      paymentId: paymentResponse.razorpay_payment_id
    };

  } catch (error) {
    console.error('[Booking] Error:', error);

    // Try to release reservation if we got one
    if (reservationToken) {
      try {
        console.log('[Booking] Releasing reservation due to error...');
        await bookingService.releaseSeat(reservationToken);
      } catch (releaseError) {
        console.error('[Booking] Failed to release reservation:', releaseError);
      }
    }

    if (onError) {
      onError(error);
    }

    throw error;
  }
};

/**
 * Format amount for display
 * @param {number} amountInPaise - Amount in paise
 * @returns {string} Formatted amount (e.g., "₹100.00")
 */
export const formatAmount = (amountInPaise) => {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export default {
  isRazorpayLoaded,
  loadRazorpayScript,
  openRazorpayCheckout,
  completeBookingFlow,
  formatAmount
};
