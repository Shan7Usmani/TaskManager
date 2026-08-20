'use client';

import { X, Clock, TimerReset, AlertTriangle } from 'lucide-react';
import { Task } from '@/lib/types';

interface AlarmModalProps {
  task: Task;
  onDismiss: () => void;
  onSnooze: () => void;
}

export default function AlarmModal({ task, onDismiss, onSnooze }: AlarmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="glass-strong rounded-2xl w-full max-w-sm shadow-2xl animate-alarm-ring border border-[rgba(255,59,92,0.3)]">
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[rgba(255,59,92,0.1)] border border-[rgba(255,59,92,0.2)] flex items-center justify-center animate-pulse-neon">
            <AlertTriangle className="w-10 h-10 text-neon-red" />
          </div>
          <p
            className="text-[10px] text-neon-red tracking-[0.3em] uppercase mb-3 font-semibold"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            Time Alert
          </p>
          <h2 className="text-xl font-bold text-[#e8e8e8] mb-2">{task.title}</h2>
          {task.startTime && (
            <p className="text-sm text-[#a0a0a0] flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
              {task.startTime}
            </p>
          )}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onSnooze}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 glass rounded-xl text-sm text-[#a0a0a0] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e8e8] transition-all border border-transparent hover:border-[rgba(0,255,122,0.1)]"
          >
            <TimerReset className="w-4 h-4" />
            Snooze 5m
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 btn-solid rounded-xl text-sm font-semibold"
          >
            <X className="w-4 h-4" />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
