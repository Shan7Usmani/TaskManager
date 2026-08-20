'use client';

import { useState, useEffect } from 'react';
import { Task, TaskList, RepeatType } from '@/lib/types';
import { getLists, getTasks, saveLists, saveTasks } from '@/lib/store';
import { DEFAULT_LISTS } from '@/lib/defaults';
import { processTasks } from '@/lib/timeEngine';
import { useTimeEngine } from '@/hooks/useTimeEngine';
import { useAlarm } from '@/hooks/useAlarm';
import Sidebar from '@/components/Sidebar';
import TaskListDisplay from '@/components/TaskList';
import AddTaskDialog from '@/components/AddTaskDialog';
import AlarmModal from '@/components/AlarmModal';
import { Plus, ListTodo } from 'lucide-react';

export default function Home() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeListId, setActiveListId] = useState('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loadedLists = getLists();
    setLists(loadedLists.length > 0 ? loadedLists : DEFAULT_LISTS);
    setTasks(getTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveLists(lists);
  }, [lists, hydrated]);

  useEffect(() => {
    if (hydrated) saveTasks(tasks);
  }, [tasks, hydrated]);

  const updateTasks = (updater: (prev: Task[]) => Task[]) => {
    setTasks((prev) => {
      const next = updater(prev);
      return processTasks(next);
    });
  };

  const { activeTaskId } = useTimeEngine(tasks, (updated) => {
    setTasks(processTasks(updated));
  });

  const { alarmTask, dismissAlarm, snoozeAlarm } = useAlarm(tasks);

  const taskCounts = lists.reduce(
    (acc, list) => {
      acc[list.id] = tasks.filter(
        (t) => t.listId === list.id && !t.completed
      ).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const getActiveListName = () => {
    return lists.find((l) => l.id === activeListId)?.name || 'Tasks';
  };

  const getVisibleTasks = () => {
    const incomplete = tasks.filter(
      (t) => t.listId === activeListId && !t.completed
    );
    const completed = tasks.filter(
      (t) => t.listId === activeListId && t.completed
    );
    return { incomplete, completed };
  };

  const { incomplete, completed } = getVisibleTasks();

  const handleAddTask = (data: {
    listId: string;
    title: string;
    notes?: string;
    repeat: RepeatType;
    startTime?: string;
    endTime?: string;
    alarm: boolean;
    ringtone?: string;
  }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      listId: data.listId,
      title: data.title,
      notes: data.notes,
      repeat: data.repeat,
      startTime: data.startTime,
      endTime: data.endTime,
      alarm: data.alarm,
      ringtone: data.ringtone,
      completed: false,
      createdAt: Date.now(),
    };
    updateTasks((prev) => [...prev, newTask]);
  };

  const handleCreateList = (name: string) => {
    const newList: TaskList = {
      id: crypto.randomUUID(),
      name,
      isDefault: false,
      createdAt: Date.now(),
    };
    setLists((prev) => [...prev, newList]);
  };

  const handleDeleteList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    updateTasks((prev) => prev.filter((t) => t.listId !== id));
    if (activeListId === id) setActiveListId('today');
  };

  const handleComplete = (id: string) => {
    updateTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t))
    );
  };

  const handleDelete = (id: string) => {
    updateTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#05080c] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[rgba(0,255,122,0.2)] to-[rgba(0,217,255,0.2)] flex items-center justify-center glow-green animate-pulse-neon">
            <ListTodo className="w-6 h-6 text-neon-green" />
          </div>
          <p
            className="text-xs text-neon-green tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080c] alien-grid flex flex-col lg:flex-row">
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
        taskCounts={taskCounts}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 min-h-screen lg:h-screen lg:overflow-hidden flex flex-col">
        <header className="flex items-center justify-between p-5 lg:p-8 pb-0 lg:pb-0">
          <div>
            <h1
              className="text-xl lg:text-2xl font-bold tracking-wider uppercase"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {getActiveListName()}
            </h1>
            <p className="text-xs text-[#606060] mt-1">
              {incomplete.length + completed.length} tasks
            </p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-4 py-2.5 btn-solid rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 lg:p-8 pt-4 lg:pt-6">
          <TaskListDisplay
            title={getActiveListName()}
            tasks={incomplete}
            completedTasks={completed}
            activeTaskId={activeTaskId}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </div>

        <footer className="hidden lg:block p-4 border-t border-[rgba(0,255,122,0.06)]">
          <p className="text-[10px] text-[#404040] tracking-widest uppercase text-center" style={{ fontFamily: 'Orbitron, monospace' }}>
            TaskManager // Command Center
          </p>
        </footer>
      </main>

      {showAddTask && (
        <AddTaskDialog
          listId={activeListId}
          onClose={() => setShowAddTask(false)}
          onAdd={handleAddTask}
        />
      )}

      {alarmTask && (
        <AlarmModal
          task={alarmTask}
          onDismiss={dismissAlarm}
          onSnooze={() => snoozeAlarm(5)}
        />
      )}
    </div>
  );
}
