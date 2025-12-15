import { supabase } from '../lib/supabaseClient';

export type Meeting = {
  uid: string;
  meeting_date: string;
  municipality: string | null;
  body_name: string | null;
  title: string | null;
  agenda_url: string | null;
};

type FetchMeetingsArgs = {
  startDate: string;
  endDate: string;
  municipality?: string;
  body?: string;
  keyword?: string;
};

export async function fetchMeetingsInRange(
  args: FetchMeetingsArgs
): Promise<{ data: Meeting[] | null; error: string | null }> {
  let query = supabase
    .from('np_meetings')
    .select(
      'uid, meeting_date, municipality, body_name, title, agenda_url'
    )
    .gte('meeting_date', args.startDate)
    .lte('meeting_date', args.endDate)
    .order('meeting_date', { ascending: true });

  // Optional filters (server-side)
  if (args.municipality) {
    query = query.eq('municipality', args.municipality);
  }

  if (args.body) {
    query = query.ilike('body_name', `%${args.body}%`);
  }

  if (args.keyword) {
    query = query.ilike('title', `%${args.keyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: (data ?? []) as Meeting[],
    error: null,
  };
}
