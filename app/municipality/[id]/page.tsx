'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getMunicipalityDashboardData, MunicipalityDashboardData } from '@/app/lib/municipalityService';

  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function MunicipalityPage() {
  const pathname = usePathname();

  // Last segment of /municipality/newark => "newark"
  const rawId = pathname?.split('/').filter(Boolean).pop() || '';
  const slug = rawId.toLowerCase();

  const [data, setData] = useState<MunicipalityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getMunicipalityDashboardData(slug);
      setData(result);
      setLoading(false);
    }
    if (slug) {
      load();
    }
  }, [slug]);

  // Nicely formatted town name if we have no DB data
  const prettyName = slug
    ? slug
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'New Jersey Municipality';

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 text-sm">Loading CLEAR dashboard…</p>
      </main>
    );
  }

  // If no data in Supabase, show friendly placeholder
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl w-full bg-white shadow-md rounded-lg border border-slate-200 p-6">
          <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">
            CLEAR Budget &amp; Corruption Dashboard
          </h1>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {prettyName}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            New Jersey Municipality
          </p>

          <p className="text-base text-slate-700 font-medium">
            Data coming soon for this town.
          </p>
          <p className="text-sm text-slate-500 mt-3">
            CLEAR will ingest:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-500 mt-1 space-y-1">
            <li>Budget documents and financial statements</li>
            <li>State and local corruption audits and enforcement actions</li>
            <li>
              A public formula converting wasted dollars into local jobs not
              created
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-4">
            For now, this page is a placeholder so your town&apos;s link from the
            CLEAR Gradebook map doesn&apos;t go to a dead end.
          </p>
        </div>
      </main>
    );
  }

  const {
    name,
    county,
    latestBudgetYear,
    latestBudget,
    latestBudgetSourceUrl,
    budgets,
    totalCorruptionLost,
    totalCorruptionRecovered,
    estimatedJobsLost,
    transparencyScoreYear,
    transparencyFinalScore,
  } = data;

  const budgetChartData = budgets.map((b) => ({
    year: b.year,
    total: b.total_budget ? Math.round(b.total_budget / 1_000_000) : 0,
  }));

  const corruptionMillions = totalCorruptionLost
    ? (totalCorruptionLost / 1_000_000).toFixed(1)
    : '0.0';

  return (
    <main className="min-h-screen flex justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white shadow-md rounded-lg border border-slate-200 p-6 md:p-8">
        {/* Header */}
        <header className="mb-6 border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">
            CLEAR Budget &amp; Corruption Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            {name || prettyName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {county ? `${county} County, New Jersey` : 'New Jersey Municipality'}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Prototype view – data for a handful of towns is pre-loaded to
            demonstrate how CLEAR will work statewide.
          </p>
        </header>

        {/* Top metric strip */}
        <section className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Transparency grade */}
          <div className="border border-slate-200 rounded-md p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              CLEAR Transparency &amp; Ethics Grade
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {transparencyScoreYear
                ? `Preliminary score for ${transparencyScoreYear}`
                : 'Preliminary score'}
            </p>
            <p className="text-3xl font-bold mt-2 text-slate-900">
              {transparencyFinalScore !== null ? transparencyFinalScore : '–'}
              <span className="text-sm font-normal text-slate-500 ml-1">
                / 100
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Based on OPRA responsiveness, ethics structures, conflicts
              disclosures, contract transparency, and citizen input
              (CLEAR formula in development).
            </p>
          </div>

          {/* Latest budget */}
          <div className="border border-slate-200 rounded-md p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Latest adopted budget
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {latestBudgetYear ? `FY${latestBudgetYear}` : 'No year in database'}
            </p>
            <p className="text-2xl font-bold mt-2 text-slate-900">
              {latestBudget === null
                ? '$0'
                : latestBudget === 0 && latestBudgetSourceUrl
                ? 'Budget not yet parsed'
                : `$${(latestBudget / 1_000_000).toFixed(1)}M`}
            </p>
            {latestBudgetSourceUrl && (
              <a
                href={latestBudgetSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-600 underline mt-2 inline-block"
              >
                View full adopted budget (PDF)
              </a>
            )}
          </div>

          {/* Corruption & jobs */}
          <div className="border border-slate-200 rounded-md p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Documented corruption &amp; waste
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Since 2010 (from state and local reports)
            </p>
            <p className="text-xl font-bold mt-2 text-slate-900">
              ${corruptionMillions}M
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Recovered: $
              {totalCorruptionRecovered
                ? (totalCorruptionRecovered / 1_000_000).toFixed(1)
                : '0.0'}
              M
            </p>
            <p className="text-xs text-slate-500">
              Estimated jobs not created:{' '}
              <span className="font-semibold">
                {estimatedJobsLost.toFixed(1)}
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Jobs estimate based on $120k per job (salary + benefits +
              training).
            </p>
          </div>
        </section>

        {/* Budget chart */}
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-base font-semibold text-slate-900">
              Budget over time
            </h2>
            <p className="text-xs text-slate-500">
              Total municipal budget (millions, by fiscal year)
            </p>
          </div>
          {budgetChartData.length > 0 ? (
            <div className="w-full h-64 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${value}M`, 'Total budget']}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 4,
                    }}
                  />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No budget history in the database yet.
            </p>
          )}
        </section>

        {/* Notes */}
        <section className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-xs text-slate-500">
            CLEAR is in prototype mode. Numbers shown here come from a small set
            of sample budgets and enforcement actions to demonstrate what a
            statewide New Jersey transparency portal could look like.
          </p>
        </section>
      </div>
    </main>
  );
}
