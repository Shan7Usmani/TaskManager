import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLists,
  saveLists,
  addList,
  deleteList,
  getTasks,
  saveTasks,
  addTask,
  deleteTask,
  updateTask,
  seedIfEmpty,
} from '@/lib/store';
import { DEFAULT_LISTS } from '@/lib/defaults';
import { TaskList, Task } from '@/lib/types';

beforeEach(() => {
  localStorage.clear();
});

describe('getLists', () => {
  it('auto-seeds and returns DEFAULT_LISTS when empty', () => {
    const lists = getLists();
    expect(lists).toHaveLength(DEFAULT_LISTS.length);
    expect(lists[0].id).toBe('today');
    expect(lists[0].name).toBe('Today');
  });

  it('persists defaults to localStorage', () => {
    getLists();
    const stored = localStorage.getItem('tm_lists');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toHaveLength(DEFAULT_LISTS.length);
  });

  it('returns previously saved lists', () => {
    const custom: TaskList[] = [
      { id: 'custom-1', name: 'Custom', isDefault: false, createdAt: 100 },
    ];
    saveLists(custom);
    expect(getLists()).toEqual(custom);
  });
});

describe('saveLists', () => {
  it('saves and retrieves lists', () => {
    const lists: TaskList[] = [
      { id: 'a', name: 'A', isDefault: false, createdAt: 1 },
    ];
    saveLists(lists);
    expect(JSON.parse(localStorage.getItem('tm_lists')!)).toEqual(lists);
  });

  it('overwrites existing lists', () => {
    saveLists([{ id: 'first', name: 'First', isDefault: false, createdAt: 1 }]);
    saveLists([{ id: 'second', name: 'Second', isDefault: false, createdAt: 2 }]);
    const result = getLists();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('second');
  });
});

describe('addList', () => {
  it('creates a list with UUID', () => {
    const list = addList('My List');
    expect(list.id).toBeDefined();
    expect(list.id.length).toBeGreaterThan(0);
    expect(list.name).toBe('My List');
    expect(list.isDefault).toBe(false);
    expect(list.createdAt).toBeGreaterThan(0);
  });

  it('appends to existing lists', () => {
    const before = getLists().length;
    addList('Extra');
    expect(getLists().length).toBe(before + 1);
  });

  it('new list is findable by id', () => {
    const list = addList('Findable');
    const all = getLists();
    expect(all.some((l) => l.id === list.id)).toBe(true);
  });
});

describe('deleteList', () => {
  it('removes the list', () => {
    const list = addList('To Delete');
    deleteList(list.id);
    expect(getLists().some((l) => l.id === list.id)).toBe(false);
  });

  it('removes tasks in that list', () => {
    const list = addList('Custom');
    addTask({ listId: list.id, title: 'Task', repeat: 'once', alarm: false });
    expect(getTasks().some((t) => t.listId === list.id)).toBe(true);
    deleteList(list.id);
    expect(getTasks().some((t) => t.listId === list.id)).toBe(false);
  });

  it('does not affect tasks in other lists', () => {
    const listA = addList('A');
    const listB = addList('B');
    const taskB = addTask({ listId: listB.id, title: 'B Task', repeat: 'once', alarm: false });
    deleteList(listA.id);
    expect(getTasks().find((t) => t.id === taskB.id)?.listId).toBe(listB.id);
  });
});

describe('getTasks', () => {
  it('returns empty when no tasks exist', () => {
    expect(getTasks()).toEqual([]);
  });
});

describe('saveTasks', () => {
  it('saves and retrieves tasks', () => {
    const tasks: Task[] = [
      { id: 't1', listId: 'today', title: 'Test', repeat: 'once', alarm: false, completed: false, createdAt: 1 },
    ];
    saveTasks(tasks);
    expect(getTasks()).toEqual(tasks);
  });

  it('overwrites existing tasks', () => {
    saveTasks([{ id: 't1', listId: 'today', title: 'First', repeat: 'once', alarm: false, completed: false, createdAt: 1 }]);
    saveTasks([{ id: 't2', listId: 'today', title: 'Second', repeat: 'once', alarm: false, completed: false, createdAt: 2 }]);
    const result = getTasks();
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Second');
  });
});

describe('addTask', () => {
  it('creates a task with UUID and defaults', () => {
    const task = addTask({ listId: 'today', title: 'Buy milk', repeat: 'once', alarm: false });
    expect(task.id).toBeDefined();
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe('Buy milk');
    expect(task.completed).toBe(false);
    expect(task.createdAt).toBeGreaterThan(0);
    expect(task.listId).toBe('today');
  });

  it('persists optional fields', () => {
    const task = addTask({
      listId: 'tomorrow', title: 'Meeting', notes: 'Zoom link', repeat: 'daily',
      startTime: '10:00', endTime: '11:00', alarm: true, ringtone: 'alarm2',
    });
    expect(task.notes).toBe('Zoom link');
    expect(task.repeat).toBe('daily');
    expect(task.startTime).toBe('10:00');
    expect(task.endTime).toBe('11:00');
    expect(task.alarm).toBe(true);
    expect(task.ringtone).toBe('alarm2');
  });

  it('task is retrievable via getTasks', () => {
    const task = addTask({ listId: 'today', title: 'Findable', repeat: 'once', alarm: false });
    expect(getTasks().some((t) => t.id === task.id)).toBe(true);
  });

  it('multiple tasks are retrievable', () => {
    addTask({ listId: 'today', title: 'A', repeat: 'once', alarm: false });
    addTask({ listId: 'today', title: 'B', repeat: 'daily', alarm: true });
    expect(getTasks().length).toBe(2);
  });
});

describe('updateTask', () => {
  it('updates a specific field', () => {
    const task = addTask({ listId: 'today', title: 'Original', repeat: 'once', alarm: false });
    updateTask(task.id, { title: 'Updated' });
    expect(getTasks().find((t) => t.id === task.id)?.title).toBe('Updated');
  });

  it('does not modify other tasks', () => {
    const a = addTask({ listId: 'today', title: 'A', repeat: 'once', alarm: false });
    const b = addTask({ listId: 'today', title: 'B', repeat: 'once', alarm: false });
    updateTask(a.id, { title: 'A Updated' });
    expect(getTasks().find((t) => t.id === b.id)?.title).toBe('B');
  });

  it('can move task to another list', () => {
    const task = addTask({ listId: 'today', title: 'Move', repeat: 'once', alarm: false });
    updateTask(task.id, { listId: 'tomorrow' });
    expect(getTasks().find((t) => t.id === task.id)?.listId).toBe('tomorrow');
  });

  it('can mark as completed', () => {
    const task = addTask({ listId: 'today', title: 'Finish', repeat: 'once', alarm: false });
    updateTask(task.id, { completed: true, completedAt: Date.now() });
    const done = getTasks().find((t) => t.id === task.id);
    expect(done?.completed).toBe(true);
    expect(done?.completedAt).toBeGreaterThan(0);
  });
});

describe('deleteTask', () => {
  it('removes the task', () => {
    const task = addTask({ listId: 'today', title: 'Delete', repeat: 'once', alarm: false });
    deleteTask(task.id);
    expect(getTasks().some((t) => t.id === task.id)).toBe(false);
  });

  it('does not affect other tasks', () => {
    const a = addTask({ listId: 'today', title: 'Keep', repeat: 'once', alarm: false });
    const b = addTask({ listId: 'today', title: 'Remove', repeat: 'once', alarm: false });
    deleteTask(b.id);
    expect(getTasks().some((t) => t.id === a.id)).toBe(true);
  });
});

describe('seedIfEmpty', () => {
  it('seeds DEFAULT_TASKS when localStorage is empty', () => {
    seedIfEmpty();
    expect(getTasks().length).toBeGreaterThan(0);
  });

  it('does not re-seed when tasks already exist', () => {
    addTask({ listId: 'today', title: 'Existing', repeat: 'once', alarm: false });
    const before = getTasks().length;
    seedIfEmpty();
    expect(getTasks().length).toBe(before);
  });
});
