import '@testing-library/jest-dom/vitest';

class MockAudio {
  src = '';
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;

  constructor(src?: string) {
    if (src) this.src = src;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

// @ts-expect-error - overriding global Audio for tests
globalThis.Audio = MockAudio;

// Mock Notification
class MockNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn().mockResolvedValue('granted' as NotificationPermission);
  title: string;
  options?: NotificationOptions;
  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
  }
}
// @ts-expect-error - overriding global Notification for tests
globalThis.Notification = MockNotification;

// Mock crypto.randomUUID
if (!crypto.randomUUID) {
  // @ts-expect-error - polyfill for jsdom
  crypto.randomUUID = () => crypto.getRandomValues(new Uint8Array(16)).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}
