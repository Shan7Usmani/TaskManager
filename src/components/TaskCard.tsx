'use client';

import { Task } from '@/lib/types';
import { useStopwatch } from '@/hooks/useStopwatch';
import {
  Check,
  Trash2,
  Clock,
  Repeat,
  Bell,
  Timer,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, isActive, onComplete, onDelete }: TaskCardProps) {
  const stopwatch = useStopwatch(
    isActive ? task.startTime : undefined,
    isActive ? task.endTime : undefined
  );

  const repeatLabel = task.repeat === 'daily' ? 'Daily' : task.repeat === 'weekly' ? 'Weekly' : null;

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all ${
        isActive
          ? 'bg-zinc-800 border border-zinc-700 shadow-lg'
          : 'bg-zinc-900/50 border border-transparent hover:bg-zinc-800/50 hover:border-zinc-800'
      }`}
    >
      <button
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-zinc-600 hover:border-zinc-400'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
          }`}
        >
          {task.title}
        </p>

        {task.notes && (
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{task.notes}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.startTime && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="w-3 h-3" />
              {task.startTime}
              {task.endTime && ` – ${task.endTime}`}
            </span>
          )}
          {repeatLabel && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Repeat className="w-3 h-3" />
              {repeatLabel}
            </span>
          )}
          {task.alarm && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
              <Bell className="w-3 h-3" />
            </span>
          )}
        </div>

        {isActive && stopwatch.isActive && (
          <div className="mt-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <Timer className="w-3 h-3" />
                In Progress
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {stopwatch.elapsedFormatted}
                {task.endTime && (
                  <span className="text-zinc-600"> / {stopwatch.remainingFormatted} left</span>
                )}
              </span>
            </div>
            {task.endTime && (
              <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${stopwatch.progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
