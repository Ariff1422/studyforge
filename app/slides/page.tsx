"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { FontPairing, LayoutVibe, SuggestedPalette } from "@/lib/themeTypes";
import type { DeckConfig } from "@/lib/slideTemplates";

// ── Font pairing UI data (client-side, no server import) ───────────────────
const FONT_PAIRING_UI = [
  { id: "modern" as FontPairing,    label: "Modern",    family: "'Syne', sans-serif" },
  { id: "editorial" as FontPairing, label: "Editorial", family: "'Playfair Display', serif" },
  { id: "tech" as FontPairing,      label: "Tech",      family: "'Space Grotesk', sans-serif" },
  { id: "sharp" as FontPairing,     label: "Sharp",     family: "'Barlow Condensed', sans-serif" },
  { id: "classic" as FontPairing,   label: "Classic",   family: "'DM Serif Display', serif" },
] as const;

const STATIC_PALETTES = [
  { name: "Dark Night",    bg: "#0d0d14", accent: "#7c6af7" },
  { name: "Midnight Rose", bg: "#0f0a14", accent: "#f472b6" },
  { name: "Ocean Depths",  bg: "#050f1a", accent: "#22d3ee" },
  { name: "Forest",        bg: "#0a1a0d", accent: "#4ade80" },
  { name: "Amber",         bg: "#1a1208", accent: "#fbbf24" },
  { name: "Crimson",       bg: "#1a0508", accent: "#f87171" },
  { name: "Warm Paper",    bg: "#f5f0e8", accent: "#7c6af7" },
  { name: "Blueprint",     bg: "#f0f4f8", accent: "#3b82f6" },
  { name: "Neon City",     bg: "#050510", accent: "#e879f9" },
  { name: "Terra",         bg: "#1a0f0a", accent: "#fb923c" },
  { name: "Sage",          bg: "#0d1a14", accent: "#a3e635" },
  { name: "Void",          bg: "#1a0d1a", accent: "#60a5fa" },
];

function isDarkColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export default function SlidesPage() {
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState("");
  const [slideCount, setSlideCount] = useState("8");
  const [style, setStyle] = useState("technical");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [html, setHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Theme state
  const [themeBg, setThemeBg] = useState("#0d0d14");
  const [themeAccent, setThemeAccent] = useState("#7c6af7");
  const [themeFontPairing, setThemeFontPairing] = useState<FontPairing>("modern");
  const [themeVibe, setThemeVibe] = useState<LayoutVibe>("editorial");

  // Deck + palette state
  const [deck, setDeck] = useState<DeckConfig | null>(null);
  const [suggestedPalettes, setSuggestedPalettes] = useState<SuggestedPalette[]>([]);
  const [rethemeLoading, setRethemeLoading] = useState(false);
  const rethemeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justGeneratedRef = useRef(false);

  const retheme = async (
    bg: string,
    accent: string,
    fontPairing: FontPairing,
    vibe: LayoutVibe,
    currentDeck: DeckConfig,
  ) => {
    setRethemeLoading(true);
    try {
      const res = await fetch("/api/slides/retheme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck: currentDeck, theme: { bg, accent, fontPairing, vibe } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHtml(data.html);
    } catch (e) {
      console.error("Retheme:", e);
    } finally {
      setRethemeLoading(false);
    }
  };

  useEffect(() => {
    if (!deck) return;
    if (justGeneratedRef.current) {
      justGeneratedRef.current = false;
      return;
    }
    if (rethemeDebounceRef.current) clearTimeout(rethemeDebounceRef.current);
    rethemeDebounceRef.current = setTimeout(
      () => retheme(themeBg, themeAccent, themeFontPairing, themeVibe, deck),
      300,
    );
    return () => {
      if (rethemeDebounceRef.current) clearTimeout(rethemeDebounceRef.current);
    };
  }, [themeBg, themeAccent, themeFontPairing, themeVibe, deck]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    if (!topic.trim()) {
      setError("Enter a topic");
      return;
    }
    setError("");
    setLoading(true);
    setHtml("");
    try {
      const res = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          outline,
          slideCount,
          style,
          theme: {
            bg: themeBg,
            accent: themeAccent,
            fontPairing: themeFontPairing,
            vibe: themeVibe,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setHtml(data.html);
      setDeck(data.deck ?? null);
      setSuggestedPalettes(data.suggestedPalettes ?? []);
      justGeneratedRef.current = true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!html) return;
    let content = html;
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) content = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    } catch {}
    const blob = new Blob([content], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${topic.replace(/\s+/g, "-").toLowerCase()}-slides.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Google Fonts for UI font pairing buttons */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=Playfair+Display:wght@700&family=Space+Grotesk:wght@700&family=Barlow+Condensed:wght@700&family=DM+Serif+Display&display=swap');
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 32px" }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            ← HOME
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>
            SLIDE GENERATOR
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
            }}
          >
            GEMINI 2.5 FLASH + CLAUDE HAIKU
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: html ? "380px 1fr" : "600px",
            gap: 40,
            justifyContent: html ? "stretch" : "center",
          }}
        >
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 42,
                  letterSpacing: "-0.03em",
                  marginBottom: 8,
                }}
              >
                Slide
                <br />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "var(--accent)",
                  }}
                >
                  Generator
                </span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                Designer-quality presentations with locked templates. Export as HTML — works in any
                browser.
              </p>
            </div>

            <Field label="TOPIC">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Introduction to Neural Networks"
                onKeyDown={(e) => e.key === "Enter" && generate()}
                style={inputStyle}
              />
            </Field>

            <Field label="OUTLINE (OPTIONAL)" hint="One point per line">
              <textarea
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder={
                  "- What is a neural network\n- Perceptron model\n- Backpropagation\n- Real-world applications"
                }
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="SLIDES">
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(e.target.value)}
                  style={inputStyle}
                >
                  {["6", "8", "10", "12", "15"].map((n) => (
                    <option key={n} value={n}>
                      {n} slides
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="STYLE">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={inputStyle}
                >
                  <option value="technical">Technical</option>
                  <option value="academic">Academic</option>
                  <option value="startup-pitch">Startup Pitch</option>
                  <option value="workshop">Workshop</option>
                  <option value="lecture">Lecture</option>
                </select>
              </Field>
            </div>

            {/* Theme Panel */}
            <ThemePanel
              bg={themeBg}
              accent={themeAccent}
              fontPairing={themeFontPairing}
              vibe={themeVibe}
              suggestedPalettes={suggestedPalettes}
              onBgChange={setThemeBg}
              onAccentChange={setThemeAccent}
              onFontPairingChange={setThemeFontPairing}
              onVibeChange={setThemeVibe}
              onPaletteSelect={(p) => {
                setThemeBg(p.bg);
                setThemeAccent(p.accent);
              }}
            />

            {error && <ErrorBox msg={error} />}

            <button
              onClick={generate}
              disabled={loading}
              style={{
                background: loading ? "var(--bg-elevated)" : "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "14px 24px",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Generating slides...
                </>
              ) : (
                "◈ Generate Slides"
              )}
            </button>

            {html && (
              <button
                onClick={download}
                style={{
                  background: "transparent",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: 10,
                  padding: "12px 24px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ↓ Download HTML
              </button>
            )}

            {/* Model info */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginBottom: 6,
                  letterSpacing: "0.1em",
                }}
              >
                PIPELINE
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                Gemini 2.5 Flash → content JSON
                <br />
                Locked design templates → HTML
              </p>
            </div>
          </div>

          {/* Preview */}
          {html && (
            <div style={{ position: "sticky", top: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  PREVIEW
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: rethemeLoading ? "var(--accent)" : "var(--green)",
                  }}
                >
                  {rethemeLoading ? "◈ APPLYING THEME..." : "● GENERATED"}
                </span>
              </div>

              {/* Shimmer bar */}
              {rethemeLoading && (
                <div
                  style={{
                    height: 2,
                    marginBottom: 4,
                    borderRadius: 1,
                    background:
                      "linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1s linear infinite",
                  }}
                />
              )}

              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  opacity: rethemeLoading ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={html}
                  style={{
                    width: "100%",
                    height: "530px",
                    border: "none",
                    display: "block",
                  }}
                  title="Slide preview"
                />
              </div>
              <p
                style={{
                  marginTop: 10,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textAlign: "center",
                }}
              >
                Arrow keys to navigate · Click text to edit · Download to present fullscreen
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ── PaletteChip ───────────────────────────────────────────────────────────────

function PaletteChip({
  palette,
  selected,
  onClick,
}: {
  palette: SuggestedPalette;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={palette.name}
      style={{
        width: 80,
        height: 44,
        borderRadius: 6,
        background: palette.bg,
        border: selected ? `2px solid ${palette.accent}` : "2px solid transparent",
        outline: selected ? `2px solid ${palette.accent}40` : "none",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {/* Accent stripe at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 5,
          background: palette.accent,
        }}
      />
      {/* Name label */}
      <span
        style={{
          position: "absolute",
          top: 6,
          left: 6,
          right: 6,
          fontFamily: "monospace",
          fontSize: 8,
          color: isDarkColor(palette.bg) ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "left",
          letterSpacing: "0.04em",
        }}
      >
        {palette.name}
      </span>
    </button>
  );
}

// ── ThemePanel ────────────────────────────────────────────────────────────────

function ThemePanel({
  bg,
  accent,
  fontPairing,
  vibe,
  suggestedPalettes,
  onBgChange,
  onAccentChange,
  onFontPairingChange,
  onVibeChange,
  onPaletteSelect,
}: {
  bg: string;
  accent: string;
  fontPairing: FontPairing;
  vibe: LayoutVibe;
  suggestedPalettes: SuggestedPalette[];
  onBgChange: (v: string) => void;
  onAccentChange: (v: string) => void;
  onFontPairingChange: (v: FontPairing) => void;
  onVibeChange: (v: LayoutVibe) => void;
  onPaletteSelect: (p: SuggestedPalette) => void;
}) {
  const selectedStaticIdx = STATIC_PALETTES.findIndex(
    (p) => p.bg === bg && p.accent === accent,
  );
  const selectedSuggestedIdx = suggestedPalettes.findIndex(
    (p) => p.bg === bg && p.accent === accent,
  );

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header row with mini preview */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
          }}
        >
          THEME
        </span>
        <MiniPreview bg={bg} accent={accent} />
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* PALETTES section */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          PALETTES
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {STATIC_PALETTES.map((p, i) => (
            <PaletteChip
              key={p.name}
              palette={p}
              selected={i === selectedStaticIdx && selectedSuggestedIdx === -1}
              onClick={() => onPaletteSelect(p)}
            />
          ))}
        </div>
      </div>

      {/* AI SUGGESTIONS section */}
      {suggestedPalettes.length > 0 && (
        <div>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--accent)",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            AI SUGGESTIONS
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {suggestedPalettes.map((p, i) => (
              <PaletteChip
                key={i}
                palette={p}
                selected={i === selectedSuggestedIdx}
                onClick={() => onPaletteSelect(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM section */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          CUSTOM
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <MiniPreview bg={bg} accent={accent} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
              BG
            </span>
            <HexInput value={bg} onChange={onBgChange} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: accent,
                border: "1px solid var(--border)",
                flexShrink: 0,
              }}
            />
            <HexInput value={accent} onChange={onAccentChange} />
          </div>
        </div>
      </div>

      {/* Font Pairing */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          FONT PAIRING
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FONT_PAIRING_UI.map((fp) => (
            <button
              key={fp.id}
              onClick={() => onFontPairingChange(fp.id)}
              style={{
                fontFamily: fp.family,
                fontSize: 13,
                fontWeight: 700,
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${fontPairing === fp.id ? "var(--accent)" : "var(--border)"}`,
                background: fontPairing === fp.id ? "rgba(124,106,247,0.12)" : "transparent",
                color: fontPairing === fp.id ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {fp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          VIBE
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {(["minimal", "editorial", "bold"] as LayoutVibe[]).map((v) => (
            <button
              key={v}
              onClick={() => onVibeChange(v)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${vibe === v ? "var(--accent)" : "var(--border)"}`,
                background: vibe === v ? "rgba(124,106,247,0.12)" : "transparent",
                color: vibe === v ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HexInput ──────────────────────────────────────────────────────────────────

function HexInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
      }}
      maxLength={7}
      style={{
        width: 80,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "4px 8px",
        color: "var(--text-primary)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        outline: "none",
      }}
    />
  );
}

// ── MiniPreview ───────────────────────────────────────────────────────────────

function MiniPreview({ bg, accent }: { bg: string; accent: string }) {
  const textColor = isDarkColor(bg) ? "#f0f0f8" : "#0d0d14";
  const mutedColor = isDarkColor(bg) ? "rgba(240,240,248,0.4)" : "rgba(13,13,20,0.4)";

  return (
    <div
      style={{
        width: 64,
        height: 36,
        borderRadius: 6,
        background: bg,
        border: "1px solid var(--border)",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ width: 28, height: 3, borderRadius: 2, background: textColor, opacity: 0.8 }} />
        <div style={{ width: 20, height: 2, borderRadius: 2, background: mutedColor }} />
        <div style={{ width: 24, height: 2, borderRadius: 2, background: mutedColor }} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: accent,
        }}
      />
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </label>
        {hint && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              opacity: 0.7,
            }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div
      style={{
        background: "rgba(248,113,113,0.1)",
        border: "1px solid rgba(248,113,113,0.3)",
        borderRadius: 8,
        padding: "12px 16px",
        color: "var(--red)",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
      }}
    >
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-display)",
  fontSize: 14,
  outline: "none",
};
