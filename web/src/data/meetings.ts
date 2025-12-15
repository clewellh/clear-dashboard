// web/src/data/meetings.ts

import { supabase } from '../lib/supabaseClient';
import type { MeetingRow } from '../types/meeting';

export type DataResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

type FetchMeetingsArgs = {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

/**
 * Fetch meetings in a date range.
 * - No React imports
 * - No UI assumptions
 * - Typed return
 */
export async function fetchMeetingsInRange(
  args: FetchMeetingsArgs
): Promise<DataResult<MeetingRow[]>> {
  const { startDate, endDate } = args;

  const { data, error } = await supabase
    .from('np_meetings')
    .select('uid, meeting_date, municipality, body_name, title, agenda_url')
    .gte('meeting_date', startDate)
    .lte('meeting_date', endDate)
    .order('meeting_date', { ascending: true });

  if (error) {
    return { data: null, error: error.message ?? 'Unknown Supabase error' };
  }

  return { data: (data ?? []) as MeetingRow[], error: null };
}
