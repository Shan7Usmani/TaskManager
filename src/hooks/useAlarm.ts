'use client';

import { useEffect, useRef, useState } from 'react';
import { Task } from '@/lib/types';
import { playAlarm, stopAlarm, showNotification, requestNotificationPermission } from '@/lib/alarms';
import { RINGTONES } from '@/lib/defaults';

export function useAlarm(tasks: Task[]) {
  const [alarmTask, setAlarmTask] = useState<Task | null>(null);
  const triggeredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const task of tasks) {
      if (
        task.alarm &&
        task.startTime &&
        task.startTime === currentTime &&
        !task.completed &&
        !triggeredRef.current.has(task.id)
      ) {
        triggeredRef.current.add(task.id);
        setAlarmTask(task);

        const ringtone = RINGTONES.find((r) => r.id === task.ringtone) || RINGTONES[0];
        playAlarm(ringtone.file);
        showNotification('Task Reminder', task.title);
        break;
      }
    }
  }, [tasks]);

  const dismissAlarm = () => {
    stopAlarm();
    setAlarmTask(null);
  };

  const snoozeAlarm = (minutes: number = 5) => {
    stopAlarm();
    setAlarmTask(null);
    setTimeout(() => {
      if (alarmTask) {
        const ringtone = RINGTONES.find((r) => r.id === alarmTask.ringtone) || RINGTONES[0];
        playAlarm(ringtone.file);
        showNotification('Snoozed Reminder', alarmTask.title);
        setAlarmTask(alarmTask);
      }
    }, minutes * 60 * 1000);
  };

  return { alarmTask, dismissAlarm, snoozeAlarm };
}
