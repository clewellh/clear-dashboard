import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';

import { fetchMunicipalities } from '../data/municipalities';
import { fetchMeetingsInRange } from '../data/meetings';
import type { Municipality } from '../types/municipality';

type MeetingModal = {
  title: string;
  start: string;
  municipality?: string | null;
  body_name?: string | null;
  agenda_url?: string | null;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [municipality, setMunicipality] = useState<string>(''); // '' = all
  const [keyword, setKeyword] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);
    const end = new Date(now);
    end.setMonth(end.getMonth() + 2);
    return { start: isoDate(start), end: isoDate(end) };
  });

  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<MeetingModal | null>(null);

  // Load municipalities once
  useEffect(() => {
    (async () => {
      const res = await fetchMunicipalities();
      if (res.error) return;
      setMunicipalities(res.data ?? []);
    })();
  }, []);

  const filters = useMemo(() => {
    return {
      municipality: municipality || undefined,
      keyword: keyword.trim() || undefined,
      body: body.trim() || undefined,
    };
  }, [municipality, keyword, body]);

  // Load meetings whenever range or filters change
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const res = await fetchMeetingsInRange({
        startDate: range.start,
        endDate: range.end,
        municipality: filters.municipality,
        keyword: filters.keyword,
        body: filters.body,
      });

      if (res.error) {
        setError(res.error);
        setEvents([]);
        setLoading(false);
        return;
      }

      setEvents(
        (res.data ?? []).map((m) => ({
          id: String(m.uid ?? `${m.meeting_date}-${m.municipality ?? ''}-${m.body_name ?? ''}`),
          title: `${m.municipality ?? ''}${m.municipality ? ' – ' : ''}${m.body_name ?? ''}${
            m.body_name || m.title ? ': ' : ''
          }${m.title ?? 'Meeting'}`,
          start: m.meeting_date,
          allDay: true,
          extendedProps: {
            municipality: m.municipality ?? null,
            body_name: m.body_name ?? null,
            agenda_url: m.agenda_url ?? null,
          },
        }))
      );

      setLoading(false);
    })();
  }, [range.start, range.end, filters.municipality, filters.keyword, filters.body]);

  function onDatesSet(arg: DatesSetArg) {
    setRange({ start: isoDate(arg.start), end: isoDate(arg.end) });
  }

  function onEventClick(arg: EventClickArg) {
    const props = arg.event.extendedProps as any;

    setModal({
      title: arg.event.title,
      start: arg.event.startStr,
      municipality: props?.municipality ?? null,
      body_name: props?.body_name ?? null,
      agenda_url: props?.agenda_url ?? null,
    });

    // Prevent FullCalendar from navigating away if event has a URL
    arg.jsEvent.preventDefault();
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>My Town</h1>
      <p style={{ marginTop: 0, color: '#444' }}>
        Find public meetings. Filter by town, board, or keyword. Click an event for details.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'end',
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
      >
        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span style={{ fontSize: 12, color: '#333' }}>Municipality</span>
          <select value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
            <option value="">All municipalities</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span style={{ fontSize: 12, color: '#333' }}>Board / Body</span>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="e.g., Planning Board"
          />
        </label>

        <label style={{ display: 'grid', gap: '0.25rem' }}>
          <span style={{ fontSize: 12, color: '#333' }}>Keyword</span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g., redevelopment, cannabis"
          />
        </label>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek',
          }}
          height="auto"
          events={events}
          datesSet={onDatesSet}
          eventClick={onEventClick}
        />
      </div>

      {/* Modal */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: '1rem',
              width: 'min(640px, 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              zIndex: 10000,
              pointerEvents: 'auto',
            }}
          >
            <h2 style={{ marginTop: 0 }}>{modal.title}</h2>

            <p style={{ marginTop: 0, color: '#444' }}>
              <strong>Date:</strong> {modal.start}
              {modal.municipality ? (
                <>
                  <br />
                  <strong>Town:</strong> {modal.municipality}
                </>
              ) : null}
              {modal.body_name ? (
                <>
                  <br />
                  <strong>Body:</strong> {modal.body_name}
                </>
              ) : null}
            </p>

            {modal.agenda_url ? (
              <p>
                <a href={modal.agenda_url} target="_blank" rel="noreferrer">
                  Open agenda / packet
                </a>
              </p>
            ) : (
              <p style={{ color: '#777' }}>No agenda link available yet.</p>
            )}

            <button onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
