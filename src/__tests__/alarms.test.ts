import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playAlarm, stopAlarm, requestNotificationPermission, showNotification } from '@/lib/alarms';

let mockAudioInstances: InstanceType<typeof Audio>[] = [];
const OriginalAudio = globalThis.Audio;

beforeEach(() => {
  mockAudioInstances = [];
  // @ts-expect-error - mock
  globalThis.Audio = class MockAudio {
    src = '';
    loop = false;
    volume = 1;
    currentTime = 0;
    paused = true;
    constructor(src?: string) {
      if (src) this.src = src;
      mockAudioInstances.push(this as unknown as InstanceType<typeof Audio>);
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  };
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.Audio = OriginalAudio;
});

describe('playAlarm', () => {
  it('creates an Audio element with the ringtone file', () => {
    playAlarm('/sounds/alarm1.mp3');
    expect(mockAudioInstances.length).toBe(1);
    expect(mockAudioInstances[0].src).toContain('alarm1.mp3');
  });

  it('sets loop to true', () => {
    playAlarm('/sounds/alarm1.mp3');
    expect(mockAudioInstances[0].loop).toBe(true);
  });

  it('sets volume to 0.7', () => {
    playAlarm('/sounds/alarm1.mp3');
    expect(mockAudioInstances[0].volume).toBe(0.7);
  });

  it('calls play()', () => {
    const spy = vi.spyOn(mockAudioInstances[0], 'play');
    playAlarm('/sounds/alarm1.mp3');
    expect(spy).toHaveBeenCalled();
  });

  it('stops previous alarm before starting new one', () => {
    playAlarm('/sounds/alarm1.mp3');
    const first = mockAudioInstances[0];
    playAlarm('/sounds/alarm2.mp3');
    expect(first.pause).toHaveBeenCalled();
    expect(mockAudioInstances.length).toBe(2);
  });
});

describe('stopAlarm', () => {
  it('does nothing when no alarm is playing', () => {
    expect(() => stopAlarm()).not.toThrow();
  });

  it('pauses and resets the current audio', () => {
    playAlarm('/sounds/alarm1.mp3');
    const audio = mockAudioInstances[0];
    stopAlarm();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });
});

describe('requestNotificationPermission', () => {
  it('returns true when permission is already granted', async () => {
    // @ts-expect-error - mock Notification
    globalThis.Notification.permission = 'granted';
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });

  it('returns false when Notification API is not available', async () => {
    const original = globalThis.Notification;
    // @ts-expect-error - removing Notification
    delete globalThis.Notification;
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
    globalThis.Notification = original;
  });
});

describe('showNotification', () => {
  it('creates a notification when permission is granted', () => {
    // @ts-expect-error - mock Notification
    globalThis.Notification.permission = 'granted';
    const spy = vi.spyOn(globalThis, 'Notification');
    showNotification('Title', 'Body');
    expect(spy).toHaveBeenCalledWith('Title', { body: 'Body', icon: '/favicon.ico' });
  });

  it('does not create notification when permission is denied', () => {
    // @ts-expect-error - mock Notification
    globalThis.Notification.permission = 'denied';
    const spy = vi.spyOn(globalThis, 'Notification');
    showNotification('Title', 'Body');
    expect(spy).not.toHaveBeenCalled();
  });
});
