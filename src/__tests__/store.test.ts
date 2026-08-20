import { describe, it, expect, vi, beforeEach } from 'vitest';

const FAKE_USER_ID = 'test-user-001';
const db: Record<string, Record<string, unknown>[]> = {
  task_lists: [],
  tasks: [],
};

function resetDb() {
  db.task_lists = [];
  db.tasks = [];
}

function makeBuilder(table: string) {
  const store = db[table];
  const filters: { col: string; val: unknown }[] = [];
  let orderCol: string | null = null;
  let orderAsc = true;
  let operation: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  let payload: Record<string, unknown> | null = null;

  const builder = {
    select: vi.fn(() => { operation = 'select'; return builder; }),
    eq: vi.fn((col: string, val: unknown) => { filters.push({ col, val }); return builder; }),
    order: vi.fn((col: string, opts?: { ascending?: boolean }) => { orderCol = col; orderAsc = opts?.ascending ?? true; return builder; }),
    insert: vi.fn((row: Record<string, unknown>) => { operation = 'insert'; payload = row; return builder; }),
    upsert: vi.fn((row: Record<string, unknown>) => { operation = 'upsert'; payload = row; return builder; }),
    update: vi.fn((updates: Record<string, unknown>) => { operation = 'update'; payload = updates; return builder; }),
    delete: vi.fn(() => { operation = 'delete'; return builder; }),
  };

  (builder as unknown as { then: (r: (v: unknown) => void) => void }).then = (resolve: (v: unknown) => void) => {
    const filtered = () => store.filter((row) => filters.every((f) => row[f.col] === f.val));
    switch (operation) {
      case 'select': {
        let result = filtered();
        if (orderCol) {
          result = [...result].sort((a, b) => {
            const av = a[orderCol!], bv = b[orderCol!];
            return orderAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
          });
        }
        resolve({ data: result, error: null, count: result.length });
        break;
      }
      case 'insert':
        store.push({ ...payload });
        resolve({ data: null, error: null });
        break;
      case 'upsert': {
        const idx = store.findIndex((r) => r.id === payload!.id);
        if (idx >= 0) store[idx] = { ...payload };
        else store.push({ ...payload });
        resolve({ data: null, error: null });
        break;
      }
      case 'update':
        for (const row of filtered()) Object.assign(row, payload);
        resolve({ data: null, error: null });
        break;
      case 'delete': {
        for (const f of filters) {
          for (let i = store.length - 1; i >= 0; i--) {
            if (store[i][f.col] === f.val) store.splice(i, 1);
          }
        }
        resolve({ data: null, error: null });
        break;
      }
    }
  };
  return builder;
}

const mockSupabase = {
  auth: {
    signInAnonymously: vi.fn().mockResolvedValue({ data: { user: { id: FAKE_USER_ID } }, error: null }),
  },
  from: vi.fn((table: string) => makeBuilder(table)),
};

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
  getOrCreateUserId: vi.fn().mockResolvedValue(FAKE_USER_ID),
}));

const storeMod = await import('@/lib/store');
const { getLists, saveLists, addList, deleteList, getTasks, saveTasks, addTask, deleteTask, updateTask } = storeMod;

beforeEach(() => {
  resetDb();
  vi.clearAllMocks();
});

describe('getLists', () => {
  it('returns empty when no lists exist', async () => {
    expect(await getLists()).toEqual([]);
  });
});

describe('addList', () => {
  it('creates a list with UUID', async () => {
    const list = await addList('My List');
    expect(list.id).toBeDefined();
    expect(list.id.length).toBeGreaterThan(0);
    expect(list.name).toBe('My List');
    expect(list.isDefault).toBe(false);
  });

  it('list is retrievable', async () => {
    await addList('Persisted');
    const lists = await getLists();
    expect(lists.length).toBe(1);
    expect(lists[0].name).toBe('Persisted');
  });

  it('multiple lists are retrievable', async () => {
    await addList('A');
    await addList('B');
    const lists = await getLists();
    expect(lists.length).toBe(2);
  });
});

describe('saveLists', () => {
  it('upserts lists', async () => {
    await saveLists([
      { id: 'l1', name: 'First', isDefault: true, createdAt: 100 },
      { id: 'l2', name: 'Second', isDefault: false, createdAt: 200 },
    ]);
    const lists = await getLists();
    expect(lists.length).toBe(2);
  });
});

describe('deleteList', () => {
  it('removes the list', async () => {
    const list = await addList('To Delete');
    const before = await getLists();
    expect(before.some((l) => l.id === list.id)).toBe(true);
    await deleteList(list.id);
    const after = await getLists();
    expect(after.some((l) => l.id === list.id)).toBe(false);
  });

  it('also removes tasks in that list', async () => {
    const list = await addList('Custom');
    await addTask({ listId: list.id, title: 'Task', repeat: 'once', alarm: false });
    let tasks = await getTasks();
    expect(tasks.some((t) => t.listId === list.id)).toBe(true);
    await deleteList(list.id);
    tasks = await getTasks();
    expect(tasks.some((t) => t.listId === list.id)).toBe(false);
  });
});

describe('getTasks', () => {
  it('returns empty when no tasks exist', async () => {
    expect(await getTasks()).toEqual([]);
  });
});

describe('addTask', () => {
  it('creates a task with UUID and defaults', async () => {
    const task = await addTask({ listId: 'today', title: 'Buy milk', repeat: 'once', alarm: false });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Buy milk');
    expect(task.completed).toBe(false);
    expect(task.listId).toBe('today');
  });

  it('persists optional fields', async () => {
    const task = await addTask({
      listId: 'tomorrow', title: 'Meeting', notes: 'Zoom', repeat: 'daily',
      startTime: '10:00', endTime: '11:00', alarm: true, ringtone: 'alarm2',
    });
    expect(task.notes).toBe('Zoom');
    expect(task.startTime).toBe('10:00');
    expect(task.alarm).toBe(true);
  });

  it('task is retrievable', async () => {
    const task = await addTask({ listId: 'today', title: 'Findable', repeat: 'once', alarm: false });
    const all = await getTasks();
    expect(all.some((t) => t.id === task.id)).toBe(true);
  });

  it('multiple tasks are retrievable', async () => {
    await addTask({ listId: 'today', title: 'A', repeat: 'once', alarm: false });
    await addTask({ listId: 'today', title: 'B', repeat: 'daily', alarm: true });
    expect((await getTasks()).length).toBe(2);
  });
});

describe('updateTask', () => {
  it('updates a field', async () => {
    const task = await addTask({ listId: 'today', title: 'Original', repeat: 'once', alarm: false });
    await updateTask(task.id, { title: 'Updated' });
    const updated = (await getTasks()).find((t) => t.id === task.id);
    expect(updated?.title).toBe('Updated');
  });

  it('does not modify other tasks', async () => {
    const a = await addTask({ listId: 'today', title: 'A', repeat: 'once', alarm: false });
    const b = await addTask({ listId: 'today', title: 'B', repeat: 'once', alarm: false });
    await updateTask(a.id, { title: 'A Updated' });
    expect((await getTasks()).find((t) => t.id === b.id)?.title).toBe('B');
  });

  it('can move task to another list', async () => {
    const task = await addTask({ listId: 'today', title: 'Move', repeat: 'once', alarm: false });
    await updateTask(task.id, { listId: 'tomorrow' });
    expect((await getTasks()).find((t) => t.id === task.id)?.listId).toBe('tomorrow');
  });

  it('can mark as completed', async () => {
    const task = await addTask({ listId: 'today', title: 'Finish', repeat: 'once', alarm: false });
    await updateTask(task.id, { completed: true, completedAt: Date.now() });
    const done = (await getTasks()).find((t) => t.id === task.id);
    expect(done?.completed).toBe(true);
    expect(done?.completedAt).toBeGreaterThan(0);
  });
});

describe('deleteTask', () => {
  it('removes the task', async () => {
    const task = await addTask({ listId: 'today', title: 'Delete', repeat: 'once', alarm: false });
    await deleteTask(task.id);
    expect((await getTasks()).some((t) => t.id === task.id)).toBe(false);
  });

  it('does not affect other tasks', async () => {
    const a = await addTask({ listId: 'today', title: 'Keep', repeat: 'once', alarm: false });
    const b = await addTask({ listId: 'today', title: 'Remove', repeat: 'once', alarm: false });
    await deleteTask(b.id);
    expect((await getTasks()).some((t) => t.id === a.id)).toBe(true);
  });
});
