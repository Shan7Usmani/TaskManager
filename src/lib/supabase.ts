import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getOrCreateUserId(): Promise<string> {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('tm_user_id');
  if (userId) return userId;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');
  userId = data.user.id;
  localStorage.setItem('tm_user_id', userId);
  return userId;
}
