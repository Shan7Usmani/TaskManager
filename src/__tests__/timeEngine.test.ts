import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentTimeStr,
  isTimePast,
  isTimeBetween,
  isToday,
  isTomorrow,
  isSameDayOfWeek,
  getSecondsElapsed,
  getSecondsRemaining,
  getTaskProgress,
  processTasks,
  moveDailyTasks,
} from '@/lib/timeEngine';
import { Task } from '@/lib/types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    listId: 'today',
    title: 'Test Task',
    repeat: 'once',
    alarm: false,
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('getCurrentTimeStr', () => {
  it('returns HH:MM format', () => {
    const result = getCurrentTimeStr();
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('matches current hours and minutes', () => {
    const result = getCurrentTimeStr();
    const now = new Date();
    const [h, m] = result.split(':').map(Number);
    expect(h).toBe(now.getHours());
    expect(m).toBe(now.getMinutes());
  });
});

describe('isTimePast', () => {
  it('returns true when current time is after the given time', () => {
    const now = new Date();
    const pastHour = String((now.getHours() - 1 + 24) % 24).padStart(2, '0');
    expect(isTimePast(`${pastHour}:00`)).toBe(true);
  });

  it('returns false when current time is before the given time', () => {
    const now = new Date();
    const futureHour = String((now.getHours() + 2) % 24).padStart(2, '0');
    expect(isTimePast(`${futureHour}:00`)).toBe(false);
  });

  it('returns true when current time exactly matches', () => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    expect(isTimePast(current)).toBe(true);
  });
});

describe('isTimeBetween', () => {
  it('returns true when now is between start and end', () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const endH = (h + 1) % 24;
    const end = `${String(endH).padStart(2, '0')}:00`;
    expect(isTimeBetween(start, end)).toBe(true);
  });

  it('returns false when now is before start', () => {
    const now = new Date();
    const futureH = (now.getHours() + 3) % 24;
    const futureH2 = (now.getHours() + 4) % 24;
    expect(isTimeBetween(`${String(futureH).padStart(2, '0')}:00`, `${String(futureH2).padStart(2, '0')}:00`)).toBe(false);
  });

  it('returns true at exact start boundary', () => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const endH = (now.getHours() + 1) % 24;
    expect(isTimeBetween(current, `${String(endH).padStart(2, '0')}:00`)).toBe(true);
  });

  it('returns false at exact end boundary (exclusive)', () => {
    const now = new Date();
    const startH = (now.getHours() - 2 + 24) % 24;
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    // The end is now, so current == end means it should be false
    expect(isTimeBetween(`${String(startH).padStart(2, '0')}:00`, current)).toBe(false);
  });
});

describe('isToday', () => {
  it('returns true for current date', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });
});

describe('isTomorrow', () => {
  it('returns true for tomorrow\'s date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isTomorrow(tomorrow)).toBe(true);
  });

  it('returns false for today', () => {
    expect(isTomorrow(new Date())).toBe(false);
  });
});

describe('isSameDayOfWeek', () => {
  it('returns true for today', () => {
    expect(isSameDayOfWeek(new Date())).toBe(true);
  });

  it('returns false for a different day', () => {
    const diff = new Date();
    diff.setDate(diff.getDate() + 1);
    // Could be true if tomorrow is same day of week (Sat->Sun won't match, but Mon->Tue won't match either)
    // This test verifies the function actually compares days of week
    const sameDow = diff.getDay() === new Date().getDay();
    expect(isSameDayOfWeek(diff)).toBe(sameDow);
  });
});

describe('getSecondsElapsed', () => {
  it('returns positive seconds when start is in the past', () => {
    const now = new Date();
    const pastH = (now.getHours() - 1 + 24) % 24;
    const result = getSecondsElapsed(`${String(pastH).padStart(2, '0')}:00`);
    expect(result).toBeGreaterThan(0);
  });

  it('returns 0 when start is in the future', () => {
    const now = new Date();
    const futureH = (now.getHours() + 3) % 24;
    const result = getSecondsElapsed(`${String(futureH).padStart(2, '0')}:00`);
    expect(result).toBe(0);
  });

  it('returns 0 when start matches current time', () => {
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    expect(getSecondsElapsed(current)).toBe(0);
  });
});

describe('getSecondsRemaining', () => {
  it('returns positive seconds when end is in the future', () => {
    const now = new Date();
    const futureH = (now.getHours() + 2) % 24;
    const result = getSecondsRemaining(`${String(futureH).padStart(2, '0')}:00`);
    expect(result).toBeGreaterThan(0);
  });

  it('returns 0 when end is in the past', () => {
    const now = new Date();
    const pastH = (now.getHours() - 2 + 24) % 24;
    const result = getSecondsRemaining(`${String(pastH).padStart(2, '0')}:00`);
    expect(result).toBe(0);
  });
});

describe('getTaskProgress', () => {
  it('returns 0-100 range', () => {
    const result = getTaskProgress('08:00', '10:00');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('returns 100 when end time is in the past', () => {
    const result = getTaskProgress('01:00', '02:00');
    expect(result).toBe(100);
  });
});

describe('processTasks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns completed tasks unchanged', () => {
    const task = makeTask({ completed: true, listId: 'today' });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
  });

  it('moves overdue tasks with endTime past to overdue list', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0)); // 15:00

    const task = makeTask({
      listId: 'today',
      endTime: '10:00',
      repeat: 'once',
    });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('overdue');
  });

  it('does not move tasks that are not yet overdue', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0)); // 10:00

    const task = makeTask({
      listId: 'today',
      endTime: '12:00',
      repeat: 'once',
    });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
  });

  it('only moves tasks in today list to overdue', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));

    const task = makeTask({
      listId: 'tomorrow',
      endTime: '10:00',
      repeat: 'once',
    });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('tomorrow');
  });

  it('moves both once and daily overdue tasks to overdue', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));

    const onceTask = makeTask({
      id: 'once',
      listId: 'today',
      endTime: '10:00',
      repeat: 'once',
    });
    const dailyTask = makeTask({
      id: 'daily',
      listId: 'today',
      endTime: '10:00',
      repeat: 'daily',
    });
    const result = processTasks([onceTask, dailyTask]);
    expect(result[0].listId).toBe('overdue');
    expect(result[1].listId).toBe('overdue');
  });

  it('resets completed daily tasks from previous days back to today', () => {
    const yesterday = new Date(2026, 7, 19, 10, 0).getTime();
    const task = makeTask({
      listId: 'overdue',
      repeat: 'daily',
      completed: true,
      completedAt: yesterday,
    });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
    expect(result[0].completed).toBe(false);
    expect(result[0].completedAt).toBeUndefined();
  });

  it('does not reset daily tasks completed today', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));

    const task = makeTask({
      listId: 'today',
      repeat: 'daily',
      completed: true,
      completedAt: new Date(2026, 7, 20, 10, 0).getTime(),
    });
    const result = processTasks([task]);
    expect(result[0].completed).toBe(true);
  });

  it('returns tasks without endTime unchanged', () => {
    const task = makeTask({
      listId: 'today',
      endTime: undefined,
    });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
  });
});

describe('moveDailyTasks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resets completed daily tasks from previous days', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));

    const task = makeTask({
      repeat: 'daily',
      completed: true,
      completedAt: new Date(2026, 7, 19, 10, 0).getTime(),
    });
    const result = moveDailyTasks([task]);
    expect(result[0].listId).toBe('today');
    expect(result[0].completed).toBe(false);
    expect(result[0].completedAt).toBeUndefined();
  });

  it('does not reset daily tasks completed today', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));

    const task = makeTask({
      repeat: 'daily',
      completed: true,
      completedAt: new Date(2026, 7, 20, 10, 0).getTime(),
    });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(true);
  });

  it('does not affect non-daily tasks', () => {
    const task = makeTask({
      repeat: 'once',
      completed: true,
      completedAt: new Date(2026, 7, 19, 10, 0).getTime(),
    });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(true);
  });

  it('does not affect non-completed tasks', () => {
    const task = makeTask({
      repeat: 'daily',
      completed: false,
    });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(false);
  });

  it('handles tasks without completedAt', () => {
    const task = makeTask({
      repeat: 'daily',
      completed: true,
      completedAt: undefined,
    });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(true);
  });
});
