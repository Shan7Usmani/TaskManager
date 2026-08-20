import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimeEngine } from '@/hooks/useTimeEngine';
import { Task } from '@/lib/types';
import * as store from '@/lib/store';
import * as timeEngine from '@/lib/timeEngine';

vi.mock('@/lib/store', () => ({
  getTasks: vi.fn(),
  saveTasks: vi.fn(),
}));

vi.mock('@/lib/timeEngine', () => ({
  processTasks: vi.fn((tasks: Task[]) => tasks),
  moveDailyTasks: vi.fn((tasks: Task[]) => tasks),
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    listId: 'today',
    title: 'Test',
    repeat: 'once',
    alarm: false,
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.mocked(store.getTasks).mockReturnValue([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useTimeEngine', () => {
  it('calls processTasks and moveDailyTasks on tick', () => {
    const tasks = [makeTask()];
    vi.mocked(store.getTasks).mockReturnValue(tasks);

    renderHook(() => useTimeEngine(tasks, vi.fn()));

    expect(timeEngine.processTasks).toHaveBeenCalledWith(tasks);
    expect(timeEngine.moveDailyTasks).toHaveBeenCalled();
  });

  it('saves processed tasks back to store', () => {
    const tasks = [makeTask()];
    vi.mocked(store.getTasks).mockReturnValue(tasks);

    renderHook(() => useTimeEngine(tasks, vi.fn()));

    expect(store.saveTasks).toHaveBeenCalled();
  });

  it('calls onUpdate with processed tasks', () => {
    const tasks = [makeTask()];
    const onUpdate = vi.fn();
    vi.mocked(store.getTasks).mockReturnValue(tasks);

    renderHook(() => useTimeEngine(tasks, onUpdate));

    expect(onUpdate).toHaveBeenCalled();
  });

  it('runs tick immediately on mount', () => {
    vi.mocked(store.getTasks).mockReturnValue([]);

    renderHook(() => useTimeEngine([], vi.fn()));

    expect(timeEngine.processTasks).toHaveBeenCalled();
  });

  it('sets up 30-second interval', () => {
    renderHook(() => useTimeEngine([], vi.fn()));

    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // processTasks called again after 30s
    expect(timeEngine.processTasks).toHaveBeenCalledTimes(2);
  });

  it('clears interval on unmount', () => {
    const { unmount } = renderHook(() => useTimeEngine([], vi.fn()));

    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('identifies active task when within start/end window', () => {
    const now = new Date(2026, 7, 20, 10, 30);
    vi.setSystemTime(now);

    const task = makeTask({
      id: 'active-task',
      startTime: '10:00',
      endTime: '11:00',
      completed: false,
    });
    vi.mocked(store.getTasks).mockReturnValue([task]);

    const { result } = renderHook(() => useTimeEngine([task], vi.fn()));

    expect(result.current.activeTaskId).toBe('active-task');
  });

  it('returns null activeTaskId when no task is in progress', () => {
    const now = new Date(2026, 7, 20, 8, 0);
    vi.setSystemTime(now);

    const task = makeTask({
      startTime: '10:00',
      endTime: '11:00',
    });
    vi.mocked(store.getTasks).mockReturnValue([task]);

    const { result } = renderHook(() => useTimeEngine([task], vi.fn()));

    expect(result.current.activeTaskId).toBeNull();
  });

  it('returns null activeTaskId for completed tasks even if in time window', () => {
    const now = new Date(2026, 7, 20, 10, 30);
    vi.setSystemTime(now);

    const task = makeTask({
      startTime: '10:00',
      endTime: '11:00',
      completed: true,
    });
    vi.mocked(store.getTasks).mockReturnValue([task]);

    const { result } = renderHook(() => useTimeEngine([task], vi.fn()));
    expect(result.current.activeTaskId).toBeNull();
  });
});
