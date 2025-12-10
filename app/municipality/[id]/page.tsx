// app/municipality/[id]/page.tsx
// Simple CLEAR-style mock dashboard with a safe fallback to "demo-town".

type PageProps = {
  params: {
    id?: string; // make this optional to be extra safe
  };
};

type TownMetrics = {
  name: string;
  county: string;
  latestBudgetYear: number;
  latestBudget: number;
  corruptionLost: number;
  corruptionRecovered: number;
  estimatedJobsLost: number;
};

const MOCK_TOWNS: Record<string, TownMetrics> = {
  'demo-town': {
    name: 'Example Township',
    county: 'Sample County',
    latestBudgetYear: 2024,
    latestBudget: 25_000_000,
    corruptionLost: 1_200_000,
    corruptionRecovered: 300_000,
    estimatedJobsLost: 15,
  },
  newark: {
    name: 'Newark',
    county: 'Essex',
    latestBudgetYear: 2024,
    latestBudget: 1_200_000_000,
    corruptionLost: 5_000_000,
    corruptionRecovered: 2_000_000,
    estimatedJobsLost: 62,
  },
  trenton: {
    name: 'Trenton',
    county: 'Mercer',
    latestBudgetYear: 2024,
    latestBudget: 380_000_000,
    corruptionLost: 1_800_000,
    corruptionRecovered: 400_000,
    estimatedJobsLost: 22,
  },
};

export default function MunicipalityPage({ params }: PageProps) {
  // Whatever Next gives us from the URL (might be undefined or empty)
  const rawId = params?.id ?? '';

  const allTownIds = Object.keys(MOCK_TOWNS);

  // If rawId matches one of our demo towns, use it.
  // Otherwise, safely fall back to "demo-town" so we always show something.
  const resolvedId = allTownIds.includes(rawId) ? rawId : 'demo-town';

  const town = MOCK_TOWNS[resolvedId];
  const formatter = new Intl.NumberFormat('en-US');

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f5f5f5',
      }}
    >
      <header style={{ marginBottom: '1rem' }}>
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
          }}
        >
          CLEAR Budget & Corruption Dashboard (Mock)
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#555' }}>
          Raw ID from URL:{' '}
          <code
            style={{
              background: '#eee',
              padding: '0.15rem 0.35rem',
              borderRadius: '0.25rem',
            }}
          >
            {rawId || '(none)'}
          </code>{' '}
          • Using data for ID:{' '}
          <code
            style={{
              background: '#e0f2fe',
              padding: '0.15rem 0.35rem',
              borderRadius: '0.25rem',
            }}
          >
            {resolvedId}
          </code>
        </p>
      </header>

      <section
        style={{
          padding: '1rem',
          backgroundColor: '#fff',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          maxWidth: '800px',
        }}
      >
        <h2
          style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
          }}
        >
          {town.name}
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#555',
            marginBottom: '0.75rem',
          }}
        >
          {town.county} County • FY{town.latestBudgetYear} budget
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <MetricCard
            label="Latest adopted budget"
            value={`$${formatter.format(town.latestBudget)}`}
          />
          <MetricCard
            label="Documented corruption & waste (mocked)"
            value={`$${formatter.format(town.corruptionLost)}`}
          />
          <MetricCard
            label="Recovered / clawed back (mocked)"
            value={`$${formatter.format(town.corruptionRecovered)}`}
          />
          <MetricCard
            label="Estimated jobs not created (mocked)"
            value={town.estimatedJobsLost.toFixed(1)}
          />
        </div>

        <p style={{ fontSize: '0.85rem', color: '#555' }}>
          These are mocked numbers to demonstrate the CLEAR concept. In a live
          version, they would be derived from:
        </p>
        <ul
          style={{
            fontSize: '0.85rem',
            color: '#555',
            paddingLeft: '1.25rem',
            marginBottom: 0,
          }}
        >
          <li>Adopted municipal budgets and annual financial statements</li>
          <li>Comptroller, AG, and prosecutor reports on corruption and waste</li>
          <li>
            CLEAR&apos;s formula for translating wasted dollars into
            &quot;jobs foregone&quot;
          </li>
        </ul>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        border: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginBottom: '0.15rem',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
