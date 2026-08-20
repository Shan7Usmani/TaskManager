import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// --- localStorage mock (jsdom provides no real localStorage) ---
const lsStore: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => lsStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { lsStore[key] = String(value); }),
  removeItem: vi.fn((key: string) => { delete lsStore[key]; }),
  clear: vi.fn(() => { for (const k of Object.keys(lsStore)) delete lsStore[k]; }),
  get length() { return Object.keys(lsStore).length; },
  key: vi.fn((i: number) => Object.keys(lsStore)[i] ?? null),
});

// --- Audio mock ---
export const mockAudioInstances: InstanceType<typeof Audio>[] = [];

class MockAudio {
  src = '';
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  constructor(src?: string) {
    if (src) this.src = src;
    mockAudioInstances.push(this as unknown as InstanceType<typeof Audio>);
  }
}

vi.stubGlobal('Audio', MockAudio);

// --- Notification mock ---
export const mockNotificationInstances: { title: string; options?: NotificationOptions }[] = [];

class MockNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn().mockResolvedValue('granted' as NotificationPermission);
  title: string;
  options?: NotificationOptions;
  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
    mockNotificationInstances.push({ title, options });
  }
}

vi.stubGlobal('Notification', MockNotification);

// --- crypto.randomUUID polyfill ---
if (!crypto.randomUUID) {
  // @ts-expect-error - polyfill for jsdom
  crypto.randomUUID = () => crypto.getRandomValues(new Uint8Array(16)).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}
