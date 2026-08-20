import { TaskList, Task, RepeatType } from './types';
import { getSupabase, getUserId } from './supabase';
import { DEFAULT_LISTS, DEFAULT_TASKS } from './defaults';

const LISTS_KEY = 'tm_lists';
const TASKS_KEY = 'tm_tasks';

// === LIST OPERATIONS ===

export async function getLists(): Promise<TaskList[]> {
  const userId = await getUserId();
  const sb = getSupabase();

  if (sb && userId) {
    try {
      const { data, error } = await sb
        .from('task_lists')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          name: r.name as string,
          isDefault: r.is_default as boolean,
          createdAt: new Date(r.created_at as string).getTime(),
        }));
      }
    } catch { /* fall through to localStorage */ }
  }

  // localStorage fallback
  if (typeof window === 'undefined') return DEFAULT_LISTS;
  const raw = localStorage.getItem(LISTS_KEY);
  if (!raw) {
    localStorage.setItem(LISTS_KEY, JSON.stringify(DEFAULT_LISTS));
    return DEFAULT_LISTS;
  }
  return JSON.parse(raw);
}

export async function saveLists(lists: TaskList[]): Promise<void> {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));

  const userId = await getUserId();
  const sb = getSupabase();
  if (!sb || !userId) return;

  try {
    for (let i = 0; i < lists.length; i++) {
      const l = lists[i];
      await sb.from('task_lists').upsert({
        id: l.id,
        user_id: userId,
        name: l.name,
        is_default: l.isDefault,
        position: i,
        created_at: new Date(l.createdAt).toISOString(),
      }, { onConflict: 'id' });
    }
  } catch { /* localStorage already saved */ }
}

export async function addList(name: string): Promise<TaskList> {
  const newList: TaskList = {
    id: crypto.randomUUID(),
    name,
    isDefault: false,
    createdAt: Date.now(),
  };

  const lists = await getLists();
  lists.push(newList);
  await saveLists(lists);

  const userId = await getUserId();
  const sb = getSupabase();
  if (sb && userId) {
    try {
      await sb.from('task_lists').insert({
        id: newList.id,
        user_id: userId,
        name,
        is_default: false,
        position: lists.length - 1,
        created_at: new Date().toISOString(),
      });
    } catch { /* already saved */ }
  }

  return newList;
}

export async function deleteList(id: string): Promise<void> {
  const lists = (await getLists()).filter((l) => l.id !== id);
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  const tasks = (await getTasks()).filter((t) => t.listId !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const userId = await getUserId();
  const sb = getSupabase();
  if (sb && userId) {
    try {
      await sb.from('task_lists').delete().eq('id', id);
      await sb.from('tasks').delete().eq('list_id', id);
    } catch { /* already deleted locally */ }
  }
}

// === TASK OPERATIONS ===

export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId();
  const sb = getSupabase();

  if (sb && userId) {
    try {
      const { data, error } = await sb
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      if (!error && data && data.length > 0) {
        return data.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          listId: r.list_id as string,
          title: r.title as string,
          notes: (r.notes as string) || undefined,
          repeat: r.repeat as RepeatType,
          startTime: (r.start_time as string) || undefined,
          endTime: (r.end_time as string) || undefined,
          alarm: r.alarm as boolean,
          ringtone: (r.ringtone as string) || undefined,
          completed: r.completed as boolean,
          completedAt: (r.completed_at as number) || undefined,
          createdAt: r.created_at as number,
        }));
      }
    } catch { /* fall through to localStorage */ }
  }

  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const userId = await getUserId();
  const sb = getSupabase();
  if (!sb || !userId) return;

  try {
    for (const t of tasks) {
      await sb.from('tasks').upsert({
        id: t.id,
        user_id: userId,
        list_id: t.listId,
        title: t.title,
        notes: t.notes || null,
        repeat: t.repeat,
        start_time: t.startTime || null,
        end_time: t.endTime || null,
        alarm: t.alarm,
        ringtone: t.ringtone || null,
        completed: t.completed,
        completed_at: t.completedAt || null,
        created_at: t.createdAt,
      }, { onConflict: 'id' });
    }
  } catch { /* localStorage already saved */ }
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'completed'>): Promise<Task> {
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    completed: false,
    createdAt: Date.now(),
  };

  const tasks = await getTasks();
  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const userId = await getUserId();
  const sb = getSupabase();
  if (sb && userId) {
    try {
      await sb.from('tasks').insert({
        id: newTask.id,
        user_id: userId,
        list_id: newTask.listId,
        title: newTask.title,
        notes: newTask.notes || null,
        repeat: newTask.repeat,
        start_time: newTask.startTime || null,
        end_time: newTask.endTime || null,
        alarm: newTask.alarm,
        ringtone: newTask.ringtone || null,
        completed: false,
        completed_at: null,
        created_at: newTask.createdAt,
      });
    } catch { /* already saved locally */ }
  }

  return newTask;
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = (await getTasks()).filter((t) => t.id !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const userId = await getUserId();
  const sb = getSupabase();
  if (sb && userId) {
    try {
      await sb.from('tasks').delete().eq('id', id);
    } catch { /* already deleted locally */ }
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const tasks = (await getTasks()).map((t) => (t.id === id ? { ...t, ...updates } : t));
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

  const userId = await getUserId();
  const sb = getSupabase();
  if (!sb || !userId) return;

  try {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.listId !== undefined) dbUpdates.list_id = updates.listId;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
    if (updates.repeat !== undefined) dbUpdates.repeat = updates.repeat;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime || null;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime || null;
    if (updates.alarm !== undefined) dbUpdates.alarm = updates.alarm;
    if (updates.ringtone !== undefined) dbUpdates.ringtone = updates.ringtone || null;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt || null;
    await sb.from('tasks').update(dbUpdates).eq('id', id);
  } catch { /* already saved locally */ }
}

// === SEED ===

export async function seedIfEmpty(): Promise<void> {
  if (typeof window === 'undefined') return;

  const existing = localStorage.getItem(TASKS_KEY);
  if (existing) {
    // Already seeded locally, just sync to Supabase in background
    syncToSupabase();
    return;
  }

  // First visit: seed defaults
  const seeded = DEFAULT_TASKS.map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    completed: false,
    createdAt: Date.now(),
  }));
  localStorage.setItem(TASKS_KEY, JSON.stringify(seeded));
  localStorage.setItem(LISTS_KEY, JSON.stringify(DEFAULT_LISTS));

  // Sync to Supabase in background
  syncToSupabase();
}

async function syncToSupabase(): Promise<void> {
  const userId = await getUserId();
  const sb = getSupabase();
  if (!sb || !userId) return;

  try {
    const { count } = await sb
      .from('task_lists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count && count > 0) return; // Already synced

    // Sync lists
    const lists = JSON.parse(localStorage.getItem(LISTS_KEY) || '[]');
    for (let i = 0; i < lists.length; i++) {
      await sb.from('task_lists').upsert({
        id: lists[i].id,
        user_id: userId,
        name: lists[i].name,
        is_default: lists[i].isDefault,
        position: i,
        created_at: new Date(lists[i].createdAt).toISOString(),
      }, { onConflict: 'id' });
    }

    // Sync tasks
    const tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    for (const t of tasks) {
      await sb.from('tasks').upsert({
        id: t.id,
        user_id: userId,
        list_id: t.listId,
        title: t.title,
        notes: t.notes || null,
        repeat: t.repeat,
        start_time: t.startTime || null,
        end_time: t.endTime || null,
        alarm: t.alarm,
        ringtone: t.ringtone || null,
        completed: t.completed,
        completed_at: t.completedAt || null,
        created_at: t.createdAt,
      }, { onConflict: 'id' });
    }
  } catch { /* localStorage is already good */ }
}
