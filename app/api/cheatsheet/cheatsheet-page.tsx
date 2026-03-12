"use client";
import { useState, useCallback } from "react";
import Link from "next/link";

type CheatItem = { term: string; definition: string; note?: string };
type CheatSection = { heading: string; type: string; items: CheatItem[] };
type CheatData = {
  title: string;
  subtitle: string;
  accentColor: string;
  sections: CheatSection[];
  keyWarnings: string[];
  quickRef: string[];
};

export default function CheatsheetPage() {
  const [topic, setTopic] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [density, setDensity] = useState("high");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    "idle" | "extracting" | "structuring" | "done"
  >("idle");
  const [error, setError] = useState("");
  const [cheatData, setCheatData] = useState<CheatData | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    await processFiles(Array.from(e.dataTransfer.files));
  }, []);

  const processFiles = async (files: File[]) => {
    const names: string[] = [];
    let combined = "";
    for (const file of files) {
      names.push(file.name);
      if (
        file.type === "text/plain" ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".csv")
      ) {
        combined += `\n\n=== ${file.name} ===\n` + (await file.text());
      }
    }
    setFileNames((prev) => [...prev, ...names]);
    setSourceText((prev) => prev + combined);
  };

  const generate = async () => {
    if (!sourceText.trim() && !topic.trim()) {
      setError("Add source material or a topic");
      return;
    }
    setError("");
    setLoading(true);
    setCheatData(null);
    setStep("extracting");
    try {
      const res = await fetch("/api/cheatsheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, sourceText, density }),
      });
      setStep("structuring");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setCheatData(data.cheatData);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 32px" }}>
        <div
          className="no-print"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
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
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "#4ade80",
            }}
          >
            CHEATSHEET FORGE
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
            }}
          >
            GEMINI 2.5 FLASH + CLAUDE SONNET
          </span>
        </div>

        {!cheatData ? (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 42,
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Cheatsheet
              <br />
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#4ade80",
                }}
              >
                Forge
              </span>
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 15,
                lineHeight: 1.6,
                marginBottom: 40,
              }}
            >
              Gemini reads your slides. Claude structures the cheatsheet.
              Nothing hallucinated.
            </p>

            {/* Pipeline indicator */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "16px 20px",
                marginBottom: 32,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginBottom: 12,
                  letterSpacing: "0.1em",
                }}
              >
                PIPELINE
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <Step
                  label="Upload"
                  status={step === "idle" ? "pending" : "done"}
                />
                <Connector />
                <Step
                  label="Gemini 2.5 reads"
                  status={
                    step === "extracting"
                      ? "active"
                      : step === "structuring" || step === "done"
                        ? "done"
                        : "pending"
                  }
                />
                <Connector />
                <Step
                  label="Claude structures"
                  status={
                    step === "structuring"
                      ? "active"
                      : step === "done"
                        ? "done"
                        : "pending"
                  }
                />
                <Connector />
                <Step
                  label="Cheatsheet"
                  status={step === "done" ? "done" : "pending"}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="MODULE / TOPIC">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. CS2109S — Intro to AI & ML"
                  style={inputStyle}
                />
              </Field>

              {/* Drop zone */}
              <div>
                <label
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  UPLOAD FILES
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                  style={{
                    border: `2px dashed ${dragging ? "#4ade80" : "var(--border)"}`,
                    borderRadius: 12,
                    padding: 28,
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging
                      ? "rgba(74,222,128,0.05)"
                      : "var(--bg-card)",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".txt,.md,.csv"
                    onChange={(e) =>
                      e.target.files && processFiles(Array.from(e.target.files))
                    }
                    style={{ display: "none" }}
                  />
                  <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    Drop files or click to upload
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                    }}
                  >
                    TXT · MD · CSV
                  </p>
                  {fileNames.length > 0 && (
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        justifyContent: "center",
                      }}
                    >
                      {fileNames.map((n) => (
                        <span
                          key={n}
                          style={{
                            background: "rgba(74,222,128,0.1)",
                            color: "#4ade80",
                            borderRadius: 6,
                            padding: "3px 10px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                          }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Field
                label="PASTE SOURCE MATERIAL"
                hint={`${sourceText.length.toLocaleString()} / 50,000 chars`}
              >
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder={
                    "Paste lecture notes, slide text, past year paper questions...\n\nThe more content you provide, the denser and more accurate the cheatsheet."
                  }
                  rows={10}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                />
              </Field>

              <Field label="DENSITY">
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  style={inputStyle}
                >
                  <option value="maximum">
                    Maximum — closed-book exams, everything
                  </option>
                  <option value="high">High — all important content</option>
                  <option value="medium">Medium — key concepts only</option>
                </select>
              </Field>

              {error && (
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
                  {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={loading}
                style={{
                  background: loading ? "var(--bg-elevated)" : "#4ade80",
                  color: loading ? "var(--text-secondary)" : "#0a0a0f",
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
                }}
              >
                {loading ? (
                  <>
                    <Spinner color="#4ade80" />
                    {step === "extracting"
                      ? "Gemini reading source..."
                      : "Claude structuring..."}
                  </>
                ) : (
                  "◉ Forge Cheatsheet"
                )}
              </button>
            </div>
          </div>
        ) : (
          <CheatsheetView
            data={cheatData}
            onBack={() => {
              setCheatData(null);
              setStep("idle");
            }}
          />
        )}
      </div>
    </main>
  );
}

function Step({
  label,
  status,
}: {
  label: string;
  status: "pending" | "active" | "done";
}) {
  const colors = {
    pending: "var(--text-muted)",
    active: "#4ade80",
    done: "#4ade80",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: status === "pending" ? "var(--bg-elevated)" : "#4ade80",
          border: `2px solid ${colors[status]}`,
          transition: "all 0.3s",
          boxShadow: status === "active" ? "0 0 10px #4ade8088" : "none",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: colors[status],
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Connector() {
  return (
    <div
      style={{
        flex: 1,
        height: 1,
        background: "var(--border)",
        margin: "0 4px",
        marginBottom: 14,
      }}
    />
  );
}

function CheatsheetView({
  data,
  onBack,
}: {
  data: CheatData;
  onBack: () => void;
}) {
  const accent = data.accentColor || "#4ade80";
  return (
    <div>
      <div
        className="no-print"
        style={{ display: "flex", gap: 12, marginBottom: 24 }}
      >
        <button
          onClick={onBack}
          style={{
            ...btnStyle,
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          ← Regenerate
        </button>
        <button
          onClick={() => window.print()}
          style={{ ...btnStyle, background: accent, color: "#0a0a0f" }}
        >
          ⎙ Print / Save PDF
        </button>
      </div>

      <div
        style={{
          background: "#f9f9f9",
          color: "#111",
          borderRadius: 12,
          padding: 32,
          fontFamily: "var(--font-display)",
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: `3px solid ${accent}`,
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {data.title}
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#666",
                  marginTop: 2,
                }}
              >
                {data.subtitle}
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "#bbb",
                textAlign: "right",
              }}
            >
              StudyForge
              <br />
              Gemini 2.5 + Claude Sonnet
            </div>
          </div>
        </div>

        {/* Quick ref */}
        {data.quickRef?.length > 0 && (
          <div
            style={{
              background: accent + "15",
              border: `1px solid ${accent}33`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: accent,
                fontWeight: 700,
                marginBottom: 6,
                letterSpacing: "0.1em",
              }}
            >
              QUICK REFERENCE
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px" }}>
              {data.quickRef.map((r, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#333",
                  }}
                >
                  • {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        <div style={{ columns: "2 300px", columnGap: 18 }}>
          {data.sections.map((sec, i) => (
            <div
              key={i}
              style={{
                breakInside: "avoid",
                marginBottom: 14,
                background: "white",
                border: "1px solid #e8e8e8",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 14,
                    background: accent,
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#222",
                  }}
                >
                  {sec.heading}
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "#ccc",
                    marginLeft: "auto",
                  }}
                >
                  {sec.type}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sec.items.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(80px,auto) 1fr",
                      gap: "3px 10px",
                      borderBottom:
                        j < sec.items.length - 1 ? "1px solid #f0f0f0" : "none",
                      paddingBottom: j < sec.items.length - 1 ? 6 : 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#111",
                      }}
                    >
                      {item.term}
                    </span>
                    <span
                      style={{ fontSize: 11, color: "#444", lineHeight: 1.45 }}
                    >
                      {item.definition}
                      {item.note && (
                        <span style={{ color: "#999", fontStyle: "italic" }}>
                          {" "}
                          [{item.note}]
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Warnings */}
        {data.keyWarnings?.length > 0 && (
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fbbf2433",
              borderRadius: 8,
              padding: "10px 14px",
              marginTop: 8,
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "#d97706",
                fontWeight: 700,
                marginBottom: 6,
                letterSpacing: "0.1em",
              }}
            >
              ⚠ COMMON MISTAKES
            </p>
            {data.keyWarnings.map((w, i) => (
              <p
                key={i}
                style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}
              >
                • {w}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
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

function Spinner({ color = "white" }: { color?: string }) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        border: `2px solid ${color}44`,
        borderTopColor: color,
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

const btnStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
