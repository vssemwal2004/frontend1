import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { handleApiError } from '@/utils/helpers';
import { CreditCard, X, Loader2, CheckCircle2, AlertCircle, User, Mail, Phone } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSuccess, totalAmount }) => {
  const { currentSchedule, selectedSeats, completeBooking } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setProcessing(false);
      setError('');
      setPaymentSuccess(false);
      setFormData({ name: '', email: '', phone: '' });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      setError('No seats selected');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      // Complete the booking
      const result = await completeBooking(formData);
      
      setPaymentSuccess(true);
      
      // Wait a moment to show success message
      setTimeout(() => {
        onSuccess(result);
      }, 1500);
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
                Complete Booking
              </h2>
              <p className="text-sm text-neutral-600">Enter passenger details</p>
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
                <p className="text-error-800 font-medium text-sm">Booking Failed</p>
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
                Booking Confirmed!
              </h3>
              <p className="text-neutral-600">
                Check your email for booking details
              </p>
            </div>
          ) : (
            <form onSubmit={handlePayment}>
              {/* Booking Summary */}
              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Booking Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Route</span>
                    <span className="font-medium text-neutral-900">
                      {currentSchedule?.route?.from} → {currentSchedule?.route?.to}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Bus</span>
                    <span className="font-medium text-neutral-900">
                      {currentSchedule?.bus?.busName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-600">Seats</span>
                    <span className="font-medium text-neutral-900">
                      {selectedSeats.join(', ')}
                    </span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-neutral-200 flex justify-between">
                    <span className="font-semibold text-neutral-900">Total Amount</span>
                    <span className="font-bold text-primary-600 text-lg">
                      ₹{totalAmount || (currentSchedule?.fare * selectedSeats.length)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Passenger Details Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="+91 1234567890"
                    required
                  />
                </div>
              </div>

              {/* Book Button */}
              <button
                type="submit"
                disabled={processing}
                className="btn btn-success w-full flex items-center justify-center gap-2 py-3"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm & Book
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="btn btn-ghost w-full mt-3"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
