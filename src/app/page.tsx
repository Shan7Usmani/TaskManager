'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskList, Task, RepeatType } from '@/lib/types';
import {
  getLists,
  saveLists,
  getTasks,
  saveTasks,
  addList,
  deleteList,
  addTask,
  completeTask,
  deleteTask,
  getTasksForList,
  getCompletedTasks,
} from '@/lib/store';
import { useTimeEngine } from '@/hooks/useTimeEngine';
import { useAlarm } from '@/hooks/useAlarm';
import Sidebar from '@/components/Sidebar';
import TaskListDisplay from '@/components/TaskList';
import AddTaskDialog from '@/components/AddTaskDialog';
import AlarmModal from '@/components/AlarmModal';
import { Plus } from 'lucide-react';

export default function Home() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeListId, setActiveListId] = useState('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const refreshData = useCallback(() => {
    setLists(getLists());
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    refreshData();
    setMounted(true);
  }, [refreshData]);

  const { activeTaskId } = useTimeEngine(tasks, (updated) => {
    setTasks(updated);
  });

  const { alarmTask, dismissAlarm, snoozeAlarm } = useAlarm(tasks);

  const taskCounts: Record<string, number> = {};
  for (const list of lists) {
    taskCounts[list.id] = tasks.filter(
      (t) => t.listId === list.id && !t.completed
    ).length;
  }

  const currentList = lists.find((l) => l.id === activeListId);
  const listTasks = getTasksForList(activeListId);
  const listCompleted = getCompletedTasks(activeListId);

  const handleAddTask = (taskData: {
    listId: string;
    title: string;
    notes?: string;
    repeat: RepeatType;
    startTime?: string;
    endTime?: string;
    alarm: boolean;
    ringtone?: string;
  }) => {
    addTask(taskData);
    refreshData();
  };

  const handleComplete = (id: string) => {
    completeTask(id);
    refreshData();
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    refreshData();
  };

  const handleCreateList = (name: string) => {
    addList(name);
    refreshData();
  };

  const handleDeleteList = (id: string) => {
    deleteList(id);
    refreshData();
    if (activeListId === id) setActiveListId('today');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
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

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">
                {currentList?.name || 'Tasks'}
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                {listTasks.length} active · {listCompleted.length} completed
              </p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-medium hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          <TaskListDisplay
            title={currentList?.name || 'Tasks'}
            tasks={listTasks}
            completedTasks={listCompleted}
            activeTaskId={activeTaskId}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </div>
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
