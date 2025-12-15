// web/src/data/users.ts

import { supabase } from '../lib/supabaseClient';
import type { DataResult } from './result';

export type AppUserProfile = {
  id: string;
  email: string | null;
  role: string | null;
};

export async function fetchMyAppUserProfile(): Promise<DataResult<AppUserProfile>> {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return { data: null, error: userErr.message ?? 'Auth error' };
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('app_users')
    .select('id, email, role')
    .eq('id', user.id)
    .single();

  if (error) return { data: null, error: error.message ?? 'Unknown Supabase error' };

  return { data: (data as AppUserProfile) ?? null, error: null };
}
