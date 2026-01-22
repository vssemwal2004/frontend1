import { useBooking } from '@/contexts/BookingContext';
import { handleApiError, getSeatStatusColor } from '@/utils/helpers';
import { Armchair, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const SeatSelection = () => {
  const { seatLayout, selectedSeat, selectSeat, loading, error } = useBooking();
  const [selectingError, setSelectingError] = useState('');

  const handleSeatClick = async (seat) => {
    if (seat.status === 'booked' || seat.status === 'reserved') {
      return;
    }

    try {
      setSelectingError('');
      await selectSeat(seat);
    } catch (err) {
      setSelectingError(handleApiError(err));
    }
  };

  if (loading && !seatLayout) {
    return (
      <div className="card text-center py-16">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">Loading seat layout...</p>
      </div>
    );
  }

  if (!seatLayout) {
    return (
      <div className="card text-center py-16">
        <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">Seat layout not available</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
          Select Your Seat
        </h2>
        <p className="text-neutral-600">
          Click on an available seat to reserve it
        </p>
      </div>

      {selectingError && (
        <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-700 text-sm">{selectingError}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-700 text-sm">{error}</p>
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-neutral-50 rounded-lg">
        <SeatLegend status="available" label="Available" />
        <SeatLegend status="selected" label="Selected" />
        <SeatLegend status="reserved" label="Reserved" />
        <SeatLegend status="booked" label="Booked" />
        {seatLayout.some((seat) => seat.type === 'vip') && (
          <SeatLegend status="vip" label="VIP" />
        )}
      </div>

      {/* Stage */}
      <div className="mb-8">
        <div className="bg-neutral-800 text-white text-center py-4 rounded-lg">
          <p className="font-semibold text-lg">STAGE</p>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {renderSeatLayout(seatLayout, selectedSeat, handleSeatClick)}
        </div>
      </div>

      {/* Selected Seat Info */}
      {selectedSeat && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-800 mb-1">Selected Seat</p>
              <p className="text-2xl font-bold text-primary-600">
                {selectedSeat.row}-{selectedSeat.number}
              </p>
              {selectedSeat.type === 'vip' && (
                <span className="badge badge-primary mt-2">VIP</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-800 mb-1">Price</p>
              <p className="text-2xl font-bold text-primary-600">
                ${selectedSeat.price}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeatLegend = ({ status, label }) => {
  const seatClass = getSeatStatusColor(status);
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded ${seatClass}`}></div>
      <span className="text-sm text-neutral-700">{label}</span>
    </div>
  );
};

const renderSeatLayout = (seatLayout, selectedSeat, onSeatClick) => {
  // Group seats by row
  const seatsByRow = seatLayout.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Sort rows
  const rows = Object.keys(seatsByRow).sort();

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const seats = seatsByRow[row].sort((a, b) => a.number - b.number);
        return (
          <div key={row} className="flex items-center gap-2">
            <div className="w-8 text-sm font-semibold text-neutral-700">{row}</div>
            <div className="flex gap-2 flex-wrap">
              {seats.map((seat) => {
                const isSelected = selectedSeat?.id === seat.id;
                const seatClass = isSelected ? 'seat-selected' : getSeatStatusColor(seat.status);
                const isDisabled = seat.status === 'booked' || seat.status === 'reserved';

                return (
                  <button
                    key={seat.id}
                    onClick={() => onSeatClick(seat)}
                    disabled={isDisabled}
                    className={`seat ${seatClass} relative group`}
                    title={`Seat ${row}-${seat.number} - $${seat.price}`}
                  >
                    <Armchair className="w-5 h-5" />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-neutral-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {row}-{seat.number} • ${seat.price}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeatSelection;
