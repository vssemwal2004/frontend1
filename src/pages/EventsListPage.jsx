import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '@/services/eventService';
import { handleApiError, formatDate, formatCurrency } from '@/utils/helpers';
import { Calendar, MapPin, Clock, Loader2, Ticket } from 'lucide-react';

const EventsListPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await eventService.getAllEvents();
      setEvents(data.events || data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-error-600 mb-4">
            <p className="text-lg font-semibold">Error Loading Events</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button onClick={loadEvents} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="container-custom py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-3">
            Upcoming Events
          </h1>
          <p className="text-neutral-600 text-lg">
            Book your tickets for the best events in town
          </p>
        </div>

        {events.length === 0 ? (
          <div className="card text-center py-16">
            <Ticket className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-xl text-neutral-600">No events available at the moment</p>
            <p className="text-neutral-500 mt-2">Check back later for new events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card card-hover cursor-pointer overflow-hidden"
    >
      {event.imageUrl && (
        <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {event.featured && (
            <div className="absolute top-4 right-4">
              <span className="badge badge-warning font-semibold">Featured</span>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-neutral-700 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center text-neutral-700 text-sm">
            <Clock className="w-4 h-4 mr-2 text-primary-600" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center text-neutral-700 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-primary-600" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">Starting from</p>
            <p className="text-xl font-bold text-primary-600">
              {formatCurrency(event.price || event.startingPrice)}
            </p>
          </div>
          <button className="btn btn-primary">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsListPage;
