import { useState, useEffect } from 'react';

/**
 * Custom hook for countdown timer
 * @param {number} initialTime - Initial time in seconds
 * @param {Function} onExpire - Callback when timer expires
 * @returns {Object} Timer state and controls
 */
export const useTimer = (initialTime, onExpire) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (initialTime !== null && initialTime !== undefined) {
      setTimeRemaining(initialTime);
      setIsRunning(true);
    }
  }, [initialTime]);

  useEffect(() => {
    if (!isRunning || timeRemaining === null) return;

    if (timeRemaining <= 0) {
      setIsRunning(false);
      if (onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (onExpire) {
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, onExpire]);

  const reset = (newTime) => {
    setTimeRemaining(newTime || initialTime);
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    setTimeRemaining(null);
  };

  return {
    timeRemaining,
    isRunning,
    reset,
    pause,
    resume,
    stop,
  };
};
