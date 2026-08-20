import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playAlarm, stopAlarm, requestNotificationPermission, showNotification } from '@/lib/alarms';
import { mockAudioInstances, mockNotificationInstances } from './setup';

describe('playAlarm', () => {
  beforeEach(() => {
    mockAudioInstances.length = 0;
    mockNotificationInstances.length = 0;
  });

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
    playAlarm('/sounds/alarm1.mp3');
    expect(mockAudioInstances[0].play).toHaveBeenCalled();
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
  beforeEach(() => {
    mockAudioInstances.length = 0;
  });

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
  beforeEach(() => {
    mockNotificationInstances.length = 0;
    // @ts-expect-error - mock Notification
    globalThis.Notification.permission = 'granted';
  });

  it('creates a notification when permission is granted', () => {
    showNotification('Title', 'Body');
    expect(mockNotificationInstances.length).toBe(1);
    expect(mockNotificationInstances[0].title).toBe('Title');
    expect(mockNotificationInstances[0].options).toEqual({ body: 'Body', icon: '/favicon.ico' });
  });

  it('does not create notification when permission is denied', () => {
    // @ts-expect-error - mock Notification
    globalThis.Notification.permission = 'denied';
    showNotification('Title', 'Body');
    expect(mockNotificationInstances.length).toBe(0);
  });
});
