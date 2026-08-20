'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Task } from '@/lib/types';
import { getTasks, saveTasks } from '@/lib/store';
import { processTasks, moveDailyTasks } from '@/lib/timeEngine';

export function useTimeEngine(tasks: Task[], onUpdate: (tasks: Task[]) => void) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(async () => {
    let allTasks = await getTasks();
    let updated = processTasks(allTasks);
    updated = moveDailyTasks(updated);
    await saveTasks(updated);
    onUpdate(updated);

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const inProgress = updated.find(
      (t) =>
        !t.completed &&
        t.startTime &&
        t.endTime &&
        t.startTime <= currentTime &&
        t.endTime > currentTime
    );
    setActiveTaskId(inProgress?.id || null);
  }, [onUpdate]);

  useEffect(() => {
    tick();
    intervalRef.current = setInterval(() => { tick(); }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  return { activeTaskId };
}
