import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStopwatch } from '@/hooks/useStopwatch';
import * as timeEngine from '@/lib/timeEngine';

vi.mock('@/lib/timeEngine', () => ({
  getSecondsElapsed: vi.fn(),
  getSecondsRemaining: vi.fn(),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(0);
  vi.mocked(timeEngine.getSecondsRemaining).mockReturnValue(3600);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useStopwatch', () => {
  it('returns isActive false when no startTime', () => {
    const { result } = renderHook(() => useStopwatch(undefined, undefined));
    expect(result.current.isActive).toBe(false);
    expect(result.current.elapsed).toBe(0);
    expect(result.current.remaining).toBe(0);
  });

  it('returns isActive true when startTime is provided', () => {
    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.isActive).toBe(true);
  });

  it('calculates elapsed and remaining on mount', () => {
    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(1800); // 30min
    vi.mocked(timeEngine.getSecondsRemaining).mockReturnValue(1800); // 30min left

    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.elapsed).toBe(1800);
    expect(result.current.remaining).toBe(1800);
  });

  it('calculates progress correctly', () => {
    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(1800);
    vi.mocked(timeEngine.getSecondsRemaining).mockReturnValue(1800);

    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.progress).toBe(50);
  });

  it('formats time under 1 hour as M:SS', () => {
    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(125); // 2:05
    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.elapsedFormatted).toBe('2:05');
  });

  it('formats time over 1 hour as H:MM:SS', () => {
    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(3661); // 1:01:01
    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.elapsedFormatted).toBe('1:01:01');
  });

  it('updates on interval tick', () => {
    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(60);
    vi.mocked(timeEngine.getSecondsRemaining).mockReturnValue(3540);

    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.elapsed).toBe(60);

    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(120);
    vi.mocked(timeEngine.getSecondsRemaining).mockReturnValue(3480);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.elapsed).toBe(120);
    expect(result.current.remaining).toBe(3480);
  });

  it('caps progress at 100', () => {
    vi.mocked(timeEngine.getSecondsElapsed).mockReturnValue(3600);
    vi.mocked(timeEngine.getSecondsRemaining).mockReturnValue(0);

    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.progress).toBe(100);
  });

  it('formats 0 seconds as 0:00', () => {
    const { result } = renderHook(() => useStopwatch('10:00', '11:00'));
    expect(result.current.elapsedFormatted).toBe('0:00');
  });
});
