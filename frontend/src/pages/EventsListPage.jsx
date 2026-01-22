import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { eventService } from '@/services/eventService';
import { handleApiError, formatDate } from '@/utils/helpers';
import { Calendar, MapPin, Clock, Loader2, Bus } from 'lucide-react';

const EventsListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState(null);

  useEffect(() => {
    // Get search params from navigation state
    if (location.state?.from && location.state?.to && location.state?.date) {
      setSearchParams(location.state);
      searchBuses(location.state);
    } else {
      setError('Please search for buses from the home page');
      setLoading(false);
    }
  }, [location.state]);

  const searchBuses = async (params) => {
    try {
      setLoading(true);
      setError('');
      console.log('Searching buses with params:', params);
      const data = await eventService.searchBuses(params);
      console.log('Search buses response:', data);
      
      if (data.success) {
        setBuses(data.data || []);
        console.log('Buses found:', data.data?.length || 0);
      } else {
        setBuses([]);
      }
    } catch (err) {
      console.error('Search buses error:', err);
      setError(handleApiError(err));
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBusClick = (schedule) => {
    navigate(`/events/${schedule._id}`, {
      state: {
        schedule,
        date: searchParams.date
      }
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading buses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-error-600 mb-4">
            <p className="text-lg font-semibold">Error Loading Buses</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button onClick={handleBackToHome} className="btn btn-primary">
            Back to Home
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
            Available Buses
          </h1>
          {searchParams && (
            <p className="text-neutral-600 text-lg">
              {searchParams.from} → {searchParams.to} on {formatDate(searchParams.date)}
            </p>
          )}
        </div>

        {buses.length === 0 ? (
          <div className="card text-center py-16">
            <Bus className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-xl text-neutral-600">No buses available for this route</p>
            <p className="text-neutral-500 mt-2">Try searching for different dates or routes</p>
            <button onClick={handleBackToHome} className="btn btn-primary mt-4">
              Search Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((schedule) => (
              <BusCard
                key={schedule._id}
                schedule={schedule}
                onClick={() => handleBusClick(schedule)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BusCard = ({ schedule, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card card-hover cursor-pointer overflow-hidden"
    >
      <div>
        <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2">
          {schedule.bus?.busName || 'Bus'}
        </h3>
        
        <div className="bg-gray-50 px-3 py-2 rounded-lg mb-3">
          <p className="text-xs text-gray-500">Bus Number</p>
          <p className="text-sm font-semibold text-gray-900">{schedule.bus?.busNumber}</p>
        </div>

        <p className="text-neutral-600 text-sm mb-4">
          {schedule.bus?.busType} • {schedule.bus?.totalSeats} Seats
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-neutral-700 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-primary-600" />
            <span>{schedule.route?.from} → {schedule.route?.to}</span>
          </div>

          <div className="flex items-center text-neutral-700 text-sm">
            <Clock className="w-4 h-4 mr-2 text-primary-600" />
            <span>{schedule.departureTime} - {schedule.arrivalTime}</span>
          </div>

          <div className="flex items-center text-neutral-700 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
            <span>{schedule.route?.duration || 'N/A'}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">Fare</p>
            <p className="text-xl font-bold text-primary-600">
              ₹{schedule.fare}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Available</p>
            <p className="text-lg font-semibold text-green-600">
              {schedule.availableSeats} seats
            </p>
          </div>
        </div>

        <button className="btn btn-primary w-full mt-4">
          View Seats
        </button>
      </div>
    </div>
  );
};

export default EventsListPage;
