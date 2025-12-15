// web/src/types/meeting.ts

export type MeetingRow = {
  // Your table uses "uid" (not "id") based on the curl result.
  uid: string;

  meeting_date: string; // YYYY-MM-DD (or ISO date)
  municipality?: string | null;
  body_name?: string | null;
  title?: string | null;
  agenda_url?: string | null;
};
