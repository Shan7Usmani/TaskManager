import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith('http')) return null;
  _client = createClient(url, key);
  return _client;
}

let _userId: string | null = null;

export async function getUserId(): Promise<string | null> {
  if (_userId) return _userId;
  if (typeof window === 'undefined') return null;

  // Check localStorage first
  const stored = localStorage.getItem('tm_user_id');
  if (stored) {
    _userId = stored;
    return stored;
  }

  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data?.user) return null;

  _userId = data.user.id;
  localStorage.setItem('tm_user_id', data.user.id);
  return data.user.id;
}

export function isSupabaseAvailable(): boolean {
  return getSupabase() !== null;
}
