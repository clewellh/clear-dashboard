import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchMunicipalityBySlug } from "../data/municipalities";
import { fetchTownInsightByMunicipalitySlug } from "../data/townInsights";
import { createTownRequest } from "../data/townRequests";
import type { MunicipalityRow } from "../types/municipality";

export default function MyTownStatusPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const resolvedSlug = slug ?? "new-providence";

  const [muni, setMuni] = useState<MunicipalityRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const titleTown = useMemo(() => resolvedSlug.replaceAll("-", " "), [resolvedSlug]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      setErr(null);

      // If an insight exists, route to dashboard (so this page stays “only when missing”)
      const insightRes = await fetchTownInsightByMunicipalitySlug(resolvedSlug);
      if (!mounted) return;
      if (!insightRes.error && insightRes.data) {
        navigate(`/my-town/${resolvedSlug}`, { replace: true });
        return;
      }

      const muniRes = await fetchMunicipalityBySlug(resolvedSlug);
      if (!mounted) return;

      if (muniRes.error) {
        setErr(muniRes.error);
        setMuni(null);
      } else {
        setMuni(muniRes.data);
      }

      setLoading(false);
    }

    run();
    return () => {
      mounted = false;
    };
  }, [navigate, resolvedSlug]);

  async function handleRequest() {
    if (!muni?.id) return;

    setRequesting(true);
    const res = await createTownRequest({
      municipality_id: muni.id,
      contact_email: email.trim() || undefined,
      note: "Request submitted from /town selector",
    });

    if (!res.error) setRequested(true);
    setRequesting(false);
  }

  if (loading) return <div style={{ padding: 24 }}>Checking availability…</div>;

  if (err) {
    return (
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <h2>Couldn’t load this town</h2>
        <p style={{ color: "crimson" }}>{err}</p>
        <p>
          Try the demo: <Link to="/my-town/new-providence">New Providence</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>
        {muni?.name ? `My Town: ${muni.name}` : `My Town: ${titleTown}`}
      </h1>

      <p style={{ fontSize: 16, opacity: 0.85, marginTop: 8 }}>
        This town’s full transparency report isn’t available yet — but you can still use the meetings calendar now,
        and you can request priority coverage.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <Link
          to={`/my-town/${resolvedSlug}/calendar`}
          style={{ padding: "10px 14px", border: "1px solid #111", borderRadius: 10, textDecoration: "none", fontWeight: 800 }}
        >
          View meetings calendar →
        </Link>

        <Link
          to="/town"
          style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}
        >
          ← Back to town search
        </Link>

        <Link
          to="/my-town/new-providence"
          style={{ padding: "10px 14px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}
        >
          View demo report
        </Link>
      </div>

      <section style={{ marginTop: 18, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Request this town</h2>
        <p style={{ marginTop: 6, opacity: 0.8 }}>
          If enough people request a town, it moves up the build queue.
        </p>

        <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
          Email (optional — only if you want updates)
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ width: "100%", maxWidth: 420, padding: "10px 12px", borderRadius: 10, border: "1px solid #bbb" }}
        />

        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={handleRequest}
            disabled={requested || requesting || !muni?.id}
            style={{
              padding: "10px 14px",
              border: "1px solid #111",
              borderRadius: 10,
              background: "white",
              cursor: requested ? "default" : "pointer",
              fontWeight: 800,
              opacity: requested ? 0.7 : 1,
            }}
          >
            {requested ? "Requested ✓" : requesting ? "Requesting…" : "Request this town"}
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          We’re building statewide coverage using automated inputs. Requests help prioritize QA + polish.
        </div>
      </section>
    </div>
  );
}
