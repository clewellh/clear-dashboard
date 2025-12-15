// web/src/pages/CalendarPage.tsx

import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventInput } from '@fullcalendar/core';

import { fetchMeetingsInRange } from '../data/meetings';
import type { MeetingRow } from '../types/meeting';

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function meetingToEvent(m: MeetingRow): EventInput {
  return {
    id: m.uid,
    title: `${m.municipality ?? ''}${m.municipality ? ' – ' : ''}${m.body_name ?? ''}${
      m.body_name || m.title ? ': ' : ''
    }${m.title ?? 'Meeting'}`,
    start: m.meeting_date,
    allDay: true,
    url: m.agenda_url ?? undefined
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the exact same date window behavior you had before:
  // start = 1 month ago, end = 3 months ahead
  const { startStr, endStr } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(today);
    end.setMonth(end.getMonth() + 3);

    return { startStr: toYYYYMMDD(start), endStr: toYYYYMMDD(end) };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const res = await fetchMeetingsInRange({ startDate: startStr, endDate: endStr });

      if (cancelled) return;

      if (res.error) {
        setError(res.error);
        setEvents([]);
        setLoading(false);
        return;
      }

      const mapped = res.data.map(meetingToEvent);
      setEvents(mapped);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [startStr, endStr]);

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
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
          padding: '1rem'
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
