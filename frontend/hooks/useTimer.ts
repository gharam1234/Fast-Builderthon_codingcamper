import { useState, useEffect, useCallback } from 'react';

interface UseTimerOptions {
  initialSeconds: number;
  onComplete?: () => void;
}

export function useTimer({ initialSeconds, onComplete }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onComplete) {
            setTimeout(onComplete, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds, onComplete]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    formatTime,
    isExpired: timeLeft <= 0,
  };
}
