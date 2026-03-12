"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { callGemini } from "@/lib/gemini";

const SLIDE_SYSTEM = `You are a world-class presentation designer. Generate stunning HTML slide presentations.

DESIGN RULES:
- Use dark theme: background #0d0d14, text #f0f0f8
- Typography: Import and use Syne (bold display) + DM Mono (accents) from Google Fonts
- Color palette: choose ONE accent color per deck (purple #7c6af7, green #4ade80, amber #fbbf24, or red #f87171)
- Every slide must have a slide number (top right, mono font, small, muted)
- Include a marquee ticker on hero/section slides (like: "TOPIC ◆ SUBTOPIC ◆ CONCEPT ◆ " repeating)
- Layouts: hero (full bleed title), two-column, code-block, quote, stat/number highlight, list
- Add subtle grid background (CSS grid lines, very low opacity)
- Each slide = a <section class="slide"> element, sized 1280x720px
- Add CSS transitions when hovering slide navigation

OUTPUT: A single complete self-contained HTML file. No markdown fences. Start with <!DOCTYPE html>.

STRUCTURE:
- Slide 1: Hero — title + subtitle + ticker
- Slide 2–N: Content slides (vary layouts)
- Last slide: Closing/CTA

Include prev/next navigation buttons and keyboard arrow support.`;

export default function SlidesPage() {
  const [apiKey, setApiKey] = useState("");
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState("");
  const [slideCount, setSlideCount] = useState("8");
  const [style, setStyle] = useState("technical");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [html, setHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generate = async () => {
    if (!apiKey.trim()) { setError("Enter your Gemini API key"); return; }
    if (!topic.trim()) { setError("Enter a topic"); return; }
    setError(""); setLoading(true); setHtml("");
    try {
      const prompt = `Create a ${slideCount}-slide presentation about: "${topic}"
${outline ? `Outline/structure:\n${outline}` : ""}
Style: ${style}
Make it visually stunning with the design system provided. Every slide must be distinct in layout.`;
      const result = await callGemini(apiKey, SLIDE_SYSTEM, prompt, 0.8);
      const cleaned = result.replace(/^```html\n?/, "").replace(/\n?```$/, "").trim();
      setHtml(cleaned);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${topic.replace(/\s+/g, "-").toLowerCase()}-slides.html`;
    a.click();
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>← HOME</Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>SLIDE GENERATOR</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: html ? "380px 1fr" : "1fr", gap: 32, alignItems: "start" }}>
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, letterSpacing: "-0.03em", marginBottom: 8 }}>
                Slide<br /><span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--accent)" }}>Generator</span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>Designer-quality HTML presentations. Export and open in any browser.</p>
            </div>

            <Field label="GEMINI API KEY" hint="Get free key at aistudio.google.com">
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="AIza..." style={inputStyle} />
            </Field>

            <Field label="TOPIC">
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Introduction to Neural Networks" style={inputStyle} />
            </Field>

            <Field label="OUTLINE (OPTIONAL)" hint="One bullet per slide or section">
              <textarea value={outline} onChange={e => setOutline(e.target.value)}
                placeholder={"- What is a neural network\n- Perceptron model\n- Backpropagation\n- Real applications"}
                rows={5} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 13 }} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="SLIDE COUNT">
                <select value={slideCount} onChange={e => setSlideCount(e.target.value)} style={inputStyle}>
                  {["6","8","10","12","15"].map(n => <option key={n} value={n}>{n} slides</option>)}
                </select>
              </Field>
              <Field label="STYLE">
                <select value={style} onChange={e => setStyle(e.target.value)} style={inputStyle}>
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                  <option value="startup-pitch">Startup Pitch</option>
                  <option value="workshop">Workshop</option>
                  <option value="lecture">Lecture</option>
                </select>
              </Field>
            </div>

            {error && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "12px 16px", color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button onClick={generate} disabled={loading} style={{
              background: loading ? "var(--bg-elevated)" : "var(--accent)",
              color: "white", border: "none", borderRadius: 10, padding: "14px 24px",
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              {loading ? <><Spinner />Generating slides...</> : "◈ Generate Slides"}
            </button>

            {html && (
              <button onClick={download} style={{
                background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)",
                borderRadius: 10, padding: "12px 24px", fontFamily: "var(--font-display)", fontWeight: 600,
                fontSize: 14, cursor: "pointer",
              }}>
                ↓ Download HTML
              </button>
            )}
          </div>

          {/* Preview */}
          {html && (
            <div style={{ position: "sticky", top: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>PREVIEW</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--green)" }}>● GENERATED</span>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                <iframe
                  ref={iframeRef}
                  srcDoc={html}
                  style={{ width: "100%", height: "520px", border: "none", display: "block" }}
                  title="Slide preview"
                />
              </div>
              <p style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                Use arrow keys inside preview to navigate slides
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

function Spinner() {
  return <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />;
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "10px 14px", color: "var(--text-primary)",
  fontFamily: "var(--font-display)", fontSize: 14, outline: "none",
};
