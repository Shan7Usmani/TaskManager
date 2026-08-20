let currentAudio: HTMLAudioElement | null = null;

export function playAlarm(ringtoneFile: string): void {
  stopAlarm();
  currentAudio = new Audio(ringtoneFile);
  currentAudio.loop = true;
  currentAudio.volume = 0.7;
  currentAudio.play().catch(() => {});
}

export function stopAlarm(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}
