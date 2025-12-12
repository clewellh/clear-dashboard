// src/App.tsx

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { createClient } from '@supabase/supabase-js';
import type { EventInput } from '@fullcalendar/core';

// 🔐 Supabase credentials
const SUPABASE_URL = 'https://xwardemhtxpwxxxxaoix.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YXJkZW1odHhwd3h4eHhhb2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTg3OTMsImV4cCI6MjA3OTk3NDc5M30.u4bbKUcSqUwVyZH30tfC3WupWD4sqIH7XoPjkP2rVQ0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type MeetingRow = {
  id?: number;
  meeting_date: string;
  municipality?: string | null;
  body_name?: string | null;
  title?: string | null;
  agenda_url?: string | null;
};

function App() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

      const startStr = start.toISOString().slice(0, 10); // YYYY-MM-DD
      const endStr = end.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('np_meetings')
        .select('*')
        .gte('meeting_date', startStr)
        .lte('meeting_date', endStr)
        .order('meeting_date', { ascending: true });

      if (error) {
        console.error('Error loading meetings from Supabase:', error);
        setError(error.message ?? 'Unknown Supabase error');
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as MeetingRow[];

      const mapped: EventInput[] = rows.map((m) => ({
        id: String(
          m.id ?? `${m.meeting_date}-${m.municipality ?? ''}-${m.body_name ?? ''}`,
        ),
        title: `${m.municipality ?? ''}${
          m.municipality ? ' – ' : ''
        }${m.body_name ?? ''}${
          m.body_name || m.title ? ': ' : ''
        }${m.title ?? 'Meeting'}`,
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
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1>New Jersey Transparency Hub</h1>
      <p style={{ marginTop: '0.5rem' }}>
        Public meetings calendar for New Jersey (loaded from Supabase).
      </p>

      {loading && (
        <p style={{ marginTop: '0.5rem' }}>Loading meetings from Supabase…</p>
      )}
      {error && (
        <p style={{ marginTop: '0.5rem', color: 'red' }}>
          Error loading meetings: {error}
        </p>
      )}

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

export default App;
