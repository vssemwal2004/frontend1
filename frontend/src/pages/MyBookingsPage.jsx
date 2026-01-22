import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import { formatDate, formatCurrency, formatDateTime, handleApiError } from '@/utils/helpers';
import { Calendar, MapPin, Ticket, Loader2, AlertCircle, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingService.getMyBookings();
      
      // Handle different response structures
      const bookingsData = response.data?.bookings || response.bookings || response.data || [];
      setBookings(bookingsData);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = (bookingId) => {
    navigate(`/booking/confirmation/${bookingId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'success', icon: CheckCircle2, label: 'Confirmed' },
      pending: { color: 'warning', icon: Clock, label: 'Pending' },
      cancelled: { color: 'error', icon: AlertCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-${config.color}-100 text-${config.color}-700`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-3">
            My Bookings
          </h1>
          <p className="text-neutral-600 text-lg">
            View and manage all your bus ticket bookings
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="card border-error-200 bg-error-50 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-error-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-error-900 mb-1">Error Loading Bookings</h3>
                <p className="text-error-700 text-sm">{error}</p>
                <button
                  onClick={loadBookings}
                  className="mt-3 btn btn-sm btn-error"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="card text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
              <Ticket className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-3">
              No Bookings Yet
            </h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              You haven't made any bus bookings yet. Start exploring available routes and book your first journey!
            </p>
            <button
              onClick={() => navigate('/events')}
              className="btn btn-primary"
            >
              Browse Available Buses
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onViewDetails={handleViewBooking}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingCard = ({ booking, onViewDetails, getStatusBadge }) => {
  const schedule = booking.schedule || {};
  const route = schedule.route || {};
  const bus = schedule.bus || {};

  // Parse journey date
  const journeyDate = booking.journeyDate || booking.date || schedule.date;
  const departureTime = schedule.departureTime || 'N/A';

  // Parse seat numbers
  const seats = Array.isArray(booking.seats)
    ? booking.seats
    : booking.seatNumber
    ? [booking.seatNumber]
    : [];

  // Calculate total fare
  const totalFare = booking.totalFare || booking.fare || (schedule.fare * seats.length) || 0;

  // Booking status
  const status = booking.status || 'confirmed';

  // Hackwow booking ID (for verification)
  const hackwowId = booking.hackwowBookingId || 'N/A';

  return (
    <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
         onClick={() => onViewDetails(booking._id)}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Route & Journey Info */}
        <div className="flex-1">
          {/* Status Badge */}
          <div className="mb-4">
            {getStatusBadge(status)}
          </div>

          {/* Route */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                {route.from || 'Unknown'} → {route.to || 'Unknown'}
              </h3>
              <p className="text-neutral-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {bus.name || 'Bus'} • {bus.type || 'Standard'}
              </p>
            </div>
          </div>

          {/* Journey Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 text-neutral-700">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-neutral-500">Journey Date</p>
                <p className="font-semibold">{formatDate(journeyDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-700">
              <Clock className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-neutral-500">Departure</p>
                <p className="font-semibold">{departureTime}</p>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-sm text-neutral-500">Seat{seats.length > 1 ? 's' : ''}</p>
              <p className="font-semibold text-neutral-900">
                {seats.join(', ') || 'N/A'}
              </p>
            </div>
          </div>

          {/* Booking IDs (for debugging/verification) */}
          <div className="text-xs text-neutral-400 space-y-1">
            <p>Booking ID: {booking._id}</p>
            {hackwowId !== 'N/A' && <p>Hackwow ID: {hackwowId}</p>}
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="flex flex-col justify-between items-end text-right border-t md:border-t-0 md:border-l border-neutral-200 pt-6 md:pt-0 md:pl-6">
          <div className="mb-4">
            <p className="text-sm text-neutral-500 mb-1">Total Fare</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(totalFare)}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(booking._id);
            }}
            className="btn btn-outline group-hover:btn-primary transition-all duration-300 flex items-center gap-2"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
