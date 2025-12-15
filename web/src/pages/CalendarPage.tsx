// web/src/pages/CalendarPage.tsx

import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventInput } from '@fullcalendar/core';

import { fetchMeetingsInRange } from '../data/meetings';
import { fetchMunicipalities } from '../data/municipalities';
import type { MeetingRow } from '../types/meeting';
import type { MunicipalityRow } from '../types/municipality';

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
    url: m.agenda_url ?? undefined,
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(true);

  const [meetingsError, setMeetingsError] = useState<string | null>(null);
  const [municipalitiesError, setMunicipalitiesError] = useState<string | null>(null);

  const [municipalities, setMunicipalities] = useState<MunicipalityRow[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(''); // '' = all

  const { startStr, endStr } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(today);
    end.setMonth(end.getMonth() + 3);
    return { startStr: toYYYYMMDD(start), endStr: toYYYYMMDD(end) };
  }, []);

  // Load municipalities (once)
  useEffect(() => {
    let cancelled = false;

    async function loadMunicipalities() {
      setLoadingMunicipalities(true);
      setMunicipalitiesError(null);

      const res = await fetchMunicipalities();
      if (cancelled) return;

      if (res.error) {
        setMunicipalitiesError(res.error);
        setMunicipalities([]);
      } else {
        setMunicipalities(res.data);
      }

      setLoadingMunicipalities(false);
    }

    loadMunicipalities();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load meetings (refetch when filter changes)
  useEffect(() => {
    let cancelled = false;

    async function loadMeetings() {
      setLoadingMeetings(true);
      setMeetingsError(null);

      const res = await fetchMeetingsInRange({
        startDate: startStr,
        endDate: endStr,
        municipality: selectedMunicipality || undefined,
      });

      if (cancelled) return;

      if (res.error) {
        setMeetingsError(res.error);
        setEvents([]);
      } else {
        setEvents(res.data.map(meetingToEvent));
      }

      setLoadingMeetings(false);
    }

    loadMeetings();

    return () => {
      cancelled = true;
    };
  }, [startStr, endStr, selectedMunicipality]);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <h1>New Jersey Transparency Hub</h1>
      <p>Public meetings calendar for New Jersey (from Supabase).</p>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <label htmlFor="municipality" style={{ fontWeight: 600 }}>
          Municipality:
        </label>

        <select
          id="municipality"
          value={selectedMunicipality}
          onChange={e => setSelectedMunicipality(e.target.value)}
          disabled={loadingMunicipalities}
          style={{ padding: '0.4rem 0.5rem', minWidth: 240 }}
        >
          <option value="">All municipalities</option>
          {municipalities.map(m => (
            <option key={m.id} value={m.name}>
              {m.name}
              {m.county ? ` (${m.county})` : ''}
            </option>
          ))}
        </select>

        {loadingMunicipalities && <span>Loading towns…</span>}
        {municipalitiesError && <span style={{ color: 'red' }}>{municipalitiesError}</span>}
      </div>

      <div style={{ marginTop: '1rem' }}>
        {loadingMeetings && <p>Loading meetings…</p>}
        {meetingsError && <p style={{ color: 'red' }}>{meetingsError}</p>}
      </div>

      <div
        style={{
          marginTop: '1rem',
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
