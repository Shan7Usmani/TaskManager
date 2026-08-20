import { TaskList, AlarmRingtone } from './types';

export const DEFAULT_LISTS: TaskList[] = [
  { id: 'today', name: 'Today', isDefault: true, createdAt: Date.now() },
  { id: 'tomorrow', name: 'Tomorrow', isDefault: true, createdAt: Date.now() },
  { id: 'upcoming', name: 'Upcoming', isDefault: true, createdAt: Date.now() },
  { id: 'overdue', name: 'Overdue', isDefault: true, createdAt: Date.now() },
  { id: 'goals', name: 'Main Goals', isDefault: true, createdAt: Date.now() },
];

export const RINGTONES: AlarmRingtone[] = [
  { id: 'alarm1', name: 'Classic Alarm', file: '/sounds/alarm1.mp3' },
  { id: 'alarm2', name: 'Gentle Chime', file: '/sounds/alarm2.mp3' },
  { id: 'alarm3', name: 'Urgent Beep', file: '/sounds/alarm3.mp3' },
];
