"use client";
import { useState } from "react";
import Link from "next/link";

const tools = [
  {
    id: "slides",
    label: "01",
    name: "Slide Generator",
    tagline: "Presentations that don't look AI-made",
    desc: "From topic to designer-quality HTML slides. Full speaker notes, code blocks, custom layouts.",
    href: "/slides",
    accent: "#7c6af7",
    glyph: "◈",
  },
  {
    id: "cheatsheet",
    label: "02",
    name: "Cheatsheet Forge",
    tagline: "Upload slides & PYPs → dense A4 gold",
    desc: "Grounded on your actual content. Every formula, definition, and key point — nothing hallucinated.",
    href: "/cheatsheet",
    accent: "#4ade80",
    glyph: "◉",
  },
  {
    id: "poster",
    label: "03",
    name: "Poster / Infographic",
    tagline: "Research posters that stop people",
    desc: "Academic posters, info-graphics, and visual summaries at a level that rivals Canva.",
    href: "/poster",
    accent: "#fbbf24",
    glyph: "◇",
  },
];

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", overflow: "hidden", position: "relative" }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Glow blob */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,106,247,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <header style={{ paddingTop: 64, paddingBottom: 80 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #7c6af7, #a394ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800,
            }}>S</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em", color: "var(--text-secondary)" }}>STUDYFORGE</span>
          </div>

          <div style={{ animation: "fadeUp 0.6s ease forwards" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", letterSpacing: "0.15em", marginBottom: 20 }}>
              AI-POWERED STUDY TOOLS — FREE TO USE
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "clamp(48px, 8vw, 88px)", lineHeight: 1,
              letterSpacing: "-0.03em", color: "var(--text-primary)",
              marginBottom: 24,
            }}>
              Make things that<br />
              <span style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400,
                background: "linear-gradient(135deg, #a394ff 0%, #7c6af7 50%, #4ade80 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>actually look good.</span>
            </h1>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-secondary)", maxWidth: 480, lineHeight: 1.6 }}>
              Slides, cheatsheets, and posters powered by Gemini Flash. Grounded on your content. Designer quality, zero cost.
            </p>
          </div>
        </header>

        {/* Tool cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, paddingBottom: 80 }}>
          {tools.map((tool, i) => (
            <Link
              key={tool.id}
              href={tool.href}
              style={{ textDecoration: "none" }}
              onMouseEnter={() => setHovered(tool.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                background: hovered === tool.id ? "var(--bg-elevated)" : "var(--bg-card)",
                border: `1px solid ${hovered === tool.id ? tool.accent + "44" : "var(--border)"}`,
                borderRadius: 16,
                padding: 32,
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: hovered === tool.id ? "translateY(-4px)" : "translateY(0)",
                boxShadow: hovered === tool.id ? `0 20px 60px ${tool.accent}22` : "none",
                animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
                position: "relative", overflow: "hidden",
              }}>
                {/* Accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 32, right: 32, height: 2,
                  background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)`,
                  opacity: hovered === tool.id ? 1 : 0,
                  transition: "opacity 0.25s",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>{tool.label}</span>
                  <span style={{ fontSize: 28, color: tool.accent, opacity: 0.7 }}>{tool.glyph}</span>
                </div>

                <h2 style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22,
                  color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em",
                }}>{tool.name}</h2>
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: 12, color: tool.accent,
                  marginBottom: 16, letterSpacing: "0.02em",
                }}>{tool.tagline}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {tool.desc}
                </p>

                <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: tool.accent }}>Launch tool</span>
                  <span style={{ color: tool.accent, fontSize: 16, transition: "transform 0.2s", transform: hovered === tool.id ? "translateX(4px)" : "translateX(0)" }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid var(--border)", paddingTop: 24, paddingBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
            POWERED BY GEMINI 2.0 FLASH — FREE TIER
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
            STUDYFORGE v0.1
          </span>
        </footer>
      </div>
    </main>
  );
}
