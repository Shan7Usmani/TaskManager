'use client';

import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import { ListChecks } from 'lucide-react';

interface TaskListProps {
  title: string;
  tasks: Task[];
  completedTasks: Task[];
  activeTaskId: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskListDisplay({
  title,
  tasks,
  completedTasks,
  activeTaskId,
  onComplete,
  onDelete,
}: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center glow-green">
            <ListChecks className="w-8 h-8 text-neon-green opacity-50" />
          </div>
          <p className="text-[#606060] text-sm">No tasks here yet</p>
          <p className="text-[#404040] text-xs mt-1">Click &quot;Add Task&quot; to get started</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div key={task.id} style={{ animationDelay: `${i * 50}ms` }}>
            <TaskCard
              task={task}
              isActive={task.id === activeTaskId}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-2 pt-6 border-t border-[rgba(0,255,122,0.08)]">
          <p
            className="text-[10px] text-[#606060] uppercase tracking-[0.2em] font-semibold"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            Completed ({completedTasks.length})
          </p>
          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={false}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
