import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlarm } from '@/hooks/useAlarm';
import { Task } from '@/lib/types';
import * as alarms from '@/lib/alarms';

vi.mock('@/lib/alarms', () => ({
  playAlarm: vi.fn(),
  stopAlarm: vi.fn(),
  showNotification: vi.fn(),
  requestNotificationPermission: vi.fn().mockResolvedValue(true),
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    listId: 'today',
    title: 'Alarm Task',
    repeat: 'once',
    startTime: '10:00',
    alarm: true,
    ringtone: 'alarm1',
    completed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAlarm', () => {
  it('returns null alarmTask initially', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 30));
    const { result } = renderHook(() => useAlarm([]));
    expect(result.current.alarmTask).toBeNull();
  });

  it('requests notification permission on mount', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 30));
    renderHook(() => useAlarm([]));
    expect(alarms.requestNotificationPermission).toHaveBeenCalled();
  });

  it('fires alarm when task startTime matches current time', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: '10:00' });

    const { result } = renderHook(() => useAlarm([task]));

    expect(result.current.alarmTask).not.toBeNull();
    expect(result.current.alarmTask?.id).toBe('task-1');
    expect(alarms.playAlarm).toHaveBeenCalled();
    expect(alarms.showNotification).toHaveBeenCalled();
  });

  it('does not fire alarm for completed tasks', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: '10:00', completed: true });

    const { result } = renderHook(() => useAlarm([task]));
    expect(result.current.alarmTask).toBeNull();
  });

  it('does not fire alarm for tasks without alarm enabled', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: '10:00', alarm: false });

    const { result } = renderHook(() => useAlarm([task]));
    expect(result.current.alarmTask).toBeNull();
  });

  it('does not fire alarm for tasks without startTime', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: undefined });

    const { result } = renderHook(() => useAlarm([task]));
    expect(result.current.alarmTask).toBeNull();
  });

  it('dismissAlarm stops the alarm and clears alarmTask', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: '10:00' });

    const { result } = renderHook(() => useAlarm([task]));
    expect(result.current.alarmTask).not.toBeNull();

    act(() => {
      result.current.dismissAlarm();
    });

    expect(alarms.stopAlarm).toHaveBeenCalled();
    expect(result.current.alarmTask).toBeNull();
  });

  it('only fires once for the same task', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: '10:00' });

    const { result, rerender } = renderHook(
      ({ tasks }) => useAlarm(tasks),
      { initialProps: { tasks: [task] } }
    );

    expect(alarms.playAlarm).toHaveBeenCalledTimes(1);

    // Re-render with same tasks at same time
    rerender({ tasks: [task] });
    expect(alarms.playAlarm).toHaveBeenCalledTimes(1);
  });

  it('does not fire alarm when time has not yet reached startTime', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 9, 30));
    const task = makeTask({ startTime: '10:00' });

    const { result } = renderHook(() => useAlarm([task]));
    expect(result.current.alarmTask).toBeNull();
  });

  it('does not fire alarm for tasks in the future time-wise', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 8, 0));
    const task = makeTask({ startTime: '10:00' });

    const { result } = renderHook(() => useAlarm([task]));
    expect(result.current.alarmTask).toBeNull();
  });

  it('snoozeAlarm stops current alarm', () => {
    vi.setSystemTime(new Date(2026, 7, 20, 10, 0));
    const task = makeTask({ startTime: '10:00' });

    const { result } = renderHook(() => useAlarm([task]));

    act(() => {
      result.current.snoozeAlarm(5);
    });

    expect(alarms.stopAlarm).toHaveBeenCalled();
  });
});
