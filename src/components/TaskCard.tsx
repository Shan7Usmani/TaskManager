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
  Zap,
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
      className={`group relative flex items-start gap-3 p-4 rounded-2xl transition-all duration-300 animate-fade-in border ${
        isActive
          ? 'glass glow-green border-[rgba(0,255,122,0.25)]'
          : 'glass border-transparent hover:border-[rgba(0,255,122,0.1)] hover-glow-green'
      }`}
    >
      <button
        onClick={() => onComplete(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          task.completed
            ? 'bg-neon-green border-neon-green shadow-[0_0_10px_rgba(0,255,122,0.4)]'
            : 'border-[rgba(0,255,122,0.3)] hover:border-neon-green hover:shadow-[0_0_10px_rgba(0,255,122,0.2)]'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-[#05080c]" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.completed ? 'text-[#606060] line-through' : 'text-[#e8e8e8]'
          }`}
        >
          {task.title}
        </p>

        {task.notes && (
          <p className="text-xs text-[#606060] mt-1 truncate">{task.notes}</p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {task.startTime && (
            <span className="inline-flex items-center gap-1 text-xs text-[#a0a0a0] glass px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-neon-cyan" />
              {task.startTime}
              {task.endTime && <span className="text-[#606060]">→ {task.endTime}</span>}
            </span>
          )}
          {repeatLabel && (
            <span className="inline-flex items-center gap-1 text-xs text-[#a0a0a0] glass px-2 py-0.5 rounded-full">
              <Repeat className="w-3 h-3 text-neon-amber" />
              {repeatLabel}
            </span>
          )}
          {task.alarm && (
            <span className="inline-flex items-center gap-1 text-xs text-[#a0a0a0] glass px-2 py-0.5 rounded-full">
              <Bell className="w-3 h-3 text-neon-green" />
            </span>
          )}
        </div>

        {isActive && stopwatch.isActive && (
          <div className="mt-3 p-3 glass rounded-xl border border-[rgba(0,255,122,0.2)] glow-green animate-pulse-neon">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-neon-green font-semibold tracking-wider uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
                <Zap className="w-3 h-3" />
                Active
              </span>
              <span className="text-xs text-[#a0a0a0] font-mono">
                <span className="text-neon-cyan">{stopwatch.elapsedFormatted}</span>
                {task.endTime && (
                  <span className="text-[#606060]"> / {stopwatch.remainingFormatted}</span>
                )}
              </span>
            </div>
            {task.endTime && (
              <div className="w-full h-2 bg-[rgba(0,255,122,0.1)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-green to-neon-cyan rounded-full transition-all duration-1000 progress-glow"
                  style={{ width: `${stopwatch.progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-[#606060] hover:text-neon-red hover:bg-[rgba(255,59,92,0.1)] transition-all duration-200 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
