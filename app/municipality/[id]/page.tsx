'use client';

import { usePathname } from 'next/navigation';

type TownMetrics = {
  id: string;
  name: string;
  county: string;
  latestBudgetYear: number;
  latestBudget: number;
  corruptionLost: number;
  corruptionRecovered: number;
  estimatedJobsLost: number;
};

// This is your "jobs lost" formula: jobs = dollars lost / JOB_COST_CONSTANT
const JOB_COST_CONSTANT = 120_000; // $120k per job (salary + benefits + overhead)

// Mocked data for a few towns.
// Keys MUST match the slugs coming from your Squarespace map (e.g. "newark").
const MOCK_TOWNS: Record<string, TownMetrics> = {
  'demo-town': {
    id: 'demo-town',
    name: 'Example Township',
    county: 'Sample County',
    latestBudgetYear: 2024,
    latestBudget: 25_000_000,
    corruptionLost: 1_200_000,
    corruptionRecovered: 300_000,
    estimatedJobsLost: Math.round((1_200_000 / JOB_COST_CONSTANT) * 10) / 10,
  },
  newark: {
    id: 'newark',
    name: 'Newark',
    county: 'Essex',
    latestBudgetYear: 2024,
    latestBudget: 1_200_000_000,
    corruptionLost: 5_000_000,
    corruptionRecovered: 2_000_000,
    estimatedJobsLost: Math.round((5_000_000 / JOB_COST_CONSTANT) * 10) / 10,
  },
  trenton: {
    id: 'trenton',
    name: 'Trenton',
    county: 'Mercer',
    latestBudgetYear: 2024,
    latestBudget: 380_000_000,
    corruptionLost: 1_800_000,
    corruptionRecovered: 400_000,
    estimatedJobsLost: Math.round((1_800_000 / JOB_COST_CONSTANT) * 10) / 10,
  },
  'new-providence': {
    id: 'new-providence',
    name: 'New Providence',
    county: 'Union',
    latestBudgetYear: 2024,
    latestBudget: 40_000_000,
    corruptionLost: 0,
    corruptionRecovered: 0,
    estimatedJobsLost: 0,
  },
};

export default function MunicipalityPage() {
  const pathname = usePathname();
  // e.g. "/municipality/newark" -> ["municipality", "newark"]
  const segments = pathname.split('/').filter(Boolean);
  const rawId = segments[segments.length - 1] ?? '';

  const formatter = new Intl.NumberFormat('en-US');

  const hasRealData = !!MOCK_TOWNS[rawId];

  const town = hasRealData
    ? MOCK_TOWNS[rawId]
    : buildPlaceholderTown(rawId || 'unknown-town');

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
          CLEAR Budget &amp; Corruption Dashboard
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#555' }}>
          Town ID from URL:{' '}
          <code
            style={{
              background: '#eee',
              padding: '0.15rem 0.35rem',
              borderRadius: '0.25rem',
            }}
          >
            {rawId || '(none)'}
          </code>
        </p>
      </header>

      <section
        style={{
          padding: '1rem',
          backgroundColor: '#fff',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          maxWidth: '900px',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
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
          {town.county
            ? `${town.county} County`
            : 'New Jersey municipality'}{' '}
          • FY{town.latestBudgetYear} budget (mocked)
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
            label="Latest adopted budget (mocked)"
            value={`$${formatter.format(town.latestBudget)}`}
          />
          <MetricCard
            label="Documented corruption &amp; waste (mocked)"
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

        {hasRealData ? (
          <p style={{ fontSize: '0.85rem', color: '#555' }}>
            These numbers are mocked but town-specific. In a live version,
            CLEAR will replace them with data from:
            <ul
              style={{
                fontSize: '0.85rem',
                color: '#555',
                paddingLeft: '1.25rem',
                marginTop: '0.35rem',
              }}
            >
              <li>Adopted municipal budgets and annual financial reports</li>
              <li>
                Comptroller, AG, and prosecutor investigations into local corruption
              </li>
              <li>
                CLEAR&apos;s transparent formula for translating wasted dollars into
                &quot;jobs foregone&quot;
              </li>
            </ul>
          </p>
        ) : (
          <div
            style={{
              fontSize: '0.85rem',
              color: '#555',
              background: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              border: '1px dashed #d1d5db',
            }}
          >
            <strong>Data coming soon for this town.</strong>
            <br />
            CLEAR will ingest:
            <ul
              style={{
                fontSize: '0.85rem',
                color: '#555',
                paddingLeft: '1.25rem',
                marginTop: '0.35rem',
              }}
            >
              <li>Budget documents and financial statements</li>
              <li>State and local corruption audits and enforcement actions</li>
              <li>
                A public formula converting wasted dollars into local jobs not created
              </li>
            </ul>
            <p style={{ marginTop: '0.35rem' }}>
              For now, this page is a placeholder so your town&apos;s link from the
              CLEAR Gradebook map doesn&apos;t go to a dead end.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function buildPlaceholderTown(id: string): TownMetrics {
  return {
    id,
    name: prettifySlug(id),
    county: '',
    latestBudgetYear: 2024,
    latestBudget: 0,
    corruptionLost: 0,
    corruptionRecovered: 0,
    estimatedJobsLost: 0,
  };
}

// Turn "new-providence" into "New Providence"
function prettifySlug(slug: string): string {
  if (!slug || slug === 'unknown-town') return 'New Jersey Municipality';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
