export type RepeatType = 'once' | 'daily' | 'weekly';

export interface TaskList {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  notes?: string;
  repeat: RepeatType;
  startTime?: string;
  endTime?: string;
  alarm: boolean;
  ringtone?: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

export type AlarmRingtone = {
  id: string;
  name: string;
  file: string;
};
