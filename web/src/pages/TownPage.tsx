import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchMunicipalities } from "../data/municipalities";
import { fetchInsightMunicipalityIds } from "../data/townInsightAvailability";
import type { MunicipalityRow } from "../types/municipality";

export default function TownPage() {
  const navigate = useNavigate();

  const [towns, setTowns] = useState<MunicipalityRow[]>([]);
  const [insightIds, setInsightIds] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setErr(null);

      const [townRes, availRes] = await Promise.all([
        fetchMunicipalities(),
        fetchInsightMunicipalityIds(),
      ]);

      if (!mounted) return;

      if (townRes.error) {
        setErr(`Couldn’t load municipalities: ${townRes.error}`);
        setLoading(false);
        return;
      }

      setTowns(townRes.data ?? []);
      setInsightIds(!availRes.error && availRes.data ? availRes.data : new Set());
      setLoading(false);
    }

    run();
    return () => {
      mounted = false;
    };
  }, []);

  // Suggestions (small list)
  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];

    return towns
      .filter((t) => {
        const name = (t.name ?? "").toLowerCase();
        const county = (t.county ?? "").toLowerCase();
        return name.includes(s) || county.includes(s);
      })
      .slice(0, 8);
  }, [q, towns]);

  // If user types town name, resolve to slug
  const exactMatch = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return towns.find((t) => (t.name ?? "").toLowerCase() === s) ?? null;
  }, [q, towns]);

  function goToTown(t: MunicipalityRow) {
    if (!t.slug) return;

    const hasReport = t.id ? insightIds.has(String(t.id)) : false;
    navigate(hasReport ? `/my-town/${t.slug}` : `/my-town/${t.slug}/calendar`);
  }

  function handleGo() {
    // 1) If exact match by name
    if (exactMatch) return goToTown(exactMatch);

    // 2) Otherwise try best suggestion
    if (suggestions[0]) return goToTown(suggestions[0]);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading towns…</div>;

  if (err) {
    return (
      <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
        <h2>Couldn’t load towns</h2>
        <p style={{ color: "crimson" }}>{err}</p>
        <p>
          Try the demo: <Link to="/my-town/new-providence">New Providence</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>My Town</h1>
      <p style={{ marginTop: 0, fontSize: 16, opacity: 0.9 }}>
        Start typing your town. If a full report isn’t ready yet, you’ll still get meetings + documents.
      </p>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Enter your town (e.g., Newark)"
            list="town-suggestions"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #bbb",
              fontSize: 16,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGo();
            }}
          />

          <datalist id="town-suggestions">
            {suggestions.map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Tip: type a few letters and select from the dropdown, then press Enter (or click Go).
          </div>
        </div>

        <button
          type="button"
          onClick={handleGo}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "white",
            cursor: "pointer",
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          Go →
        </button>
      </div>

      <section style={{ marginTop: 18, padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Start with a demo</h3>
        <Link
          to="/my-town/new-providence"
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "10px 14px",
            border: "1px solid #111",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 900,
          }}
        >
          Open New Providence →
        </Link>
      </section>
    </div>
  );
}
