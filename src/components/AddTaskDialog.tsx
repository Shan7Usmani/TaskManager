'use client';

import { useState } from 'react';
import { RepeatType } from '@/lib/types';
import { RINGTONES } from '@/lib/defaults';
import { X, Bell, Clock, Repeat } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">New Task</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Repeat className="w-4 h-4 text-zinc-500" />
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as RepeatType)}
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-zinc-500" />
            <div className="flex-1 flex gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 text-sm"
              />
              <span className="text-zinc-600 self-center">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-zinc-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-zinc-500" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alarm}
                onChange={(e) => setAlarm(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-zinc-500 focus:ring-zinc-500"
              />
              <span className="text-sm text-zinc-300">Set alarm</span>
            </label>
            {alarm && (
              <select
                value={ringtone}
                onChange={(e) => setRingtone(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-zinc-500"
              >
                {RINGTONES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-zinc-100 text-zinc-900 rounded-lg font-medium hover:bg-white transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
