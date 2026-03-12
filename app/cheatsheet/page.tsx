"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { callGemini } from "@/lib/gemini";

const CHEAT_SYSTEM = `You are an expert study material creator. Generate dense, accurate cheatsheets STRICTLY based on the provided source material.

CRITICAL RULES:
- ONLY include information that exists in the source material provided
- Do NOT add external knowledge or hallucinate content
- Mark every section with the source it came from
- Prioritize: formulas > definitions > key concepts > examples

OUTPUT FORMAT: Return a single JSON object (no markdown fences) like:
{
  "title": "Module Name",
  "subtitle": "Course Code — Exam Cheatsheet",
  "accentColor": "#7c6af7",
  "sections": [
    {
      "heading": "Section Name",
      "type": "formulas|definitions|concepts|examples|warnings",
      "items": [
        { "term": "Term/Formula", "definition": "Explanation", "note": "optional note" }
      ]
    }
  ],
  "keyWarnings": ["Common mistake 1", "Common mistake 2"],
  "quickRef": ["One-liner 1", "One-liner 2"]
}`;

export default function CheatsheetPage() {
  const [apiKey, setApiKey] = useState("");
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [density, setDensity] = useState("high");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cheatData, setCheatData] = useState<CheatData | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    const names: string[] = [];
    let combined = "";
    for (const file of files) {
      names.push(file.name);
      if (file.type === "text/plain") {
        combined += `\n\n=== ${file.name} ===\n` + await file.text();
      } else if (file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        combined += `\n\n=== ${file.name} ===\n` + await file.text();
      } else {
        // For PDF/PPTX we just note the filename and ask user to paste content
        combined += `\n\n[File uploaded: ${file.name} — paste text content below if PDF extraction failed]`;
      }
    }
    setFileNames(prev => [...prev, ...names]);
    setSourceText(prev => prev + combined);
  };

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processFiles(Array.from(e.target.files));
  };

  const generate = async () => {
    if (!apiKey.trim()) { setError("Enter your Gemini API key"); return; }
    if (!sourceText.trim() && !topic.trim()) { setError("Add source material or a topic"); return; }
    setError(""); setLoading(true); setCheatData(null);
    try {
      const prompt = `Topic: ${topic || "Infer from source material"}
Density: ${density}
${sourceText ? `\nSOURCE MATERIAL:\n${sourceText.slice(0, 30000)}` : "Generate from topic (note: no source provided, mark as AI-generated)"}

Create the cheatsheet JSON now.`;
      const result = await callGemini(apiKey, CHEAT_SYSTEM, prompt, 0.3);
      const cleaned = result.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      setCheatData(JSON.parse(cleaned));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed — check API key and try again");
    } finally { setLoading(false); }
  };

  const printCheatsheet = () => window.print();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 32px" }}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>← HOME</Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#4ade80" }}>CHEATSHEET FORGE</span>
        </div>

        {!cheatData ? (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 42, letterSpacing: "-0.03em", marginBottom: 8 }}>
              Cheatsheet<br /><span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "#4ade80" }}>Forge</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
              Upload your slides, lecture notes, or PYP content. AI extracts only what&apos;s actually there — no hallucinations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="GEMINI API KEY" hint="aistudio.google.com — free">
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..." style={inputStyle} />
              </Field>

              <Field label="MODULE / TOPIC NAME">
                <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. CS2109S — Intro to AI & ML" style={inputStyle} />
              </Field>

              {/* Drop zone */}
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                  UPLOAD FILES (TXT, MD — PDF: paste text below)
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                  style={{
                    border: `2px dashed ${dragging ? "#4ade80" : "var(--border)"}`,
                    borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer",
                    background: dragging ? "rgba(74,222,128,0.05)" : "var(--bg-card)",
                    transition: "all 0.2s",
                  }}>
                  <input id="file-input" type="file" multiple accept=".txt,.md,.csv" onChange={onFileInput} style={{ display: "none" }} />
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Drop files here or click to upload</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>TXT · MD · CSV</p>
                  {fileNames.length > 0 && (
                    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                      {fileNames.map(n => (
                        <span key={n} style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", borderRadius: 6, padding: "4px 10px", fontFamily: "var(--font-mono)", fontSize: 11 }}>{n}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Field label="PASTE SOURCE MATERIAL" hint="Slides text, notes, PYP content — up to 30,000 chars">
                <textarea
                  value={sourceText} onChange={e => setSourceText(e.target.value)}
                  placeholder={"Paste lecture notes, slide content, past year paper questions...\n\nThe more you provide, the better the cheatsheet."}
                  rows={10} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.5 }}
                />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                  {sourceText.length.toLocaleString()} / 30,000 chars
                </p>
              </Field>

              <Field label="DENSITY">
                <select value={density} onChange={e => setDensity(e.target.value)} style={inputStyle}>
                  <option value="high">High — Everything important</option>
                  <option value="maximum">Maximum — For closed-book exams</option>
                  <option value="medium">Medium — Key concepts only</option>
                </select>
              </Field>

              {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "12px 16px", color: "var(--red)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{error}</div>}

              <button onClick={generate} disabled={loading} style={{
                background: loading ? "var(--bg-elevated)" : "#4ade80",
                color: loading ? "var(--text-secondary)" : "#0a0a0f",
                border: "none", borderRadius: 10, padding: "14px 24px",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                {loading ? <><Spinner color="#4ade80" />Forging cheatsheet...</> : "◉ Forge Cheatsheet"}
              </button>
            </div>
          </div>
        ) : (
          <CheatsheetView data={cheatData} onBack={() => setCheatData(null)} onPrint={printCheatsheet} />
        )}
      </div>
    </main>
  );
}

type CheatItem = { term: string; definition: string; note?: string };
type CheatSection = { heading: string; type: string; items: CheatItem[] };
type CheatData = {
  title: string; subtitle: string; accentColor: string;
  sections: CheatSection[];
  keyWarnings: string[];
  quickRef: string[];
};

function CheatsheetView({ data, onBack, onPrint }: { data: CheatData; onBack: () => void; onPrint: () => void }) {
  const accent = data.accentColor || "#4ade80";
  return (
    <div>
      <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ ...btnStyle, background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>← Regenerate</button>
        <button onClick={onPrint} style={{ ...btnStyle, background: accent, color: "#0a0a0f" }}>⎙ Print / Save PDF</button>
      </div>

      {/* Cheatsheet */}
      <div style={{
        background: "#f9f9f9", color: "#111", borderRadius: 12, padding: 32,
        fontFamily: "var(--font-display)",
      }}>
        {/* Header */}
        <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{data.title}</h1>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#666", marginTop: 2 }}>{data.subtitle}</p>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#999", textAlign: "right" }}>
              StudyForge AI<br />Grounded on source material
            </div>
          </div>
        </div>

        {/* Quick ref bar */}
        {data.quickRef?.length > 0 && (
          <div style={{ background: accent + "18", border: `1px solid ${accent}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: accent, fontWeight: 600, marginBottom: 6 }}>QUICK REFERENCE</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {data.quickRef.map((r, i) => (
                <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#333" }}>• {r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sections grid */}
        <div style={{ columns: "2 320px", columnGap: 20 }}>
          {data.sections.map((sec, i) => (
            <div key={i} style={{ breakInside: "avoid", marginBottom: 16, background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, flexShrink: 0 }} />
                <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#222" }}>{sec.heading}</h2>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#aaa", marginLeft: "auto" }}>{sec.type}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sec.items.map((item, j) => (
                  <div key={j} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", borderBottom: j < sec.items.length - 1 ? "1px solid #f0f0f0" : "none", paddingBottom: j < sec.items.length - 1 ? 6 : 0 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "#111", whiteSpace: "nowrap" }}>{item.term}</span>
                    <span style={{ fontSize: 11, color: "#444", lineHeight: 1.4 }}>
                      {item.definition}
                      {item.note && <span style={{ color: "#888", fontStyle: "italic" }}> [{item.note}]</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {data.keyWarnings?.length > 0 && (
          <div style={{ background: "#fff8f0", border: "1px solid #fbbf2444", borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#f59e0b", fontWeight: 600, marginBottom: 6 }}>⚠ COMMON MISTAKES</p>
            {data.keyWarnings.map((w, i) => (
              <p key={i} style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>• {w}</p>
            ))}
          </div>
        )}
      </div>
    </div>
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

const btnStyle: React.CSSProperties = {
  border: "none", borderRadius: 8, padding: "10px 20px",
  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
