import { supabase } from '../lib/supabaseClient';

export type MeetingDocument = {
  id: string;
  meeting_uid: string;
  doc_type: 'agenda' | 'minutes' | 'packet' | 'video' | 'other';
  title: string | null;
  url: string;
  created_at: string;
};

export async function fetchMeetingDocuments(meetingUid: string): Promise<{
  data: MeetingDocument[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('meeting_documents')
    .select('id, meeting_uid, doc_type, title, url, created_at')
    .eq('meeting_uid', meetingUid)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as MeetingDocument[], error: null };
}
