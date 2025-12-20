import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

type IssueKey = "transparency" | "spending" | "meetings";
type ActionKey = "email" | "attend" | "share";

const ISSUE_OPTIONS: { key: IssueKey; title: string; subtitle: string }[] = [
  {
    key: "transparency",
    title: "Transparency & ethics",
    subtitle: "Conflicts, disclosure, open data, oversight",
  },
  {
    key: "spending",
    title: "Public spending",
    subtitle: "Contracts, no-bid, cost overruns, waste",
  },
  {
    key: "meetings",
    title: "Open meetings",
    subtitle: "Agendas, minutes, recordings, notice, access",
  },
];

const ACTION_OPTIONS: { key: ActionKey; title: string; subtitle: string }[] = [
  {
    key: "email",
    title: "Email the council",
    subtitle: "Ask for a concrete transparency commitment",
  },
  {
    key: "attend",
    title: "Show up to the next meeting",
    subtitle: "Use a 30-second public comment script",
  },
  {
    key: "share",
    title: "Share this town report",
    subtitle: "Send a short text to neighbors / group chat",
  },
];

function primaryButtonStyle(): React.CSSProperties {
  return {
    padding: "10px 14px",
    border: "1px solid #111",
    borderRadius: 10,
    background: "white",
    cursor: "pointer",
    fontWeight: 700,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
}

function secondaryButtonStyle(): React.CSSProperties {
  return {
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "white",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };
}

function cardStyle(selected: boolean): React.CSSProperties {
  return {
    textAlign: "left",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: selected ? "2px solid #111" : "1px solid #ddd",
    background: selected ? "rgba(0,0,0,0.03)" : "white",
    cursor: "pointer",
  };
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ok = window.prompt("Copy this text:", text);
    return ok !== null;
  }
}

export default function ActPage() {
  const { slug } = useParams();
  const resolvedSlug = slug ?? "new-providence";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [issue, setIssue] = useState<IssueKey>("transparency");
  const [action, setAction] = useState<ActionKey>("email");

  const [yourName, setYourName] = useState("");
  const [streetOrNeighborhood, setStreetOrNeighborhood] = useState("");
  const [copied, setCopied] = useState(false);

  const reportUrl = useMemo(() => {
    // If you deploy under a different origin, this still works.
    const origin = window.location.origin;
    return `${origin}/my-town/${resolvedSlug}`;
  }, [resolvedSlug]);

  const issueLabel = useMemo(() => ISSUE_OPTIONS.find((x) => x.key === issue)?.title ?? "Transparency & ethics", [issue]);
  const actionLabel = useMemo(() => ACTION_OPTIONS.find((x) => x.key === action)?.title ?? "Email the council", [action]);

  const generated = useMemo(() => {
    const nameLine = yourName.trim() ? `\n\n— ${yourName.trim()}` : "";
    const locationLine = streetOrNeighborhood.trim()
      ? `I live in/near ${streetOrNeighborhood.trim()}.\n\n`
      : "";

    if (action === "share") {
      const text = `Quick heads up: I checked CLEAR’s town report for ${resolvedSlug.replaceAll("-", " ")}. It estimates real money + jobs lost when oversight is weak.\n\nTake a look: ${reportUrl}`;
      return { title: "Share text", body: text };
    }

    if (action === "attend") {
      const script = `Hi, I’m a resident. ${streetOrNeighborhood.trim() ? `I live in/near ${streetOrNeighborhood.trim()}. ` : ""}I’m here because I want ${issueLabel.toLowerCase()} to be easy to verify—not something people have to guess about.\n\nI’m asking the council to commit to one concrete step this month:\n• Publish key documents in one place (agendas, minutes, recordings, contracts), and\n• Post a simple explanation of any non-competitive contracts or emergency spending.\n\nThis isn’t partisan. It’s basic accountability. Thank you.`;
      return { title: "Public comment script", body: script };
    }

    // action === "email"
    const subject = `Request: a concrete transparency commitment for ${resolvedSlug.replaceAll("-", " ")}`;
    const body = `Hello Council Members,\n\n${locationLine}I reviewed CLEAR’s town report and I’m writing with a straightforward request related to ${issueLabel.toLowerCase()}.\n\nCould the council commit to ONE specific improvement by a date certain—for example:\n• A single webpage where residents can reliably find agendas, minutes, recordings, and key contracts; and\n• A clear explanation when contracts are not competitively bid.\n\nEven one measurable step would build trust quickly.\n\nReport link for reference: ${reportUrl}${nameLine}`;
    return { title: subject, body };
  }, [action, issueLabel, reportUrl, resolvedSlug, streetOrNeighborhood, yourName]);

  const mailtoHref = useMemo(() => {
    if (action !== "email") return "";
    // Placeholder recipient — later you can pull town contacts from DB.
    const to = ""; // leave blank so user chooses recipients
    const subject = encodeURIComponent(generated.title);
    const body = encodeURIComponent(generated.body);
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [action, generated]);

  async function handleCopy() {
    const ok = await copyToClipboard(generated.body);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0 }}>Organize / Act</h1>
        <p style={{ marginTop: 8, fontSize: 15, opacity: 0.85 }}>
          Pick an issue, pick an action, and get a ready-to-use message in under a minute.
        </p>
      </header>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <Link to={`/my-town/${resolvedSlug}`} style={secondaryButtonStyle()}>
          ← Back to report
        </Link>
        <Link to={`/my-town/${resolvedSlug}/calendar`} style={secondaryButtonStyle()}>
          View meetings calendar
        </Link>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 800 }}>Step {step} of 3</span>
        <span style={{ opacity: 0.7 }}>Issue: {issueLabel}</span>
        <span style={{ opacity: 0.7 }}>Action: {actionLabel}</span>
      </div>

      {step === 1 && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>1) What do you care about?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {ISSUE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setIssue(opt.key)}
                style={cardStyle(issue === opt.key)}
              >
                <div style={{ fontWeight: 800 }}>{opt.title}</div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{opt.subtitle}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setStep(2)} style={primaryButtonStyle()}>
              Next →
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>2) What action will you take?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {ACTION_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAction(opt.key)}
                style={cardStyle(action === opt.key)}
              >
                <div style={{ fontWeight: 800 }}>{opt.title}</div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{opt.subtitle}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 10 }}>
            <button type="button" onClick={() => setStep(1)} style={secondaryButtonStyle()}>
              ← Back
            </button>
            <button type="button" onClick={() => setStep(3)} style={primaryButtonStyle()}>
              Next →
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>3) Use this message</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Optional personalization</div>

              <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                Your name (for emails)
              </label>
              <input
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g., Alex Rivera"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #bbb",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              />

              <label style={{ display: "block", fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                Neighborhood / street (optional)
              </label>
              <input
                value={streetOrNeighborhood}
                onChange={(e) => setStreetOrNeighborhood(e.target.value)}
                placeholder="e.g., near the high school"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #bbb",
                  fontSize: 14,
                }}
              />

              <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
                We keep this local (no saving, no accounts required).
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{generated.title}</div>
              <textarea
                readOnly
                value={generated.body}
                style={{
                  width: "100%",
                  minHeight: 220,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #bbb",
                  fontSize: 13,
                  lineHeight: 1.35,
                  resize: "vertical",
                }}
              />

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" onClick={handleCopy} style={primaryButtonStyle()}>
                  {copied ? "Copied!" : "Copy"}
                </button>

                {action === "email" && (
                  <a href={mailtoHref} style={secondaryButtonStyle()}>
                    Open email →
                  </a>
                )}

                <button type="button" onClick={() => setStep(2)} style={secondaryButtonStyle()}>
                  ← Back
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                Tip: if you share, add one sentence about why you care. People respond to a human voice.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
