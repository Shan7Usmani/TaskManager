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
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 14, 30));
    expect(getCurrentTimeStr()).toBe('14:30');
    vi.useRealTimers();
  });

  it('pads single digits', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 9, 5));
    expect(getCurrentTimeStr()).toBe('09:05');
    vi.useRealTimers();
  });
});

describe('isTimePast', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns true when current time is after the given time', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    expect(isTimePast('10:00')).toBe(true);
  });

  it('returns false when current time is before the given time', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isTimePast('12:00')).toBe(false);
  });

  it('returns true when current time exactly matches', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 30));
    expect(isTimePast('10:30')).toBe(true);
  });
});

describe('isTimeBetween', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns true when now is between start and end', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 11, 0));
    expect(isTimeBetween('10:00', '12:00')).toBe(true);
  });

  it('returns false when now is before start', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 9, 0));
    expect(isTimeBetween('10:00', '12:00')).toBe(false);
  });

  it('returns true at exact start boundary', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isTimeBetween('10:00', '12:00')).toBe(true);
  });

  it('returns false at exact end boundary (exclusive)', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0));
    expect(isTimeBetween('10:00', '12:00')).toBe(false);
  });
});

describe('isToday', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns true for current date', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isToday(new Date(2026, 7, 20))).toBe(true);
  });

  it('returns false for yesterday', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isToday(new Date(2026, 7, 19))).toBe(false);
  });

  it('returns false for tomorrow', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isToday(new Date(2026, 7, 21))).toBe(false);
  });
});

describe('isTomorrow', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns true for tomorrow\'s date', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isTomorrow(new Date(2026, 7, 21))).toBe(true);
  });

  it('returns false for today', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(isTomorrow(new Date(2026, 7, 20))).toBe(false);
  });
});

describe('isSameDayOfWeek', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns true for today', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0)); // Wednesday
    expect(isSameDayOfWeek(new Date(2026, 7, 20))).toBe(true);
  });

  it('returns false for a different day of week', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0)); // Wednesday
    expect(isSameDayOfWeek(new Date(2026, 7, 21))).toBe(false); // Thursday
  });
});

describe('getSecondsElapsed', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns positive seconds when start is in the past', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0));
    expect(getSecondsElapsed('10:00')).toBe(7200);
  });

  it('returns 0 when start is in the future', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(getSecondsElapsed('12:00')).toBe(0);
  });

  it('returns 0 when start matches current time', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(getSecondsElapsed('10:00')).toBe(0);
  });
});

describe('getSecondsRemaining', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns positive seconds when end is in the future', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    expect(getSecondsRemaining('12:00')).toBe(7200);
  });

  it('returns 0 when end is in the past', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0));
    expect(getSecondsRemaining('10:00')).toBe(0);
  });
});

describe('getTaskProgress', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns 0-100 range', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 11, 0));
    const result = getTaskProgress('08:00', '14:00');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('returns 100 when end time is in the past', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    expect(getTaskProgress('08:00', '10:00')).toBe(100);
  });
});

describe('processTasks', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns completed tasks unchanged (early return)', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const task = makeTask({ completed: true, listId: 'today' });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
    expect(result[0].completed).toBe(true);
  });

  it('moves overdue tasks with endTime past to overdue list', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const task = makeTask({ listId: 'today', endTime: '10:00', repeat: 'once' });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('overdue');
  });

  it('does not move tasks that are not yet overdue', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ listId: 'today', endTime: '12:00', repeat: 'once' });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
  });

  it('only moves tasks in today list to overdue', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const task = makeTask({ listId: 'tomorrow', endTime: '10:00', repeat: 'once' });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('tomorrow');
  });

  it('moves both once and daily overdue tasks to overdue', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const onceTask = makeTask({ id: 'once', listId: 'today', endTime: '10:00', repeat: 'once' });
    const dailyTask = makeTask({ id: 'daily', listId: 'today', endTime: '10:00', repeat: 'daily' });
    const result = processTasks([onceTask, dailyTask]);
    expect(result[0].listId).toBe('overdue');
    expect(result[1].listId).toBe('overdue');
  });

  it('completed tasks return unchanged regardless of repeat/listId', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const yesterday = Date.now() - 86400000;
    const task = makeTask({
      listId: 'overdue',
      repeat: 'daily',
      completed: true,
      completedAt: yesterday,
    });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('overdue');
    expect(result[0].completed).toBe(true);
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
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const task = makeTask({ listId: 'today', endTime: undefined });
    const result = processTasks([task]);
    expect(result[0].listId).toBe('today');
  });
});

describe('moveDailyTasks', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

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
    vi.setSystemTime(new Date(2026, 7, 20, 15, 0));
    const task = makeTask({
      repeat: 'once',
      completed: true,
      completedAt: new Date(2026, 7, 19, 10, 0).getTime(),
    });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(true);
  });

  it('does not affect non-completed tasks', () => {
    const task = makeTask({ repeat: 'daily', completed: false });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(false);
  });

  it('handles tasks without completedAt', () => {
    const task = makeTask({ repeat: 'daily', completed: true, completedAt: undefined });
    const result = moveDailyTasks([task]);
    expect(result[0].completed).toBe(true);
  });
});
