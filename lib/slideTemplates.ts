import type { FontPairing, LayoutVibe, ThemeInput, ThemeConfig } from "./themeTypes";

export type { FontPairing, LayoutVibe, ThemeInput, ThemeConfig };

export type SlideType =
  | "hero"
  | "two-column"
  | "bullets"
  | "code"
  | "quote"
  | "stats"
  | "section-break"
  | "closing"
  | "timeline"
  | "three-column"
  | "image-caption"
  | "comparison";

export interface Slide {
  type: SlideType;
  label?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  code?: string;
  language?: string;
  quote?: string;
  author?: string;
  stats?: { value: string; label: string }[];
  cols?: { heading: string; body: string }[];
  ticker?: string;
  accentColor?: string;
  cta?: string;
  ctaUrl?: string;
  steps?: { number?: number; title: string; body: string }[];
  imageLabel?: string;
  leftHeader?: string;
  rightHeader?: string;
  rows?: { label: string; left: string; right: string }[];
}

export interface DeckConfig {
  title: string;
  subtitle?: string;
  author?: string;
  accent: string;
  slides: Slide[];
  theme?: ThemeConfig;
}

// ── Pure helpers ─────────────────────────────────────────────────────────────

function adjustHex(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// ── Font pairings ─────────────────────────────────────────────────────────────

const FONT_PAIRINGS: Record<
  FontPairing,
  { googleImport: string; heading: string; mono: string; serif: string }
> = {
  modern: {
    googleImport:
      "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Serif:ital@0;1&display=swap",
    heading: "'Syne', sans-serif",
    mono: "'DM Mono', monospace",
    serif: "'Instrument Serif', serif",
  },
  editorial: {
    googleImport:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap",
    heading: "'Playfair Display', serif",
    mono: "'Space Mono', monospace",
    serif: "'Playfair Display', serif",
  },
  tech: {
    googleImport:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fira+Code:wght@300;400;500&display=swap",
    heading: "'Space Grotesk', sans-serif",
    mono: "'Fira Code', monospace",
    serif: "'Space Grotesk', sans-serif",
  },
  sharp: {
    googleImport:
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;1,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Lora:ital,wght@0,400;1,400&display=swap",
    heading: "'Barlow Condensed', sans-serif",
    mono: "'JetBrains Mono', monospace",
    serif: "'Lora', serif",
  },
  classic: {
    googleImport:
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap",
    heading: "'DM Serif Display', serif",
    mono: "'DM Mono', monospace",
    serif: "'DM Serif Display', serif",
  },
};

// ── Theme builder ─────────────────────────────────────────────────────────────

export function buildTheme(input: ThemeInput): ThemeConfig {
  const dark = isDark(input.bg);
  const text = dark ? "#f0f0f8" : "#0d0d14";
  const textMuted = dark ? hexToRgba("#f0f0f8", 0.35) : hexToRgba("#0d0d14", 0.4);
  const border = dark ? hexToRgba("#ffffff", 0.07) : hexToRgba("#000000", 0.1);
  const bg2 = adjustHex(input.bg, dark ? 12 : -12);
  const bg3 = adjustHex(input.bg, dark ? 22 : -22);
  const accentText = isDark(input.accent) ? "#f0f0f8" : "#0d0d14";

  return {
    ...input,
    bg2,
    bg3,
    text,
    textMuted,
    border,
    accentText,
  };
}

export const DEFAULT_THEME = buildTheme({
  bg: "#0d0d14",
  accent: "#7c6af7",
  fontPairing: "modern",
  vibe: "editorial",
});

// ── Shared CSS ────────────────────────────────────────────────────────────────

const SHARED_CSS = (t: ThemeConfig): string => {
  const fp = FONT_PAIRINGS[t.fontPairing];

  const vibeVars: Record<LayoutVibe, { heroSize: string; cardRadius: string; accentLineW: string; gridOpacity: number }> = {
    minimal:  { heroSize: "64px",  cardRadius: "6px",  accentLineW: "32px", gridOpacity: 0 },
    editorial:{ heroSize: "72px",  cardRadius: "12px", accentLineW: "48px", gridOpacity: 0.025 },
    bold:     { heroSize: "88px",  cardRadius: "4px",  accentLineW: "64px", gridOpacity: 0.04 },
  };
  const vv = vibeVars[t.vibe];

  return `
  @import url('${fp.googleImport}');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:           ${t.bg};
    --bg2:          ${t.bg2};
    --bg3:          ${t.bg3};
    --border:       ${t.border};
    --text:         ${t.text};
    --muted:        ${t.textMuted};
    --accent:       ${t.accent};
    --accent-text:  ${t.accentText};
    --ff-sans:      ${fp.heading};
    --ff-mono:      ${fp.mono};
    --ff-ser:       ${fp.serif};
    --hero-size:    ${vv.heroSize};
    --card-radius:  ${vv.cardRadius};
    --accent-line-w:${vv.accentLineW};
  }

  html, body { width: 100%; height: 100%; background: var(--bg); overflow: hidden; }

  .deck { width: 1280px; height: 720px; position: relative; overflow: hidden; }

  /* grid bg */
  .deck::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(${hexToRgba(t.text, vv.gridOpacity)} 1px, transparent 1px),
      linear-gradient(90deg, ${hexToRgba(t.text, vv.gridOpacity)} 1px, transparent 1px);
    background-size: 64px 64px;
  }

  .slide {
    width: 1280px; height: 720px;
    display: none; position: absolute; inset: 0;
    font-family: var(--ff-sans);
    color: var(--text);
    background: var(--bg);
    z-index: 1;
  }
  .slide.active { display: flex; flex-direction: column; }

  /* slide number */
  .slide-num {
    position: absolute; top: 28px; right: 36px;
    font-family: var(--ff-mono); font-size: 11px;
    color: var(--muted); letter-spacing: 0.08em;
    z-index: 10;
  }

  /* label */
  .label {
    font-family: var(--ff-mono); font-size: 10px; letter-spacing: 0.18em;
    color: var(--muted); text-transform: uppercase;
  }
  .label-accent { color: var(--accent); }

  /* ticker */
  .ticker-wrap {
    overflow: hidden; white-space: nowrap;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 10px 0; background: var(--bg2);
  }
  .ticker-inner {
    display: inline-block;
    animation: ticker 22s linear infinite;
    font-family: var(--ff-mono); font-size: 10px; letter-spacing: 0.14em;
    color: var(--muted);
  }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* nav */
  .nav {
    position: fixed; bottom: 28px; right: 36px;
    display: flex; gap: 10px; z-index: 100;
  }
  .nav button {
    background: var(--bg3); border: 1px solid var(--border);
    color: var(--text); border-radius: 6px;
    width: 34px; height: 34px; font-size: 14px;
    cursor: pointer; transition: all 0.15s;
    font-family: var(--ff-mono);
    display: flex; align-items: center; justify-content: center;
  }
  .nav button:hover { border-color: var(--accent); color: var(--accent); }

  /* progress bar */
  .progress {
    position: fixed; bottom: 0; left: 0; height: 2px;
    background: var(--accent); transition: width 0.3s ease;
    z-index: 100;
  }

  /* contenteditable */
  [contenteditable]:focus {
    outline: 2px solid var(--accent);
    border-radius: 2px;
    outline-offset: 2px;
    animation: none !important;
  }
  [contenteditable] { cursor: text; }

  /* accent line */
  .accent-line {
    width: var(--accent-line-w); height: 3px; background: var(--accent);
    border-radius: 2px; margin-bottom: 20px;
  }

  /* code block */
  pre {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--card-radius); padding: 24px 28px;
    font-family: var(--ff-mono); font-size: 13px; line-height: 1.7;
    color: var(--text); overflow: auto;
  }
  .code-keyword { color: #a394ff; }
  .code-string  { color: #86efac; }
  .code-comment { color: var(--muted); font-style: italic; }
  .code-fn      { color: #67e8f9; }
  .code-num     { color: #fbbf24; }

  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .slide.active > * { animation: fadeUp 0.4s ease both; }
  .slide.active > *:nth-child(2) { animation-delay: 0.06s; }
  .slide.active > *:nth-child(3) { animation-delay: 0.12s; }
  .slide.active > *:nth-child(4) { animation-delay: 0.18s; }
  .slide.active > *:nth-child(5) { animation-delay: 0.24s; }
`;
};

// ── Template renderers ────────────────────────────────────────────────────────

function heroSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const ticker = s.ticker ?? `${s.title} ◆ ${s.subtitle ?? ""} ◆ `;
  const tickerDouble = ticker.repeat(8);
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>

  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:72px 80px 40px;">
    ${s.label ? `<p class="label label-accent" contenteditable="true" style="margin-bottom:24px;">${s.label}</p>` : ""}
    <h1 contenteditable="true" style="font-size:var(--hero-size);font-weight:800;line-height:1.0;letter-spacing:-0.035em;max-width:780px;margin-bottom:28px;">
      ${s.title}
    </h1>
    ${s.subtitle ? `<p contenteditable="true" style="font-size:18px;color:var(--muted);font-family:var(--ff-sans);max-width:520px;line-height:1.5;">${s.subtitle}</p>` : ""}
    ${s.author ? `<p contenteditable="true" style="font-family:var(--ff-mono);font-size:12px;color:var(--muted);margin-top:32px;letter-spacing:0.08em;">${s.author}</p>` : ""}
  </div>

  <!-- accent blob -->
  <div style="position:absolute;top:-120px;right:-120px;width:500px;height:500px;border-radius:50%;background:radial-gradient(ellipse,${hexToRgba(theme.accent, 0.13)} 0%,transparent 70%);pointer-events:none;"></div>

  <div class="ticker-wrap">
    <div class="ticker-inner">${tickerDouble}</div>
  </div>
</div>`;
}

function sectionBreakSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const ticker = s.ticker ?? `${s.title} ◆ `;
  const tickerDouble = ticker.repeat(10);
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div class="ticker-wrap">
    <div class="ticker-inner">${tickerDouble}</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 80px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:20px;">${s.label}</p>` : ""}
    <h2 contenteditable="true" style="font-size:64px;font-weight:800;letter-spacing:-0.03em;line-height:1.05;">
      ${s.title}
    </h2>
    ${s.body ? `<p contenteditable="true" style="margin-top:20px;font-size:18px;color:var(--muted);max-width:540px;">${s.body}</p>` : ""}
  </div>
  <div style="position:absolute;bottom:80px;left:80px;width:var(--accent-line-w);height:3px;background:${theme.accent};border-radius:2px;"></div>
</div>`;
}

function bulletsSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const bullets = s.bullets ?? [];
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:64px 80px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:16px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:42px;font-weight:800;letter-spacing:-0.025em;margin-bottom:40px;max-width:680px;">${s.title}</h2>
    <ul style="list-style:none;display:flex;flex-direction:column;gap:16px;max-width:720px;">
      ${bullets
        .map(
          (b) => `
      <li style="display:flex;gap:16px;align-items:flex-start;">
        <span style="color:var(--accent);font-size:18px;margin-top:2px;flex-shrink:0;">◆</span>
        <span contenteditable="true" style="font-size:18px;color:var(--text);opacity:0.78;line-height:1.5;">${b}</span>
      </li>`,
        )
        .join("")}
    </ul>
  </div>
</div>`;
}

function twoColumnSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const cols = s.cols ?? [];
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;padding:56px 80px 48px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:38px;font-weight:800;letter-spacing:-0.025em;margin-bottom:40px;">${s.title}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;flex:1;">
      ${cols
        .map(
          (col) => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--card-radius);padding:28px 28px;">
        <div style="width:3px;height:20px;background:${theme.accent};border-radius:2px;margin-bottom:14px;"></div>
        <h3 contenteditable="true" style="font-size:16px;font-weight:700;letter-spacing:0.02em;margin-bottom:12px;">${col.heading}</h3>
        <p contenteditable="true" style="font-size:15px;color:var(--muted);line-height:1.65;">${col.body}</p>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</div>`;
}

function codeSlide(s: Slide, num: number, total: number, _theme: ThemeConfig): string {
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;padding:52px 72px 48px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:36px;font-weight:800;letter-spacing:-0.025em;margin-bottom:8px;">${s.title}</h2>
    ${s.body ? `<p contenteditable="true" style="font-size:15px;color:var(--muted);margin-bottom:24px;">${s.body}</p>` : '<div style="margin-bottom:24px;"></div>'}
    <pre contenteditable="true" style="flex:1;overflow:auto;font-size:14px;">${s.code ?? ""}</pre>
    ${s.language ? `<p style="font-family:var(--ff-mono);font-size:10px;color:var(--muted);margin-top:10px;letter-spacing:0.1em;">${s.language.toUpperCase()}</p>` : ""}
  </div>
</div>`;
}

function quoteSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:72px 120px;text-align:center;">
    <div style="font-size:80px;color:${theme.accent};opacity:0.3;line-height:0.5;margin-bottom:32px;font-family:Georgia,serif;">"</div>
    <p contenteditable="true" style="font-family:var(--ff-ser);font-style:italic;font-size:32px;line-height:1.5;color:var(--text);opacity:0.88;max-width:820px;margin-bottom:32px;">${s.quote}</p>
    ${s.author ? `<p contenteditable="true" style="font-family:var(--ff-mono);font-size:12px;color:var(--muted);letter-spacing:0.1em;">— ${s.author}</p>` : ""}
  </div>
</div>`;
}

function statsSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const stats = s.stats ?? [];
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:64px 80px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:38px;font-weight:800;letter-spacing:-0.025em;margin-bottom:48px;">${s.title}</h2>
    <div style="display:grid;grid-template-columns:repeat(${Math.min(stats.length, 4)},1fr);gap:20px;">
      ${stats
        .map(
          (st) => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--card-radius);padding:28px 24px;">
        <p contenteditable="true" style="font-size:48px;font-weight:800;letter-spacing:-0.04em;color:${theme.accent};line-height:1;">${st.value}</p>
        <p contenteditable="true" style="font-family:var(--ff-mono);font-size:11px;color:var(--muted);margin-top:10px;letter-spacing:0.08em;text-transform:uppercase;">${st.label}</p>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</div>`;
}

function closingSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const ticker = s.ticker ?? `${s.title} ◆ `;
  const tickerDouble = ticker.repeat(10);
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:72px 80px 40px;">
    <h2 contenteditable="true" style="font-size:80px;font-weight:800;letter-spacing:-0.04em;line-height:1.0;margin-bottom:24px;">${s.title}</h2>
    ${s.body ? `<p contenteditable="true" style="font-size:18px;color:var(--muted);max-width:480px;line-height:1.6;margin-bottom:40px;">${s.body}</p>` : ""}
    ${
      s.cta
        ? `
    <a href="${s.ctaUrl ?? "#"}" style="display:inline-flex;align-items:center;gap:10px;background:${theme.accent};color:var(--accent-text);border-radius:8px;padding:14px 28px;font-family:var(--ff-mono);font-size:13px;font-weight:600;letter-spacing:0.06em;text-decoration:none;">
      <span contenteditable="true">${s.cta}</span> →
    </a>`
        : ""
    }
  </div>
  <div class="ticker-wrap">
    <div class="ticker-inner">${tickerDouble}</div>
  </div>
  <div style="position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:600px;height:600px;border-radius:50%;background:radial-gradient(ellipse,${hexToRgba(theme.accent, 0.094)} 0%,transparent 65%);pointer-events:none;"></div>
</div>`;
}

function timelineSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const steps = (s.steps ?? []).slice(0, 5);
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;padding:56px 80px 48px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:38px;font-weight:800;letter-spacing:-0.025em;margin-bottom:48px;">${s.title ?? ""}</h2>
    <div style="position:relative;display:flex;flex-direction:row;gap:0;flex:1;align-items:flex-start;">
      ${steps.length > 1 ? `<div style="position:absolute;top:20px;left:20px;right:20px;height:1px;background:${hexToRgba(theme.accent, 0.3)};z-index:0;"></div>` : ""}
      ${steps.map((step, i) => `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:1;padding:0 12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${theme.accent};display:flex;align-items:center;justify-content:center;margin-bottom:16px;flex-shrink:0;">
          <span style="font-family:var(--ff-mono);font-size:14px;font-weight:700;color:${theme.accentText};">${step.number ?? i + 1}</span>
        </div>
        <p contenteditable="true" style="font-size:14px;font-weight:700;margin-bottom:8px;line-height:1.3;">${step.title}</p>
        <p contenteditable="true" style="font-size:12px;color:var(--muted);line-height:1.5;">${step.body}</p>
      </div>`).join("")}
    </div>
  </div>
</div>`;
}

function threeColumnSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const cols = (s.cols ?? []).slice(0, 3);
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;padding:56px 80px 48px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:38px;font-weight:800;letter-spacing:-0.025em;margin-bottom:40px;">${s.title ?? ""}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;flex:1;">
      ${cols.map((col) => `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--card-radius);padding:28px 24px;">
        <div style="width:3px;height:20px;background:${theme.accent};border-radius:2px;margin-bottom:14px;"></div>
        <h3 contenteditable="true" style="font-size:16px;font-weight:700;letter-spacing:0.02em;margin-bottom:12px;">${col.heading}</h3>
        <p contenteditable="true" style="font-size:14px;color:var(--muted);line-height:1.65;">${col.body}</p>
      </div>`).join("")}
    </div>
  </div>
</div>`;
}

function imageCaptionSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:0;">
    <div style="background:${hexToRgba(theme.bg2, 1)};border-right:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;padding:40px;">
      <div style="font-size:48px;opacity:0.3;">□</div>
      <p contenteditable="true" style="font-family:var(--ff-mono);font-size:11px;color:var(--muted);letter-spacing:0.1em;text-align:center;">${s.imageLabel ?? "IMAGE PLACEHOLDER"}</p>
    </div>
    <div style="display:flex;flex-direction:column;justify-content:center;padding:56px 60px;">
      ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
      <div class="accent-line"></div>
      <h2 contenteditable="true" style="font-size:36px;font-weight:800;letter-spacing:-0.025em;margin-bottom:20px;">${s.title ?? ""}</h2>
      ${s.body ? `<p contenteditable="true" style="font-size:16px;color:var(--muted);line-height:1.65;">${s.body}</p>` : ""}
    </div>
  </div>
</div>`;
}

function comparisonSlide(s: Slide, num: number, total: number, theme: ThemeConfig): string {
  const rows = (s.rows ?? []).slice(0, 6);
  return `
<div class="slide" id="slide-${num}">
  <div class="slide-num">${String(num).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
  <div style="flex:1;display:flex;flex-direction:column;padding:56px 80px 48px;">
    ${s.label ? `<p class="label" contenteditable="true" style="margin-bottom:14px;">${s.label}</p>` : ""}
    <div class="accent-line"></div>
    <h2 contenteditable="true" style="font-size:38px;font-weight:800;letter-spacing:-0.025em;margin-bottom:32px;">${s.title ?? ""}</h2>
    <div style="border:1px solid var(--border);border-radius:var(--card-radius);overflow:hidden;flex:1;">
      <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;background:var(--bg2);border-bottom:1px solid var(--border);">
        <div style="padding:14px 20px;"></div>
        <div style="padding:14px 20px;font-family:var(--ff-mono);font-size:12px;font-weight:700;color:${theme.accent};letter-spacing:0.06em;">
          <span contenteditable="true">${s.leftHeader ?? "OPTION A"}</span>
        </div>
        <div style="padding:14px 20px;font-family:var(--ff-mono);font-size:12px;font-weight:700;color:${theme.accent};letter-spacing:0.06em;border-left:1px solid var(--border);">
          <span contenteditable="true">${s.rightHeader ?? "OPTION B"}</span>
        </div>
      </div>
      ${rows.map((row, i) => `
      <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;background:${i % 2 === 1 ? hexToRgba(theme.text, 0.03) : "transparent"};border-bottom:1px solid var(--border);">
        <div style="padding:12px 20px;font-size:13px;font-weight:600;color:var(--muted);">
          <span contenteditable="true">${row.label}</span>
        </div>
        <div style="padding:12px 20px;font-size:13px;color:var(--text);">
          <span contenteditable="true">${row.left}</span>
        </div>
        <div style="padding:12px 20px;font-size:13px;color:var(--text);border-left:1px solid var(--border);">
          <span contenteditable="true">${row.right}</span>
        </div>
      </div>`).join("")}
    </div>
  </div>
</div>`;
}

// ── Main renderer ─────────────────────────────────────────────────────────────

export function renderDeck(deck: DeckConfig): string {
  const theme = deck.theme ?? DEFAULT_THEME;
  const { slides } = deck;
  const total = slides.length;

  const slideHtml = slides
    .map((s, i) => {
      const num = i + 1;
      // Per-slide accent override still supported
      const slideTheme: ThemeConfig = s.accentColor
        ? { ...theme, accent: s.accentColor }
        : theme;
      switch (s.type) {
        case "hero":
          return heroSlide(s, num, total, slideTheme);
        case "section-break":
          return sectionBreakSlide(s, num, total, slideTheme);
        case "bullets":
          return bulletsSlide(s, num, total, slideTheme);
        case "two-column":
          return twoColumnSlide(s, num, total, slideTheme);
        case "code":
          return codeSlide(s, num, total, slideTheme);
        case "quote":
          return quoteSlide(s, num, total, slideTheme);
        case "stats":
          return statsSlide(s, num, total, slideTheme);
        case "closing":
          return closingSlide(s, num, total, slideTheme);
        case "timeline":
          return timelineSlide(s, num, total, slideTheme);
        case "three-column":
          return threeColumnSlide(s, num, total, slideTheme);
        case "image-caption":
          return imageCaptionSlide(s, num, total, slideTheme);
        case "comparison":
          return comparisonSlide(s, num, total, slideTheme);
        default:
          return bulletsSlide(s, num, total, slideTheme);
      }
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1280"/>
<title>${deck.title}</title>
<style>${SHARED_CSS(theme)}</style>
</head>
<body>
<div class="deck">
${slideHtml}
</div>

<div class="nav">
  <button onclick="prev()" title="Previous">←</button>
  <button onclick="next()" title="Next">→</button>
</div>
<div class="progress" id="progress"></div>

<script>
  let current = 1;
  const total = ${total};

  function show(n) {
    document.querySelectorAll('.slide').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('slide-' + n);
    if (el) el.classList.add('active');
    document.getElementById('progress').style.width = (n / total * 100) + '%';
    current = n;
  }

  function next() { if (current < total) show(current + 1); }
  function prev() { if (current > 1) show(current - 1); }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') next();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp') prev();
  });

  show(1);
</script>
</body>
</html>`;
}
