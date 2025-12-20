import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTownInsightByMunicipalitySlug } from "../data/townInsights";
import { fetchMunicipalityBySlug } from "../data/municipalities";
import { fetchDataSourcesStatusByMunicipalityId, type DataSourcesStatusRow } from "../data/dataSourcesStatus";
import type { TownInsight } from "../types/townInsight";
import type { MunicipalityRow } from "../types/municipality";

/**
 * Format USD for big civic numbers.
 */
function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function scoreToLetter(score: number): string {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

function computePerHouseholdAndResident(moneyLost: number, population?: number | null) {
  const pop = Number(population ?? 0);
  const AVG_HH_SIZE = 2.6;

  if (!Number.isFinite(moneyLost) || moneyLost <= 0) {
    return { perHousehold: null as number | null, perResident: null as number | null };
  }
  if (!Number.isFinite(pop) || pop <= 0) {
    return { perHousehold: null as number | null, perResident: null as number | null };
  }

  const perResident = moneyLost / pop;
  const householdsEst = pop / AVG_HH_SIZE;
  const perHousehold = householdsEst > 0 ? moneyLost / householdsEst : null;

  return { perHousehold, perResident };
}

function confidenceLabelFromStatus(status: DataSourcesStatusRow | null): "High" | "Medium" | "Low" {
  if (!status) return "Low";

  let score = 0;
  if (status.has_population) score += 1;
  if (status.has_meetings) score += 1;
  if (status.has_meeting_documents) score += 1;
  if (status.has_contracts) score += 1;
  if (status.has_opra_metrics) score += 1;
  if (status.has_audit_data) score += 1;

  if (status.sources_count >= 5) score += 2;
  else if (status.sources_count >= 2) score += 1;

  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function prettyMissing(missing: string[] | null | undefined) {
  if (!missing || missing.length === 0) return "None";
  // Make it human
  return missing
    .map((m) => {
      if (m === "opra") return "OPRA responsiveness";
      if (m === "audits") return "Audit data";
      if (m === "contracts") return "Contracts";
      if (m === "population") return "Population";
      return m;
    })
    .join(", ");
}

export default function MyTownDashboardPage() {
  const { slug } = useParams();
  const resolvedSlug = slug ?? "new-providence";

  const [insight, setInsight] = useState<TownInsight | null>(null);
  const [muni, setMuni] = useState<MunicipalityRow | null>(null);
  const [status, setStatus] = useState<DataSourcesStatusRow | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Confidence panel toggle
  const [showConfidence, setShowConfidence] = useState(false);

  // Copy-link UX
  const [copied, setCopied] = useState(false);
  async function copyReportLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      const ok = window.prompt("Copy this link:", url);
      if (ok !== null) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    }
  }

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setError(null);
      setShowConfidence(false);

      // Fetch municipality (id/population) + insight in parallel
      const [muniRes, insightRes] = await Promise.all([
        fetchMunicipalityBySlug(resolvedSlug),
        fetchTownInsightByMunicipalitySlug(resolvedSlug),
      ]);

      if (!mounted) return;

      if (muniRes.error) {
        setError(muniRes.error);
        setMuni(null);
        setInsight(null);
        setStatus(null);
        setLoading(false);
        return;
      }

      setMuni(muniRes.data);

      if (insightRes.error) {
        setError(insightRes.error.message);
        setInsight(null);
        setStatus(null);
        setLoading(false);
        return;
      }

      setInsight(insightRes.data);

      // Fetch status if we have a municipality id
      if (muniRes.data?.id) {
        const statusRes = await fetchDataSourcesStatusByMunicipalityId(muniRes.data.id);
        if (!mounted) return;
        if (!statusRes.error) setStatus(statusRes.data);
      } else {
        setStatus(null);
      }

      setLoading(false);
    }

    run();
    return () => {
      mounted = false;
    };
  }, [resolvedSlug]);

  const grade = useMemo(() => {
    if (!insight) return null;
    return insight.transparency_grade || scoreToLetter(Number(insight.transparency_score));
  }, [insight]);

  const moneyLost = useMemo(() => {
    if (!insight) return 0;
    const v = Number(insight.corruption_money_lost_usd ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [insight]);

  const confidenceLabel = useMemo(() => confidenceLabelFromStatus(status), [status]);

  const { perHousehold, perResident } = useMemo(() => {
    return computePerHouseholdAndResident(moneyLost, muni?.population ?? null);
  }, [moneyLost, muni?.population]);

  if (loading) return <div style={{ padding: 24 }}>Loading town dashboard…</div>;

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Couldn’t load this town</h2>
        <p style={{ color: "crimson" }}>{error}</p>
        <p>
          Try: <Link to="/my-town/new-providence">New Providence demo</Link>
        </p>
      </div>
    );
  }

  if (!insight) {
    return (
      <div style={{ padding: 24 }}>
        <h2>No insight data found</h2>
        <p>
          Seed/compute data for <code>{resolvedSlug}</code> (or open the demo).
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{muni?.name ? `My Town: ${muni.name}` : "My Town"}</h1>

        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>
            As of <strong>{insight.as_of_date}</strong>
          </span>

          <button
            type="button"
            onClick={() => setShowConfidence((v) => !v)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              fontSize: 13,
              fontWeight: 800,
              background: "white",
              cursor: "pointer",
            }}
            aria-expanded={showConfidence}
          >
            Confidence: {confidenceLabel} {showConfidence ? "▲" : "▼"}
          </button>

          <span style={{ fontSize: 13, opacity: 0.7 }}>Click confidence for details</span>
        </div>

        {showConfidence && (
          <div style={{ marginTop: 10, border: "1px solid #eee", borderRadius: 12, padding: 12, background: "white" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Data coverage</div>
            {status ? (
              <>
                <div style={{ fontSize: 14 }}>
                  Metrics:{" "}
                  <strong>
                    {status.metrics_filled_count}/{status.metrics_total_count}
                  </strong>{" "}
                  filled
                </div>
                <div style={{ fontSize: 14 }}>
                  Sources counted: <strong>{status.sources_count}</strong>
                </div>
                <div style={{ fontSize: 14 }}>
                  Last updated:{" "}
                  <strong>{new Date(status.last_updated_at).toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>
                  Missing: <strong>{prettyMissing(status.missing)}</strong>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, opacity: 0.75 }}>
                Coverage details not available yet for this town.
              </div>
            )}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Confidence reflects completeness and recency of inputs — not a claim of wrongdoing.
            </div>
          </div>
        )}
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Transparency grade</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{grade}</div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>
            Score: <strong>{insight.transparency_score}</strong>/100
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Estimated money lost</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{formatUSD(moneyLost)}</div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>From waste, favoritism, and avoidable costs</div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Estimated jobs lost</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>
            {Number(insight.corruption_jobs_lost_est).toFixed(1)}
          </div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>Jobs that funding could support</div>
        </div>
      </section>

      {/* Local framing */}
      <section style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>What this means locally</div>

        {perHousehold != null ? (
          <div style={{ fontSize: 16 }}>
            Estimated cost: <strong>{formatUSD(perHousehold)}</strong> per household per year{" "}
            <span style={{ opacity: 0.7 }}>(estimate)</span>
          </div>
        ) : perResident != null ? (
          <div style={{ fontSize: 16 }}>
            Estimated cost: <strong>{formatUSD(perResident)}</strong> per resident per year{" "}
            <span style={{ opacity: 0.7 }}>(estimate)</span>
          </div>
        ) : (
          <div style={{ fontSize: 14, opacity: 0.75 }}>
            Per-household framing appears once population is available for this town.
          </div>
        )}

        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
          Derived from the town’s estimated loss divided across residents/households.
        </div>
      </section>

      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>What this means in real terms</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {insight.real_world_examples.map((ex, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              <strong>{ex.label}:</strong> ~{Number(ex.equivalent_units).toFixed(1)} units{" "}
              <span style={{ opacity: 0.75 }}>
                (at {formatUSD(ex.usd_per_unit)} each{ex.note ? ` — ${ex.note}` : ""})
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>How we calculated it</h2>
        <p style={{ marginBottom: 12 }}>{(insight as any).methodology_summary}</p>

        <h3 style={{ marginBottom: 8 }}>Sources</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {insight.sources.map((s, idx) => (
            <li key={idx}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>{" "}
              <span style={{ opacity: 0.7 }}>({s.type})</span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          to={`/organize/${resolvedSlug}`}
          style={{ padding: "10px 14px", border: "1px solid #111", borderRadius: 10, textDecoration: "none" }}
        >
          Organize / Act →
        </Link>

        <Link
          to={`/my-town/${resolvedSlug}/calendar`}
          style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}
        >
          View meetings calendar
        </Link>

        <button
          type="button"
          onClick={copyReportLink}
          style={{
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {copied ? "Copied!" : "Copy report link"}
        </button>
      </section>
    </div>
  );
}
