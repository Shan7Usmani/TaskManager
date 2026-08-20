'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSecondsElapsed, getSecondsRemaining } from '@/lib/timeEngine';

export function useStopwatch(startTime?: string, endTime?: string) {
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback(() => {
    if (!startTime) return;
    const e = getSecondsElapsed(startTime);
    setElapsed(e);
    if (endTime) {
      const r = getSecondsRemaining(endTime);
      setRemaining(r);
      const total = e + r;
      setProgress(total > 0 ? Math.min(100, (e / total) * 100) : 100);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (!startTime) return;
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime, update]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return {
    elapsed,
    remaining,
    progress,
    elapsedFormatted: formatTime(elapsed),
    remainingFormatted: formatTime(remaining),
    isActive: startTime !== undefined,
  };
}
