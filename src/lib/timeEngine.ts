import { Task } from './types';

export function getCurrentTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function isTimePast(timeStr: string): boolean {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

export function isTimeReached(timeStr: string): boolean {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}

export function isTimeBetween(start: string, end: string): boolean {
  const now = new Date();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  return currentMins >= startMins && currentMins < endMins;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}

export function isSameDayOfWeek(date: Date): boolean {
  const now = new Date();
  return date.getDay() === now.getDay();
}

export function getSecondsElapsed(startTime: string): number {
  const now = new Date();
  const [h, m] = startTime.split(':').map(Number);
  const startMins = h * 60 + m;
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, (currentMins - startMins) * 60);
}

export function getSecondsRemaining(endTime: string): number {
  const now = new Date();
  const [h, m] = endTime.split(':').map(Number);
  const endMins = h * 60 + m;
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, (endMins - currentMins) * 60);
}

export function getTaskProgress(startTime: string, endTime: string): number {
  const total = getSecondsRemaining(endTime) + getSecondsElapsed(startTime);
  if (total <= 0) return 100;
  return Math.min(100, (getSecondsElapsed(startTime) / total) * 100);
}

export function processTasks(tasks: Task[]): Task[] {
  let updated = [...tasks];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  updated = updated.map((task) => {
    if (task.completed) return task;

    if (task.endTime && !task.completed) {
      if (isTimePast(task.endTime) && task.listId === 'today') {
        if (task.repeat === 'once') {
          return { ...task, listId: 'overdue' };
        }
        return { ...task, listId: 'overdue' };
      }
    }

    if (task.repeat === 'daily' && task.listId === 'overdue') {
      const completedOrOverdueAt = task.completedAt || now.getTime();
      const taskDate = new Date(completedOrOverdueAt);
      if (!isToday(taskDate) && task.completed) {
        return { ...task, listId: 'today', completed: false, completedAt: undefined };
      }
    }

    return task;
  });

  return updated;
}

export function moveDailyTasks(tasks: Task[]): Task[] {
  const now = new Date();
  return tasks.map((task) => {
    if (task.repeat === 'daily' && task.completed && task.completedAt) {
      const completedDate = new Date(task.completedAt);
      if (!isToday(completedDate)) {
        return { ...task, listId: 'today', completed: false, completedAt: undefined };
      }
    }
    return task;
  });
}
