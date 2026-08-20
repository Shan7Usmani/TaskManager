import { TaskList, Task } from './types';
import { supabase, getOrCreateUserId } from './supabase';

// === LISTS ===

export async function getLists(): Promise<TaskList[]> {
  const userId = await getOrCreateUserId();
  const { data, error } = await supabase
    .from('task_lists')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at).getTime(),
  }));
}

export async function saveLists(lists: TaskList[]): Promise<void> {
  const userId = await getOrCreateUserId();
  for (let i = 0; i < lists.length; i++) {
    const l = lists[i];
    await supabase
      .from('task_lists')
      .upsert({
        id: l.id,
        user_id: userId,
        name: l.name,
        is_default: l.isDefault,
        position: i,
        created_at: new Date(l.createdAt).toISOString(),
      }, { onConflict: 'id' });
  }
}

export async function addList(name: string): Promise<TaskList> {
  const userId = await getOrCreateUserId();
  const newList = {
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    is_default: false,
    position: 999,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('task_lists').insert(newList);
  if (error) throw error;
  return { id: newList.id, name, isDefault: false, createdAt: Date.now() };
}

export async function deleteList(id: string): Promise<void> {
  await supabase.from('task_lists').delete().eq('id', id);
  await supabase.from('tasks').delete().eq('list_id', id);
}

// === TASKS ===

export async function getTasks(): Promise<Task[]> {
  const userId = await getOrCreateUserId();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    listId: row.list_id,
    title: row.title,
    notes: row.notes || undefined,
    repeat: row.repeat,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    alarm: row.alarm,
    ringtone: row.ringtone || undefined,
    completed: row.completed,
    completedAt: row.completed_at || undefined,
    createdAt: row.created_at,
  }));
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const userId = await getOrCreateUserId();
  for (const t of tasks) {
    await supabase
      .from('tasks')
      .upsert({
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
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'completed'>): Promise<Task> {
  const userId = await getOrCreateUserId();
  const newTask = {
    id: crypto.randomUUID(),
    user_id: userId,
    list_id: task.listId,
    title: task.title,
    notes: task.notes || null,
    repeat: task.repeat,
    start_time: task.startTime || null,
    end_time: task.endTime || null,
    alarm: task.alarm,
    ringtone: task.ringtone || null,
    completed: false,
    completed_at: null,
    created_at: Date.now(),
  };
  const { error } = await supabase.from('tasks').insert(newTask);
  if (error) throw error;
  return {
    id: newTask.id,
    listId: newTask.list_id,
    title: newTask.title,
    notes: newTask.notes || undefined,
    repeat: newTask.repeat,
    startTime: newTask.start_time || undefined,
    endTime: newTask.end_time || undefined,
    alarm: newTask.alarm,
    ringtone: newTask.ringtone || undefined,
    completed: false,
    createdAt: newTask.created_at,
  };
}

export async function deleteTask(id: string): Promise<void> {
  await supabase.from('tasks').delete().eq('id', id);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
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
  await supabase.from('tasks').update(dbUpdates).eq('id', id);
}

// === SEED ===

import { DEFAULT_LISTS, DEFAULT_TASKS } from './defaults';

export async function seedIfEmpty(): Promise<void> {
  const userId = await getOrCreateUserId();
  const { count } = await supabase
    .from('task_lists')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (count === 0) {
    for (let i = 0; i < DEFAULT_LISTS.length; i++) {
      await supabase.from('task_lists').insert({
        id: DEFAULT_LISTS[i].id,
        user_id: userId,
        name: DEFAULT_LISTS[i].name,
        is_default: DEFAULT_LISTS[i].isDefault,
        position: i,
        created_at: new Date().toISOString(),
      });
    }
    for (const t of DEFAULT_TASKS) {
      await supabase.from('tasks').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        list_id: t.listId,
        title: t.title,
        notes: t.notes || null,
        repeat: t.repeat,
        start_time: t.startTime || null,
        end_time: t.endTime || null,
        alarm: t.alarm,
        ringtone: t.ringtone || null,
        completed: false,
        completed_at: null,
        created_at: Date.now(),
      });
    }
  }
}
