import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { formatDate, formatCurrency, handleApiError } from '@/utils/helpers';
import { Calendar, MapPin, Clock, Loader2, ArrowLeft, Users } from 'lucide-react';
import SeatSelection from '@/components/booking/SeatSelection';
import CountdownTimer from '@/components/booking/CountdownTimer';
import PaymentModal from '@/components/booking/PaymentModal';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentEvent, loadEvent, loading, error, selectedSeat, reservation } = useBooking();
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent(id).catch((err) => {
        console.error('Failed to load event:', err);
      });
    }
  }, [id]);

  useEffect(() => {
    if (reservation) {
      // Automatically show payment modal when seat is reserved
      setShowPayment(true);
    }
  }, [reservation]);

  const handleBack = () => {
    navigate('/events');
  };

  const handlePaymentSuccess = (booking) => {
    navigate(`/booking/confirmation/${booking.id}`);
  };

  if (loading && !currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-error-600 mb-4">
            <p className="text-lg font-semibold">Error Loading Event</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button onClick={handleBack} className="btn btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
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
            Back to Events
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {currentEvent.imageUrl && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={currentEvent.imageUrl}
                  alt={currentEvent.title}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            <div>
              <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
                {currentEvent.title}
              </h1>

              <p className="text-neutral-700 mb-6 text-lg leading-relaxed">
                {currentEvent.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-neutral-700">
                  <Calendar className="w-5 h-5 mr-3 text-primary-600" />
                  <span className="font-medium">{formatDate(currentEvent.date)}</span>
                </div>

                <div className="flex items-center text-neutral-700">
                  <Clock className="w-5 h-5 mr-3 text-primary-600" />
                  <span className="font-medium">{currentEvent.time}</span>
                </div>

                <div className="flex items-center text-neutral-700">
                  <MapPin className="w-5 h-5 mr-3 text-primary-600" />
                  <span className="font-medium">{currentEvent.venue}</span>
                </div>

                <div className="flex items-center text-neutral-700">
                  <Users className="w-5 h-5 mr-3 text-primary-600" />
                  <span className="font-medium">
                    {currentEvent.availableSeats || 0} seats available
                  </span>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800 mb-1">Starting from</p>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(currentEvent.price || currentEvent.startingPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Selection */}
      <div className="container-custom py-8">
        {selectedSeat && reservation && (
          <div className="mb-6">
            <CountdownTimer />
          </div>
        )}

        <SeatSelection />
      </div>

      {/* Payment Modal */}
      {showPayment && selectedSeat && reservation && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
