import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  _client = createClient(url, key);
  return _client;
}

export async function getOrCreateUserId(): Promise<string> {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('tm_user_id');

  if (userId) return userId;

  const { data, error } = await getSupabase().auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');
  userId = data.user.id;
  localStorage.setItem('tm_user_id', userId);
  return userId;
}

export function resetUser(): void {
  localStorage.removeItem('tm_user_id');
  _client = null;
  window.location.reload();
}
