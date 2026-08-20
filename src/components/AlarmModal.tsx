'use client';

import { X, Clock, TimerReset } from 'lucide-react';
import { Task } from '@/lib/types';

interface AlarmModalProps {
  task: Task;
  onDismiss: () => void;
  onSnooze: () => void;
}

export default function AlarmModal({ task, onDismiss, onSnooze }: AlarmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl animate-pulse">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Time for:</h2>
          <p className="text-lg text-zinc-200 font-medium">{task.title}</p>
          {task.startTime && (
            <p className="text-sm text-zinc-500 mt-1">{task.startTime}</p>
          )}
        </div>

        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={onSnooze}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            <TimerReset className="w-4 h-4" />
            Snooze 5m
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-medium hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
