// web/src/pages/CalendarPage.tsx

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventInput } from '@fullcalendar/core';
import { supabase } from '../lib/supabaseClient';

type MeetingRow = {
  id?: number;
  meeting_date: string;
  municipality?: string | null;
  body_name?: string | null;
  title?: string | null;
  agenda_url?: string | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeetings() {
      setLoading(true);
      setError(null);

      const today = new Date();
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);

      const end = new Date(today);
      end.setMonth(end.getMonth() + 3);

      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('np_meetings')
        .select('*')
        .gte('meeting_date', startStr)
        .lte('meeting_date', endStr)
        .order('meeting_date', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message ?? 'Unknown error');
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as MeetingRow[];

      const mapped: EventInput[] = rows.map(m => ({
        id: String(
          m.id ??
            `${m.meeting_date}-${m.municipality ?? ''}-${m.body_name ?? ''}`
        ),
        title: `${m.municipality ?? ''}${
          m.municipality ? ' – ' : ''
        }${m.body_name ?? ''}${m.body_name || m.title ? ': ' : ''}${
          m.title ?? 'Meeting'
        }`,
        start: m.meeting_date,
        allDay: true,
        url: m.agenda_url ?? undefined,
      }));

      setEvents(mapped);
      setLoading(false);
    }

    loadMeetings();
  }, []);

  return (
    <div
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1>New Jersey Transparency Hub</h1>
      <p>Public meetings calendar for New Jersey (from Supabase).</p>

      {loading && <p>Loading meetings…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          marginTop: '2rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
        />
      </div>
    </div>
  );
}
