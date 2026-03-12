import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

const SYSTEM = `You are a world-class graphic designer creating stunning HTML posters and infographics.

DESIGN PHILOSOPHY:
- Bold editorial aesthetic — think magazine cover, not PowerPoint
- Strong typographic hierarchy with huge display numbers/text as visual anchors
- Intentional density contrast: some areas very spacious, others information-dense
- Rich use of the provided color scheme — gradients, overlays, borders
- Every poster must feel uniquely designed, not templated

TECHNICAL RULES:
- Self-contained HTML, no external image dependencies
- Use Google Fonts — import distinctive display fonts (Syne, Clash Display, Space Grotesk, Playfair Display, etc — NOT Inter/Roboto/Arial)
- Use CSS gradients, shapes, borders, Unicode symbols for visual interest
- Fixed dimensions: portrait = 800×1100px, landscape = 1100×720px
- Include subtle "StudyForge" watermark in footer

OUTPUT: Complete HTML file only. No markdown. Start with <!DOCTYPE html>.`;

export async function POST(req: NextRequest) {
  try {
    const { topic, content, posterType, colorScheme, orientation } =
      await req.json();
    if (!topic)
      return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const colorMap: Record<
      string,
      { bg: string; accent: string; text: string; bg2: string }
    > = {
      "dark-purple": {
        bg: "#0d0d14",
        accent: "#7c6af7",
        text: "#f0f0f8",
        bg2: "#13131e",
      },
      "light-green": {
        bg: "#f0faf4",
        accent: "#16a34a",
        text: "#1a1a1a",
        bg2: "#dcfce7",
      },
      "dark-amber": {
        bg: "#0f0d08",
        accent: "#fbbf24",
        text: "#f5f0e8",
        bg2: "#1a1608",
      },
      "white-red": {
        bg: "#ffffff",
        accent: "#e53e3e",
        text: "#1a1a1a",
        bg2: "#fff5f5",
      },
      "navy-cyan": {
        bg: "#0a1628",
        accent: "#22d3ee",
        text: "#e0f2fe",
        bg2: "#0f2040",
      },
      "cream-black": {
        bg: "#faf6f0",
        accent: "#111111",
        text: "#1a1a1a",
        bg2: "#f0ebe3",
      },
    };

    const colors = colorMap[colorScheme] ?? colorMap["dark-purple"];
    const dims =
      orientation === "landscape" ? "1100px × 720px" : "800px × 1100px";

    const prompt = `Create a ${posterType} poster about: "${topic}"
Dimensions: ${dims} (${orientation})
Colors — background: ${colors.bg}, accent: ${colors.accent}, text: ${colors.text}, secondary bg: ${colors.bg2}
${content ? `\nContent to include:\n${content}` : ""}

Make it genuinely stunning — better than a Canva template. Use bold typography, creative layouts, and rich visual hierarchy. The design should feel intentional and editorial, not generic.`;

    const raw = await callGemini(SYSTEM, prompt, "gemini-2.5-flash", 0.9);
    const html = raw
      .replace(/^```html\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    return NextResponse.json({ html });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
