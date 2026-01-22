import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '@/services/bookingService';
import { formatDate, formatCurrency, formatDateTime, handleApiError } from '@/utils/helpers';
import { CheckCircle2, Download, Calendar, MapPin, Clock, Ticket, ArrowLeft, Loader2 } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getBookingById(id);
      setBooking(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    // In production, this would generate a PDF ticket
    alert('Ticket download feature would be implemented here');
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-error-600 mb-4">
            <p className="text-lg font-semibold">Error Loading Booking</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button onClick={handleBackToEvents} className="btn btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 via-white to-primary-50">
      <div className="container-custom py-12">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-success-100 rounded-full mb-6 animate-bounce-slow">
            <CheckCircle2 className="w-16 h-16 text-success-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-neutral-600 text-lg">
            Your ticket has been successfully booked
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Booking Card */}
          <div className="card mb-6">
            {/* Booking ID */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-800 mb-1">Booking ID</p>
                  <p className="text-2xl font-bold font-mono text-primary-600">
                    {booking.id || booking.bookingId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-800 mb-1">Status</p>
                  <span className="badge badge-success text-lg px-4 py-2">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Bus Journey Details */}
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-4">
                Journey Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Ticket className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Bus Details</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {booking.bus?.busName || 'N/A'}
                    </p>
                    <p className="text-neutral-700">
                      {booking.bus?.busNumber || 'N/A'} • {booking.bus?.busType || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Route</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {booking.route?.from || 'N/A'} → {booking.route?.to || 'N/A'}
                    </p>
                    <p className="text-neutral-700">
                      {booking.route?.duration || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Date & Time</p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {formatDate(booking.journeyDate)}
                    </p>
                    <p className="text-neutral-700">
                      Departure: {booking.schedule?.departureTime || 'N/A'} | Arrival: {booking.schedule?.arrivalTime || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat & Payment Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Seat Information</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 mb-1">Seat Number{booking.seats?.length > 1 ? 's' : ''}</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {booking.seats?.map(s => s.seatNumber).join(', ') || booking.seatNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-neutral-600 mt-2">
                    Total: {booking.seats?.length || 1} seat{booking.seats?.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Payment Details</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600">Amount Paid</span>
                    <span className="text-2xl font-bold text-success-600">
                      {formatCurrency(booking.totalFare || booking.amount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col text-sm mt-3">
                    <span className="text-neutral-600 mb-1">Payment ID</span>
                    <span className="font-mono text-neutral-900 break-all text-xs">
                      {booking.paymentId || booking.razorpayOrderId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Time */}
            <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
              <p className="text-sm text-neutral-600">
                Booked on {formatDateTime(booking.createdAt || booking.bookingDate || new Date())}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadTicket}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Ticket
            </button>
            <button
              onClick={handleBackToEvents}
              className="btn btn-outline flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Events
            </button>
          </div>

          {/* Important Information */}
          <div className="mt-8 card bg-warning-50 border-warning-200">
            <h3 className="font-semibold text-warning-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-warning-800">
              <li>• Please arrive at least 30 minutes before the event starts</li>
              <li>• Carry a valid ID proof along with your ticket</li>
              <li>• Screenshots or printed tickets are accepted</li>
              <li>• Your booking confirmation has been sent to your email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
