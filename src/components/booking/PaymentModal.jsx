import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { paymentService } from '@/services/paymentService';
import { formatCurrency, handleApiError } from '@/utils/helpers';
import { CreditCard, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentEvent, selectedSeat, completeBooking, timeRemaining } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProcessing(false);
      setError('');
      setPaymentSuccess(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!selectedSeat || !currentEvent) return;

    try {
      setProcessing(true);
      setError('');

      // Simulate payment process
      const paymentResult = await paymentService.simulatePayment(selectedSeat.price);

      if (paymentResult.success) {
        // Complete the booking
        const booking = await completeBooking(paymentResult);
        
        setPaymentSuccess(true);
        
        // Wait a moment to show success message
        setTimeout(() => {
          onSuccess(booking);
        }, 1500);
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      setError(handleApiError(err));
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900">
                Complete Payment
              </h2>
              <p className="text-sm text-neutral-600">Secure payment simulation</p>
            </div>
          </div>
          {!processing && !paymentSuccess && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-error-800 font-medium text-sm">Payment Failed</p>
                <p className="text-error-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12 text-success-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-neutral-600">
                Redirecting to confirmation...
              </p>
            </div>
          ) : (
            <>
              {/* Booking Summary */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Booking Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Event</span>
                    <span className="font-medium text-neutral-900">
                      {currentEvent?.title}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Seat</span>
                    <span className="font-medium text-neutral-900">
                      {selectedSeat?.row}-{selectedSeat?.number}
                    </span>
                  </div>

                  {selectedSeat?.type === 'vip' && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Type</span>
                      <span className="badge badge-primary">VIP</span>
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-neutral-200 flex justify-between">
                    <span className="font-semibold text-neutral-900">Total Amount</span>
                    <span className="font-bold text-primary-600 text-lg">
                      {formatCurrency(selectedSeat?.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Warning */}
              {timeRemaining && timeRemaining <= 30 && (
                <div className="mb-6 p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0" />
                  <p className="text-warning-800 text-sm font-medium">
                    Only {timeRemaining} seconds remaining!
                  </p>
                </div>
              )}

              {/* Payment Info */}
              <div className="mb-6">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <p className="text-sm text-primary-800 mb-2">
                    <strong>Demo Mode:</strong> This is a simulated payment.
                  </p>
                  <p className="text-xs text-primary-700">
                    In production, this would integrate with real payment gateways like Stripe,
                    PayPal, or Razorpay.
                  </p>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="btn btn-success w-full flex items-center justify-center gap-2 py-3"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay {formatCurrency(selectedSeat?.price)}
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={processing}
                className="btn btn-ghost w-full mt-3"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
