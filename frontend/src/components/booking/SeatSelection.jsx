import { useBooking } from '@/contexts/BookingContext';
import { Loader2, AlertCircle, Check } from 'lucide-react';

const SeatSelection = () => {
  const { 
    seatLayout, 
    selectedSeats, 
    bookedSeats,
    toggleSeatSelection, 
    loading, 
    error,
    currentSchedule 
  } = useBooking();

  const handleSeatClick = (seatNumber) => {
    toggleSeatSelection(seatNumber);
  };

  const getSeatStatus = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return 'booked';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  if (loading && !seatLayout) {
    return (
      <div className="card text-center py-16">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">Loading seat layout...</p>
      </div>
    );
  }

  if (!seatLayout || !currentSchedule) {
    return (
      <div className="card text-center py-16">
        <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">Seat layout not available</p>
      </div>
    );
  }

  // Generate seat grid based on total seats
  const totalSeats = currentSchedule.bus?.totalSeats || 40;
  const seatsPerRow = 4; // 2 on each side (aisle in middle)
  const rows = Math.ceil(totalSeats / seatsPerRow);

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
          Select Your Seats
        </h2>
        <p className="text-neutral-600">
          Click on available seats to select (you can select multiple)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-700 text-sm">{error}</p>
        </div>
      )}

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-neutral-50 rounded-lg">
        <SeatLegend status="available" label="Available" />
        <SeatLegend status="selected" label="Selected" />
        <SeatLegend status="booked" label="Booked" />
      </div>

      {/* Driver */}
      <div className="mb-4 flex justify-end pr-12">
        <div className="bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          🚗 Driver
        </div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="space-y-3">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-8">
                {/* Left side seats */}
                <div className="flex gap-2">
                  {Array.from({ length: 2 }, (_, seatIndex) => {
                    const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                    if (seatNumber > totalSeats) return null;
                    return (
                      <SeatButton
                        key={seatNumber}
                        seatNumber={seatNumber}
                        status={getSeatStatus(seatNumber)}
                        onClick={() => handleSeatClick(seatNumber)}
                      />
                    );
                  })}
                </div>

                {/* Aisle */}
                <div className="w-8"></div>

                {/* Right side seats */}
                <div className="flex gap-2">
                  {Array.from({ length: 2 }, (_, seatIndex) => {
                    const seatNumber = rowIndex * seatsPerRow + seatIndex + 3;
                    if (seatNumber > totalSeats) return null;
                    return (
                      <SeatButton
                        key={seatNumber}
                        seatNumber={seatNumber}
                        status={getSeatStatus(seatNumber)}
                        onClick={() => handleSeatClick(seatNumber)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Seats Info */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-primary-800 mb-1">Selected Seats</p>
              <p className="text-2xl font-bold text-primary-600">
                {selectedSeats.join(', ')}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-800 mb-1">Total Fare</p>
              <p className="text-3xl font-bold text-primary-600">
                ₹{(currentSchedule.fare || 0) * selectedSeats.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeatButton = ({ seatNumber, status, onClick }) => {
  const isBooked = status === 'booked';
  const isSelected = status === 'selected';
  const isAvailable = status === 'available';

  let buttonClasses = 'w-12 h-12 rounded-lg font-semibold text-sm transition-all relative flex items-center justify-center';
  
  if (isBooked) {
    buttonClasses += ' bg-neutral-300 text-neutral-500 cursor-not-allowed';
  } else if (isSelected) {
    buttonClasses += ' bg-primary-600 text-white shadow-lg scale-105';
  } else if (isAvailable) {
    buttonClasses += ' bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105 cursor-pointer border-2 border-green-300';
  }

  return (
    <button
      onClick={onClick}
      disabled={isBooked}
      className={buttonClasses}
      title={`Seat ${seatNumber} - ${status}`}
    >
      {isSelected && <Check className="w-5 h-5 absolute" />}
      <span className={isSelected ? 'opacity-0' : ''}>{seatNumber}</span>
    </button>
  );
};

const SeatLegend = ({ status, label }) => {
  let colorClass = '';
  if (status === 'available') colorClass = 'bg-green-100 border-2 border-green-300';
  if (status === 'selected') colorClass = 'bg-primary-600';
  if (status === 'booked') colorClass = 'bg-neutral-300';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded ${colorClass}`}></div>
      <span className="text-sm text-neutral-700">{label}</span>
    </div>
  );
};

export default SeatSelection;
