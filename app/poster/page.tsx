"use client";
import { useState } from "react";
import Link from "next/link";

const posterTypes = [
  { value: "academic", label: "Academic Research Poster", icon: "◈", desc: "Sections, methodology, findings" },
  { value: "infographic", label: "Infographic", icon: "◉", desc: "Visual data story with stats" },
  { value: "summary", label: "Topic Summary", icon: "◇", desc: "Beautiful lecture summary" },
  { value: "event", label: "Event / Announcement", icon: "◆", desc: "High-impact announcement" },
];

const colorSchemes = [
  { value: "dark-purple", label: "Dark + Purple", preview: ["#0d0d14", "#7c6af7", "#f0f0f8"] },
  { value: "light-green", label: "Light + Green", preview: ["#f0faf4", "#16a34a", "#1a1a1a"] },
  { value: "dark-amber", label: "Dark + Amber", preview: ["#0f0d08", "#fbbf24", "#f5f0e8"] },
  { value: "white-red", label: "White + Red", preview: ["#fff", "#e53e3e", "#1a1a1a"] },
  { value: "navy-cyan", label: "Navy + Cyan", preview: ["#0a1628", "#22d3ee", "#e0f2fe"] },
  { value: "cream-black", label: "Cream + Black", preview: ["#faf6f0", "#111", "#666"] },
];

export default function PosterPage() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [posterType, setPosterType] = useState("infographic");
  const [colorScheme, setColorScheme] = useState("dark-purple");
  const [orientation, setOrientation] = useState("portrait");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [html, setHtml] = useState("");

  const generate = async () => {
    if (!topic.trim()) { setError("Enter a topic"); return; }
    setError(""); setLoading(true); setHtml("");
    try {
      const res = await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, content, posterType, colorScheme, orientation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setHtml(data.html);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); }
  };

  const download = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${topic.replace(/\s+/g, "-").toLowerCase()}-poster.html`;
    a.click();
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>← HOME</Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#fbbf24" }}>POSTER CREATOR</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
            GEMINI 2.5 FLASH
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: html ? "400px 1fr" : "700px", gap: 32, justifyContent: html ? "stretch" : "center" }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 42, letterSpacing: "-0.03em", marginBottom: 8 }}>
                Poster &<br /><span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "#fbbf24" }}>Infographic</span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>Designer-quality posters that close the gap with Canva. Export as HTML → print to PDF.</p>
            </div>

            <Field label="TOPIC / TITLE">
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. The Impact of Social Media on Mental Health" style={inputStyle} />
            </Field>

            {/* Poster type selector */}
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>POSTER TYPE</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {posterTypes.map(pt => (
                  <button key={pt.value} onClick={() => setPosterType(pt.value)} style={{
                    background: posterType === pt.value ? "rgba(251,191,36,0.1)" : "var(--bg-card)",
                    border: `1px solid ${posterType === pt.value ? "#fbbf2466" : "var(--border)"}`,
                    borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                    textAlign: "left", transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 16, color: "#fbbf24" }}>{pt.icon} </span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 12, color: posterType === pt.value ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: 600 }}>{pt.label}</span>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color scheme */}
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>COLOR SCHEME</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {colorSchemes.map(cs => (
                  <button key={cs.value} onClick={() => setColorScheme(cs.value)} style={{
                    background: "var(--bg-card)",
                    border: `2px solid ${colorScheme === cs.value ? "#fbbf24" : "var(--border)"}`,
                    borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {cs.preview.map((c, i) => (
                        <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, border: "1px solid rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-secondary)" }}>{cs.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="ORIENTATION">
                <select value={orientation} onChange={e => setOrientation(e.target.value)} style={inputStyle}>
                  <option value="portrait">Portrait (A0/A1)</option>
                  <option value="landscape">Landscape (16:9)</option>
                </select>
              </Field>
            </div>

            <Field label="CONTENT / KEY POINTS (OPTIONAL)" hint="Bullet points, data, text to include">
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder={"- Key finding 1\n- Statistic: 74% of users...\n- Section: Methodology\n- Author: Your Name"}
                rows={5} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13 }} />
            </Field>

            {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "12px 16px", color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{error}</div>}

            <button onClick={generate} disabled={loading} style={{
              background: loading ? "var(--bg-elevated)" : "#fbbf24",
              color: loading ? "var(--text-secondary)" : "#0a0a0f",
              border: "none", borderRadius: 10, padding: "14px 24px",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              {loading ? <><Spinner color="#fbbf24" />Designing poster...</> : "◆ Create Poster"}
            </button>

            {html && (
              <button onClick={download} style={{
                background: "transparent", color: "#fbbf24", border: "1px solid #fbbf24",
                borderRadius: 10, padding: "12px 24px", fontFamily: "var(--font-display)",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>↓ Download HTML</button>
            )}

            {/* Model info */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.1em" }}>PIPELINE</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Gemini 2.5 Flash → HTML poster
              </p>
            </div>
          </div>

          {/* Preview */}
          {html && (
            <div style={{ position: "sticky", top: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>PREVIEW</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#fbbf24" }}>● GENERATED</span>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                <iframe srcDoc={html} style={{ width: "100%", height: "700px", border: "none", display: "block" }} title="Poster preview" />
              </div>
              <p style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                Open in browser → Print → Save as PDF for full resolution
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>{label}</label>
        {hint && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", opacity: 0.7 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Spinner({ color = "white" }: { color?: string }) {
  return <div style={{ width: 16, height: 16, border: `2px solid ${color}44`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "10px 14px", color: "var(--text-primary)",
  fontFamily: "var(--font-display)", fontSize: 14, outline: "none",
};
