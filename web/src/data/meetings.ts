// web/src/data/meetings.ts

import { supabase } from '../lib/supabaseClient';
import type { MeetingRow } from '../types/meeting';
import type { DataResult } from './result';

type FetchMeetingsArgs = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  municipality?: string; // exact match on np_meetings.municipality
};

/**
 * Fetch meetings in a date range, optionally filtered by municipality.
 * - No React imports
 * - Typed return
 */
export async function fetchMeetingsInRange(
  args: FetchMeetingsArgs
): Promise<DataResult<MeetingRow[]>> {
  const { startDate, endDate, municipality } = args;

  let q = supabase
    .from('np_meetings')
    .select('uid, meeting_date, municipality, body_name, title, agenda_url')
    .gte('meeting_date', startDate)
    .lte('meeting_date', endDate)
    .order('meeting_date', { ascending: true });

  // Server-side filter (preferred)
  if (municipality && municipality.trim().length > 0) {
    q = q.eq('municipality', municipality.trim());
  }

  const { data, error } = await q;

  if (error) return { data: null, error: error.message ?? 'Unknown Supabase error' };

  return { data: (data ?? []) as MeetingRow[], error: null };
}
