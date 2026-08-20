import { TaskList, Task } from './types';
import { DEFAULT_LISTS } from './defaults';

const LISTS_KEY = 'tm_lists';
const TASKS_KEY = 'tm_tasks';

export function getLists(): TaskList[] {
  if (typeof window === 'undefined') return DEFAULT_LISTS;
  const raw = localStorage.getItem(LISTS_KEY);
  if (!raw) {
    localStorage.setItem(LISTS_KEY, JSON.stringify(DEFAULT_LISTS));
    return DEFAULT_LISTS;
  }
  return JSON.parse(raw);
}

export function saveLists(lists: TaskList[]): void {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export function getTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function addList(name: string): TaskList {
  const lists = getLists();
  const newList: TaskList = {
    id: crypto.randomUUID(),
    name,
    isDefault: false,
    createdAt: Date.now(),
  };
  lists.push(newList);
  saveLists(lists);
  return newList;
}

export function deleteList(id: string): void {
  saveLists(getLists().filter((l) => l.id !== id));
  saveTasks(getTasks().filter((t) => t.listId !== id));
}

export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'completed'>): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    completed: false,
    createdAt: Date.now(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function deleteTask(id: string): void {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

export function updateTask(id: string, updates: Partial<Task>): void {
  saveTasks(getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t)));
}

import { DEFAULT_TASKS } from './defaults';

export function seedIfEmpty(): void {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(TASKS_KEY);
  if (existing) return;
  const seeded = DEFAULT_TASKS.map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    completed: false,
    createdAt: Date.now(),
  }));
  saveTasks(seeded);
}
