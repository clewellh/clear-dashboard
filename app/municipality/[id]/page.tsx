'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  MunicipalityDashboardData,
  getMunicipalityDashboardData,
} from '../../../lib/municipalityService';

// Recharts imports for the simple budget chart
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// Helper to get the last part of the URL as the slug
function extractSlugFromPath(pathname: string | null): string | null {
  if (!pathname) return null;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  return parts[parts.length - 1]; // e.g. 'newark'
}

export default function MunicipalityPage() {
  const pathname = usePathname();
  const slug = extractSlugFromPath(pathname);

  const [data, setData] = useState<MunicipalityDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError('No town ID provided in URL.');
      return;
    }

    setLoading(true);
    setError(null);

    getMunicipalityDashboardData(slug)
      .then((result) => {
        if (!result) {
          setData(null);
        } else {
          setData(result);
        }
      })
      .catch((err) => {
        console.error('Error loading municipality dashboard:', err);
        setError('Failed to load data for this town.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (!slug) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="max-w-xl text-center px-4">
          <h1 className="text-2xl font-bold mb-2">CLEAR Budget & Corruption Dashboard</h1>
          <p className="text-slate-300">
            No town ID found in the URL. Try visiting this page from the CLEAR map or use a URL like
            <code className="ml-1 px-1 py-0.5 bg-slate-800 rounded text-xs">
              /municipality/newark
            </code>
            .
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-slate-300">Loading CLEAR data for this town…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="max-w-lg text-center px-4">
          <h1 className="text-xl font-semibold mb-2">
            CLEAR Budget & Corruption Dashboard
          </h1>
          <p className="text-red-300 mb-2">{error}</p>
          <p className="text-slate-400 text-sm">
            If this keeps happening, CLEAR may not have data for this municipality yet.
          </p>
        </div>
      </main>
    );
  }

  // No data in DB for this slug
  if (!data) {
    const prettyName = slug
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="max-w-xl w-full px-4 py-10">
          <h1 className="text-2xl font-bold mb-4">
            CLEAR Budget & Corruption Dashboard
          </h1>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{prettyName}</h2>
              <p className="text-sm text-slate-400 mt-1">New Jersey Municipality</p>
            </div>

            <div className="bg-slate-950 border border-dashed border-slate-700 rounded-md p-4">
              <p className="text-slate-200 font-medium">
                Data coming soon for this town.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                CLEAR will ingest:
              </p>
              <ul className="list-disc list-inside text-slate-400 text-sm mt-1 space-y-1">
                <li>Budget documents and financial statements</li>
                <li>State and local corruption audits and enforcement actions</li>
                <li>
                  A public formula converting wasted dollars into local jobs not created
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-500">
              For now, this page is a placeholder so your town&apos;s link from the CLEAR
              Gradebook map doesn&apos;t go to a dead end.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // If we reach here, we have real data
  const {
    name,
    county,
    latestBudgetYear,
    latestBudget,
    budgets,
    totalCorruptionLost,
    totalCorruptionRecovered,
    estimatedJobsLost,
    transparencyScoreYear,
    transparencyFinalScore,
  } = data;

  const budgetChartData = budgets.map((b) => ({
    year: b.year,
    budgetMillions: Math.round((b.total_budget / 1_000_000) * 10) / 10, // one decimal
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-4xl w-full px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            CLEAR Budget & Corruption Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Town ID from URL:{' '}
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
              {slug}
            </span>
          </p>
        </header>

        <section className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{name}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {county ? `${county} County` : 'New Jersey municipality'}
              </p>
            </div>
            {transparencyFinalScore !== null && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  CLEAR Transparency & Ethics Grade
                </p>
                <p className="text-3xl font-bold mt-1">
                  {Math.round(transparencyFinalScore)}
                  <span className="text-base font-medium text-slate-400 ml-1">
                    / 100
                  </span>
                </p>
                {transparencyScoreYear && (
                  <p className="text-xs text-slate-500 mt-1">
                    Based on {transparencyScoreYear} review using CLEAR’s 7-indicator formula.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Latest adopted budget
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {latestBudgetYear ? `FY${latestBudgetYear}` : 'No year in database'}
            </p>
            <p className="text-2xl font-bold mt-2">
              {latestBudget !== null
                ? `$${(latestBudget / 1_000_000).toFixed(1)}M`
                : '$0'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Documented corruption &amp; waste
            </p>
            <p className="text-sm text-slate-500 mt-1">Since available cases</p>
            <p className="text-2xl font-bold mt-2">
              {`$${(totalCorruptionLost / 1_000_000).toFixed(2)}M`}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Estimated jobs not created
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Using ~$120k per local job (salary + benefits)
            </p>
            <p className="text-2xl font-bold mt-2">
              {estimatedJobsLost.toFixed(1)}
            </p>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Budget trend (total, by year)
          </h3>
          {budgetChartData.length === 0 ? (
            <p className="text-sm text-slate-400">
              No budget history in the database yet for this town.
            </p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis
                    stroke="#9ca3af"
                    tickFormatter={(value) => `${value}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#1f2937',
                    }}
                    formatter={(value) => [`$${value}M`, 'Total budget']}
                  />
                  <Bar dataKey="budgetMillions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <p className="text-xs text-slate-500">
          CLEAR is in pilot mode. These numbers are illustrative and will be refined as
          we ingest more official budget documents, audits, and enforcement actions for
          all 564 New Jersey municipalities.
        </p>
      </div>
    </main>
  );
}
