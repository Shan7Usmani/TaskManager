import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLists,
  saveLists,
  getTasks,
  saveTasks,
  addList,
  deleteList,
  renameList,
  addTask,
  updateTask,
  completeTask,
  deleteTask,
  getTasksForList,
  getCompletedTasks,
} from '@/lib/store';
import { DEFAULT_LISTS } from '@/lib/defaults';
import { TaskList, Task } from '@/lib/types';

beforeEach(() => {
  localStorage.clear();
});

describe('getLists', () => {
  it('returns DEFAULT_LISTS when localStorage is empty', () => {
    const lists = getLists();
    expect(lists).toHaveLength(DEFAULT_LISTS.length);
    expect(lists[0].id).toBe('today');
  });

  it('persists default lists to localStorage on first call', () => {
    getLists();
    const stored = localStorage.getItem('taskmanager_lists');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(DEFAULT_LISTS.length);
  });

  it('returns previously saved lists', () => {
    const custom: TaskList[] = [
      { id: 'custom-1', name: 'Custom', isDefault: false, createdAt: 100 },
    ];
    saveLists(custom);
    const lists = getLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].name).toBe('Custom');
  });
});

describe('saveLists', () => {
  it('saves and retrieves lists', () => {
    const lists: TaskList[] = [
      { id: 'a', name: 'A', isDefault: false, createdAt: 1 },
    ];
    saveLists(lists);
    expect(JSON.parse(localStorage.getItem('taskmanager_lists')!)).toEqual(lists);
  });

  it('overwrites existing lists', () => {
    saveLists([{ id: 'first', name: 'First', isDefault: false, createdAt: 1 }]);
    saveLists([{ id: 'second', name: 'Second', isDefault: false, createdAt: 2 }]);
    const result = getLists();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('second');
  });
});

describe('getTasks / saveTasks', () => {
  it('returns empty array when no tasks stored', () => {
    expect(getTasks()).toEqual([]);
  });

  it('saves and retrieves tasks', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        listId: 'today',
        title: 'Test',
        repeat: 'once',
        alarm: false,
        completed: false,
        createdAt: 1,
      },
    ];
    saveTasks(tasks);
    expect(getTasks()).toEqual(tasks);
  });
});

describe('addList', () => {
  it('creates a new list with UUID and appends to existing', () => {
    const list = addList('My List');
    expect(list.id).toBeDefined();
    expect(list.id.length).toBeGreaterThan(0);
    expect(list.name).toBe('My List');
    expect(list.isDefault).toBe(false);
    expect(list.createdAt).toBeGreaterThan(0);

    const all = getLists();
    expect(all.some((l) => l.id === list.id)).toBe(true);
  });

  it('new list is in addition to default lists', () => {
    const before = getLists().length;
    addList('Extra');
    expect(getLists().length).toBe(before + 1);
  });
});

describe('deleteList', () => {
  it('removes the list', () => {
    const list = addList('To Delete');
    deleteList(list.id);
    expect(getLists().some((l) => l.id === list.id)).toBe(false);
  });

  it('reassigns tasks from deleted list to today', () => {
    const list = addList('Custom');
    const task = addTask({
      listId: list.id,
      title: 'Task',
      repeat: 'once',
      alarm: false,
    });
    deleteList(list.id);
    const updated = getTasks().find((t) => t.id === task.id);
    expect(updated?.listId).toBe('today');
  });

  it('does not affect tasks in other lists', () => {
    const listA = addList('ListA');
    const listB = addList('ListB');
    const taskB = addTask({
      listId: listB.id,
      title: 'B Task',
      repeat: 'once',
      alarm: false,
    });
    deleteList(listA.id);
    const updated = getTasks().find((t) => t.id === taskB.id);
    expect(updated?.listId).toBe(listB.id);
  });

  it('does not delete default lists (filter just ignores the id)', () => {
    deleteList('today');
    const lists = getLists();
    expect(lists.some((l) => l.id === 'today')).toBe(true);
  });
});

describe('renameList', () => {
  it('renames a list by id', () => {
    const list = addList('Original');
    renameList(list.id, 'Renamed');
    const updated = getLists().find((l) => l.id === list.id);
    expect(updated?.name).toBe('Renamed');
  });

  it('does not affect other lists', () => {
    const a = addList('A');
    const b = addList('B');
    renameList(a.id, 'A Renamed');
    const bUpdated = getLists().find((l) => l.id === b.id);
    expect(bUpdated?.name).toBe('B');
  });
});

describe('addTask', () => {
  it('creates a task with UUID and defaults', () => {
    const task = addTask({
      listId: 'today',
      title: 'Buy milk',
      repeat: 'once',
      alarm: false,
    });
    expect(task.id).toBeDefined();
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe('Buy milk');
    expect(task.completed).toBe(false);
    expect(task.createdAt).toBeGreaterThan(0);
    expect(task.listId).toBe('today');
  });

  it('persists optional fields', () => {
    const task = addTask({
      listId: 'tomorrow',
      title: 'Meeting',
      notes: 'Zoom link in email',
      repeat: 'daily',
      startTime: '10:00',
      endTime: '11:00',
      alarm: true,
      ringtone: 'alarm2',
    });
    expect(task.notes).toBe('Zoom link in email');
    expect(task.repeat).toBe('daily');
    expect(task.startTime).toBe('10:00');
    expect(task.endTime).toBe('11:00');
    expect(task.alarm).toBe(true);
    expect(task.ringtone).toBe('alarm2');
  });

  it('adds task to getTasks() result', () => {
    const task = addTask({
      listId: 'today',
      title: 'Test',
      repeat: 'once',
      alarm: false,
    });
    expect(getTasks().some((t) => t.id === task.id)).toBe(true);
  });
});

describe('updateTask', () => {
  it('updates a specific field of a task', () => {
    const task = addTask({
      listId: 'today',
      title: 'Original',
      repeat: 'once',
      alarm: false,
    });
    updateTask(task.id, { title: 'Updated' });
    const updated = getTasks().find((t) => t.id === task.id);
    expect(updated?.title).toBe('Updated');
  });

  it('does not modify other tasks', () => {
    const a = addTask({
      listId: 'today',
      title: 'A',
      repeat: 'once',
      alarm: false,
    });
    const b = addTask({
      listId: 'today',
      title: 'B',
      repeat: 'once',
      alarm: false,
    });
    updateTask(a.id, { title: 'A Updated' });
    const bUpdated = getTasks().find((t) => t.id === b.id);
    expect(bUpdated?.title).toBe('B');
  });

  it('can update listId to move a task', () => {
    const task = addTask({
      listId: 'today',
      title: 'Move me',
      repeat: 'once',
      alarm: false,
    });
    updateTask(task.id, { listId: 'tomorrow' });
    const updated = getTasks().find((t) => t.id === task.id);
    expect(updated?.listId).toBe('tomorrow');
  });
});

describe('completeTask', () => {
  it('marks task as completed and sets completedAt', () => {
    const task = addTask({
      listId: 'today',
      title: 'Do laundry',
      repeat: 'once',
      alarm: false,
    });
    completeTask(task.id);
    const updated = getTasks().find((t) => t.id === task.id);
    expect(updated?.completed).toBe(true);
    expect(updated?.completedAt).toBeGreaterThan(0);
  });
});

describe('deleteTask', () => {
  it('removes the task', () => {
    const task = addTask({
      listId: 'today',
      title: 'Delete me',
      repeat: 'once',
      alarm: false,
    });
    deleteTask(task.id);
    expect(getTasks().some((t) => t.id === task.id)).toBe(false);
  });

  it('does not affect other tasks', () => {
    const a = addTask({
      listId: 'today',
      title: 'Keep',
      repeat: 'once',
      alarm: false,
    });
    const b = addTask({
      listId: 'today',
      title: 'Delete',
      repeat: 'once',
      alarm: false,
    });
    deleteTask(b.id);
    expect(getTasks().some((t) => t.id === a.id)).toBe(true);
  });
});

describe('getTasksForList', () => {
  it('returns only non-completed tasks for the list', () => {
    const t1 = addTask({
      listId: 'today',
      title: 'Active',
      repeat: 'once',
      alarm: false,
    });
    const t2 = addTask({
      listId: 'today',
      title: 'Done',
      repeat: 'once',
      alarm: false,
    });
    completeTask(t2.id);

    const result = getTasksForList('today');
    expect(result.some((t) => t.id === t1.id)).toBe(true);
    expect(result.some((t) => t.id === t2.id)).toBe(false);
  });

  it('does not include tasks from other lists', () => {
    addTask({
      listId: 'tomorrow',
      title: 'Tomorrow Task',
      repeat: 'once',
      alarm: false,
    });
    const result = getTasksForList('today');
    expect(result.length).toBe(0);
  });
});

describe('getCompletedTasks', () => {
  it('returns only completed tasks for the list', () => {
    const t1 = addTask({
      listId: 'today',
      title: 'Done',
      repeat: 'once',
      alarm: false,
    });
    completeTask(t1.id);
    addTask({
      listId: 'today',
      title: 'Active',
      repeat: 'once',
      alarm: false,
    });

    const result = getCompletedTasks('today');
    expect(result.length).toBe(1);
    expect(result[0].completed).toBe(true);
  });

  it('returns empty when no completed tasks', () => {
    addTask({
      listId: 'today',
      title: 'Not done',
      repeat: 'once',
      alarm: false,
    });
    expect(getCompletedTasks('today')).toEqual([]);
  });
});
