'use client';

import { useState } from 'react';
import { RepeatType } from '@/lib/types';
import { RINGTONES } from '@/lib/defaults';
import { X, Bell, Clock, Repeat, Zap } from 'lucide-react';

interface AddTaskDialogProps {
  listId: string;
  onClose: () => void;
  onAdd: (task: {
    listId: string;
    title: string;
    notes?: string;
    repeat: RepeatType;
    startTime?: string;
    endTime?: string;
    alarm: boolean;
    ringtone?: string;
  }) => void;
}

export default function AddTaskDialog({ listId, onClose, onAdd }: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [repeat, setRepeat] = useState<RepeatType>('once');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [alarm, setAlarm] = useState(false);
  const [ringtone, setRingtone] = useState('alarm1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      listId,
      title: title.trim(),
      notes: notes.trim() || undefined,
      repeat,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      alarm,
      ringtone: alarm ? ringtone : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-strong rounded-2xl w-full max-w-md shadow-2xl glow-green animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-[rgba(0,255,122,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[rgba(0,255,122,0.2)] to-[rgba(0,217,255,0.2)] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-neon-green" />
            </div>
            <h2 className="text-base font-bold tracking-wider uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              New Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#606060] hover:text-neon-red hover:bg-[rgba(255,59,92,0.1)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 alien-input rounded-xl text-sm"
            />
          </div>

          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full px-4 py-3 alien-input rounded-xl text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Repeat className="w-4 h-4 text-[#606060]" />
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatType)}
              className="flex-1 px-4 py-2.5 alien-select rounded-xl text-sm"
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#606060]" />
            <div className="flex-1 flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 px-3 py-2.5 alien-input rounded-xl text-sm"
              />
              <span className="text-[#606060] text-xs">→</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 px-3 py-2.5 alien-input rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-[#606060]" />
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={alarm}
                onChange={(e) => setAlarm(e.target.checked)}
                className="alien-checkbox"
              />
              <span className="text-sm text-[#a0a0a0]">Alarm</span>
            </label>
            {alarm && (
              <select
                value={ringtone}
                onChange={(e) => setRingtone(e.target.value)}
                className="flex-1 px-3 py-2 alien-select rounded-xl text-sm"
              >
                {RINGTONES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm text-[#a0a0a0] glass hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 btn-solid rounded-xl text-sm font-semibold"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
