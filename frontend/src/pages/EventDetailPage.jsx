import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { formatDate, formatCurrency, handleApiError } from '@/utils/helpers';
import { Calendar, MapPin, Clock, Loader2, ArrowLeft, Users, Bus } from 'lucide-react';
import SeatSelection from '@/components/booking/SeatSelection';
import CountdownTimer from '@/components/booking/CountdownTimer';
import PaymentModal from '@/components/booking/PaymentModal';

const EventDetailPage = () => {
  const { id } = useParams(); // scheduleId
  const location = useLocation();
  const navigate = useNavigate();
  const { currentSchedule, loadSchedule, loading, error, selectedSeats, completeBooking } = useBooking();
  const [showPayment, setShowPayment] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [travelDate, setTravelDate] = useState('');

  useEffect(() => {
    // Get schedule from navigation state or load it
    if (location.state?.schedule) {
      setSchedule(location.state.schedule);
      setTravelDate(location.state.date);
    }
    
    // Load full schedule details with seat availability
    if (id && location.state?.date) {
      loadSchedule(id, location.state.date).catch((err) => {
        console.error('Failed to load schedule:', err);
      });
    }
  }, [id, location.state]);

  const handleBack = () => {
    navigate(-1); // Go back to search results
  };

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    navigate('/account?tab=bookings');
  };

  const displaySchedule = schedule || currentSchedule;

  if (loading && !displaySchedule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error && !displaySchedule) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-error-600 mb-4">
            <p className="text-lg font-semibold">Error Loading Bus</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button onClick={handleBack} className="btn btn-primary">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!displaySchedule) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-6">
          <button
            onClick={handleBack}
            className="btn btn-ghost mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <Bus className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-display font-bold text-neutral-900">
                  {displaySchedule.bus?.busName}
                </h1>
              </div>

              <div className="bg-gray-50 px-4 py-2 rounded-lg inline-block mb-4">
                <p className="text-xs text-gray-500">Bus Number</p>
                <p className="text-lg font-bold text-gray-900">{displaySchedule.bus?.busNumber}</p>
              </div>

              <p className="text-neutral-600 mb-4 text-lg">
                {displaySchedule.bus?.busType} • {displaySchedule.bus?.totalSeats} Seater
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-neutral-700">
                  <MapPin className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Route</p>
                    <p className="font-semibold">{displaySchedule.route?.from} → {displaySchedule.route?.to}</p>
                  </div>
                </div>

                <div className="flex items-center text-neutral-700">
                  <Clock className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Timing</p>
                    <p className="font-semibold">{displaySchedule.departureTime} - {displaySchedule.arrivalTime}</p>
                  </div>
                </div>

                <div className="flex items-center text-neutral-700">
                  <Calendar className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Journey Date</p>
                    <p className="font-semibold">{formatDate(travelDate)}</p>
                  </div>
                </div>

                <div className="flex items-center text-neutral-700">
                  <Users className="w-5 h-5 mr-3 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500">Available Seats</p>
                    <p className="font-semibold text-green-600">
                      {displaySchedule.availableSeats || 0} seats
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 h-fit">
              <p className="text-sm text-primary-800 mb-2">Fare per seat</p>
              <p className="text-4xl font-bold text-primary-600 mb-4">
                ₹{displaySchedule.fare}
              </p>
              {selectedSeats.length > 0 && (
                <>
                  <div className="border-t border-primary-200 pt-3 mb-3">
                    <p className="text-sm text-neutral-600">Selected: {selectedSeats.join(', ')}</p>
                    <p className="text-xl font-bold text-neutral-900 mt-1">
                      Total: ₹{displaySchedule.fare * selectedSeats.length}
                    </p>
                  </div>
                  <button onClick={handleBookSeats} className="btn btn-primary w-full">
                    Proceed to Payment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="container-custom py-8">
        <SeatSelection />
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          totalAmount={displaySchedule.fare * selectedSeats.length}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
