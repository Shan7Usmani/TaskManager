import { TaskList, Task } from './types';
import { DEFAULT_LISTS, DEFAULT_TASKS } from './defaults';

const LISTS_KEY = 'taskmanager_lists';
const TASKS_KEY = 'taskmanager_tasks';

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
  if (!raw) {
    const seeded = DEFAULT_TASKS.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
    }));
    localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
    return seeded;
  }
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
  const lists = getLists().filter((l) => l.id !== id);
  saveLists(lists);
  const tasks = getTasks().map((t) =>
    t.listId === id ? { ...t, listId: 'today' } : t
  );
  saveTasks(tasks);
}

export function renameList(id: string, name: string): void {
  const lists = getLists().map((l) => (l.id === id ? { ...l, name } : l));
  saveLists(lists);
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

export function updateTask(id: string, updates: Partial<Task>): void {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, ...updates } : t));
  saveTasks(tasks);
}

export function completeTask(id: string): void {
  const tasks = getTasks().map((t) =>
    t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t
  );
  saveTasks(tasks);
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}

export function getTasksForList(listId: string): Task[] {
  return getTasks().filter((t) => t.listId === listId && !t.completed);
}

export function getCompletedTasks(listId: string): Task[] {
  return getTasks().filter((t) => t.listId === listId && t.completed);
}
