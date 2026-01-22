import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Calendar, MapPin, Search } from 'lucide-react';
import { INDIAN_STATES_AND_UTS } from './states';

const getTodayISODate = () => {
  const now = new Date();
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

  const [heroImageUrl, setHeroImageUrl] = useState('/hero.png');

  const today = useMemo(() => getTodayISODate(), []);

  const [fromState, setFromState] = useState('Karnataka');
  const [toState, setToState] = useState('Tamil Nadu');
  const [journeyDate, setJourneyDate] = useState(today);
  const [error, setError] = useState('');

  const onSwap = () => {
    setFromState((prev) => {
      setToState(prev);
      return toState;
    });
  };

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
    <section className="relative overflow-hidden">
      {/* Preload hero image with fallback */}
      <img
        src={heroImageUrl}
        alt=""
        className="hidden"
        onError={() => {
          setHeroImageUrl((prev) => {
            if (prev === '/hero.png') return '/hero.webp';
            return '';
          });
        }}
      />

      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-center bg-cover"
          style={{
            backgroundImage: heroImageUrl
              ? `url(${heroImageUrl})`
              : 'linear-gradient(90deg, #7f1d1d, #fef3c7)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4a0c1a]/90 via-[#7f1d1d]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white" />
      </div>

      <div className="relative container-custom pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 text-white px-4 py-2 border border-white/20 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-warning-300" />
            <span className="text-sm font-medium">Fast bookings • Safe payments • 24×7 support</span>
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-white text-balance">
            India&apos;s No. 1 online
            <span className="block">bus ticket booking site</span>
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/90 max-w-2xl">
            Book intercity buses across India with live availability, instant confirmation, and flexible date selection.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-10 md:mt-12">
          <form
            onSubmit={onSubmit}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1fr_auto] gap-0">
              {/* From */}
              <div className="p-5 md:p-6">
                <label className="text-xs font-semibold text-neutral-500">From</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-neutral-700" />
                  </div>
                  <select
                    className="input !py-3 !px-3 !rounded-xl"
                    value={fromState}
                    onChange={(e) => setFromState(e.target.value)}
                    aria-label="From State"
                  >
                    {INDIAN_STATES_AND_UTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap */}
              <div className="flex items-center justify-center px-3 lg:border-x border-neutral-200">
                <button
                  type="button"
                  onClick={onSwap}
                  className="h-11 w-11 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center"
                  aria-label="Swap From and To"
                  title="Swap"
                >
                  <ArrowLeftRight className="w-5 h-5 text-neutral-700" />
                </button>
              </div>

              {/* To */}
              <div className="p-5 md:p-6 lg:border-r border-neutral-200">
                <label className="text-xs font-semibold text-neutral-500">To</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-neutral-700" />
                  </div>
                  <select
                    className="input !py-3 !px-3 !rounded-xl"
                    value={toState}
                    onChange={(e) => setToState(e.target.value)}
                    aria-label="To State"
                  >
                    {INDIAN_STATES_AND_UTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="p-5 md:p-6">
                <label className="text-xs font-semibold text-neutral-500">Date of Journey</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div className="w-full">
                    <input
                      className="input !py-3 !px-3 !rounded-xl"
                      type="date"
                      min={today}
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      aria-label="Journey Date"
                    />
                    <div className="mt-1 text-xs text-neutral-500">
                      Selected: <span className="font-medium">{formatPrettyDate(journeyDate) || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="p-5 md:p-6 flex items-center justify-center">
                <button
                  type="submit"
                  className="btn bg-brand-600 hover:bg-brand-700 text-white rounded-full px-8 py-3 flex items-center gap-2 shadow-lg shadow-brand-600/25"
                >
                  <Search className="w-5 h-5" />
                  Search buses
                </button>
              </div>
            </div>

            {error ? (
              <div className="px-6 pb-6 -mt-2">
                <div className="rounded-xl bg-error-50 border border-error-200 text-error-700 px-4 py-3 text-sm">
                  {error}
                </div>
              </div>
            ) : null}
          </form>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/90 border border-white/30 backdrop-blur px-4 py-3 text-sm text-neutral-900">
              <span className="font-semibold">No hidden charges</span>
              <span className="text-neutral-600"> — transparent fares</span>
            </div>
            <div className="rounded-2xl bg-white/90 border border-white/30 backdrop-blur px-4 py-3 text-sm text-neutral-900">
              <span className="font-semibold">Instant confirmation</span>
              <span className="text-neutral-600"> — book in seconds</span>
            </div>
            <div className="rounded-2xl bg-white/90 border border-white/30 backdrop-blur px-4 py-3 text-sm text-neutral-900">
              <span className="font-semibold">Flexible dates</span>
              <span className="text-neutral-600"> — plan your journey</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/80">
            Put your landing image at <span className="font-semibold">public/hero.png</span> (recommended).
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
