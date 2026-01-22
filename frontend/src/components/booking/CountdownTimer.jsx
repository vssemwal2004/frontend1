import { useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useTimer } from '@/hooks/useTimer';
import { formatTimeRemaining } from '@/utils/helpers';
import { Clock, AlertTriangle } from 'lucide-react';

const CountdownTimer = () => {
  const { reservation, timeRemaining, setTimeRemaining, releaseSeat } = useBooking();

  const handleTimerExpire = async () => {
    await releaseSeat();
    alert('Time expired! Your seat reservation has been released.');
  };

  const timer = useTimer(timeRemaining, handleTimerExpire);

  useEffect(() => {
    if (timer.timeRemaining !== null) {
      setTimeRemaining(timer.timeRemaining);
    }
  }, [timer.timeRemaining, setTimeRemaining]);

  if (!reservation || timer.timeRemaining === null || timer.timeRemaining === 0) {
    return null;
  }

  const percentage = (timer.timeRemaining / 120) * 100;
  const isLowTime = timer.timeRemaining <= 30;

  return (
    <div
      className={`card ${
        isLowTime ? 'bg-error-50 border-error-300' : 'bg-warning-50 border-warning-300'
      } border-2 animate-pulse-slow`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isLowTime ? (
            <AlertTriangle className="w-8 h-8 text-error-600" />
          ) : (
            <Clock className="w-8 h-8 text-warning-600" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                isLowTime ? 'text-error-800' : 'text-warning-800'
              }`}
            >
              {isLowTime ? 'Hurry up!' : 'Seat Reserved'}
            </p>
            <p
              className={`text-xs ${
                isLowTime ? 'text-error-700' : 'text-warning-700'
              }`}
            >
              Complete your booking before time runs out
            </p>
          </div>
        </div>

        <div className="text-right">
          <p
            className={`text-4xl font-bold font-mono ${
              isLowTime ? 'text-error-600' : 'text-warning-600'
            }`}
          >
            {formatTimeRemaining(timer.timeRemaining)}
          </p>
          <p
            className={`text-xs ${
              isLowTime ? 'text-error-700' : 'text-warning-700'
            }`}
          >
            minutes remaining
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isLowTime ? 'bg-error-600' : 'bg-warning-600'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownTimer;
