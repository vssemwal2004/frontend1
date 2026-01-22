import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, MapPin, Search } from 'lucide-react';
import routeService from '@/services/routeService';

const getTodayISODate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getTomorrowISODate = () => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatPrettyDate = (isoDate) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const HeroSection = () => {
  const navigate = useNavigate();

  const today = useMemo(() => getTodayISODate(), []);
  const tomorrow = useMemo(() => getTomorrowISODate(), []);

  const [availableCities, setAvailableCities] = useState([]);
  const [fromState, setFromState] = useState('');
  const [toState, setToState] = useState('');
  const [journeyDate, setJourneyDate] = useState(today);
  const [bookingForWomen, setBookingForWomen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch available cities from admin-created routes
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await routeService.getAvailableCities();
        const cities = response.data.cities || [];
        setAvailableCities(cities);
        
        // Set default values if cities are available
        if (cities.length >= 2) {
          setFromState(cities[0]);
          setToState(cities[1]);
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load available routes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const onSwap = () => {
    setFromState((prev) => {
      setToState(prev);
      return toState;
    });
  };

  const setToday = () => setJourneyDate(today);
  const setTomorrow = () => setJourneyDate(tomorrow);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fromState || !toState) {
      setError('Please select both From and To.');
      return;
    }

    if (fromState === toState) {
      setError('From and To cannot be the same.');
      return;
    }

    if (!journeyDate) {
      setError('Please choose a journey date.');
      return;
    }

    navigate('/events', {
      state: {
        from: fromState,
        to: toState,
        date: journeyDate,
      },
    });
  };

  return (
    <section className="relative bg-white">
      {/* Hero Image - Original size, no overlays */}
      <div className="w-full">
        <img
          src="/hero.webp"
          alt="Bus Booking Banner"
          className="w-full h-auto object-contain"
          style={{ display: 'block' }}
        />
      </div>

      {/* Booking Card - Positioned to overlap 50% on image, 50% below */}
      <div className="relative px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto -mt-32 relative z-10">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Loading available routes...</p>
            </div>
          ) : availableCities.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200 p-8 text-center">
              <p className="text-gray-900 font-semibold mb-2">No routes available yet</p>
              <p className="text-gray-600">Admin needs to add routes to start booking</p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200 p-3"
            >
              {/* Main Booking Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
                {/* From Location */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1.5 bg-white">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <select
                      className="w-full text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                      value={fromState}
                      onChange={(e) => setFromState(e.target.value)}
                      aria-label="From State"
                    >
                      {availableCities.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="lg:col-span-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={onSwap}
                    className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center border border-gray-300"
                    aria-label="Swap From and To"
                    title="Swap locations"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>

                {/* To Location */}
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1.5 bg-white">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <select
                      className="w-full text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                      value={toState}
                      onChange={(e) => setToState(e.target.value)}
                      aria-label="To State"
                    >
                      {availableCities.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              {/* Date of Journey with Today/Tomorrow buttons */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Journey</label>
                <div>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 py-1.5 bg-white mb-1">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <input
                      className="w-full text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0"
                      type="date"
                      min={today}
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      aria-label="Journey Date"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={setToday}
                      className={`px-3 py-0.5 text-xs font-medium rounded-md transition-colors ${
                        journeyDate === today
                          ? 'bg-gray-200 text-gray-900'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={setTomorrow}
                      className={`px-3 py-0.5 text-xs font-medium rounded-md transition-colors ${
                        journeyDate === tomorrow
                          ? 'bg-gray-200 text-gray-900'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking for Women Toggle */}
              <div className="lg:col-span-2 flex items-center justify-end gap-2">
                <div className="flex items-center gap-1.5">
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ec4899'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"
                    alt="Women"
                    className="w-6 h-6"
                  />
                  <div>
                    <div className="text-xs font-medium text-gray-700">Booking for women</div>
                    <a href="#" className="text-[10px] text-pink-600 hover:underline">
                      Know more
                    </a>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={bookingForWomen}
                      onChange={(e) => setBookingForWomen(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-3 flex justify-center">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full px-10 py-2.5 flex items-center gap-2 shadow-lg transition-all"
              >
                <Search className="w-4 h-4" />
                Search buses
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-2">
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
                  {error}
                </div>
              </div>
            )}
          </form>
          )}
        </div>
      </div>

      {/* Spacing below the card */}
      <div className="h-16"></div>
    </section>
  );
};

export default HeroSection;
