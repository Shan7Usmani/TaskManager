'use client';

import { Task } from '@/lib/types';
import TaskCard from './TaskCard';

interface TaskListProps {
  title: string;
  tasks: Task[];
  completedTasks: Task[];
  activeTaskId: string | null;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({
  title,
  tasks,
  completedTasks,
  activeTaskId,
  onComplete,
  onDelete,
}: TaskListProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {tasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-600 text-sm">No tasks here yet</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isActive={task.id === activeTaskId}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">
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
