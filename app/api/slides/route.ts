import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { renderDeck, DeckConfig, buildTheme, DEFAULT_THEME } from "@/lib/slideTemplates";
import type { ThemeInput, SuggestedPalette } from "@/lib/themeTypes";

const SYSTEM = `You are a presentation content expert. Given a topic and outline, generate structured slide content as JSON.

Return ONLY a valid JSON object matching this exact schema (no markdown, no fences):
{
  "title": "Deck Title",
  "subtitle": "Optional subtitle",
  "author": "Optional author",
  "accent": "#7c6af7",
  "suggestedPalettes": [
    { "name": "Palette Name", "bg": "#rrggbb", "accent": "#rrggbb" }
  ],
  "slides": [
    {
      "type": "hero",
      "title": "...",
      "subtitle": "...",
      "author": "...",
      "ticker": "TOPIC ◆ SUBTOPIC ◆ CONCEPT ◆ "
    },
    {
      "type": "bullets",
      "label": "THE BASICS",
      "title": "Slide Title",
      "bullets": ["Point one with detail", "Point two with detail", "Point three"]
    },
    {
      "type": "two-column",
      "label": "COMPARISON",
      "title": "Slide Title",
      "cols": [
        { "heading": "Left Heading", "body": "Left body text with explanation" },
        { "heading": "Right Heading", "body": "Right body text with explanation" }
      ]
    },
    {
      "type": "three-column",
      "label": "THREE CONCEPTS",
      "title": "Slide Title",
      "cols": [
        { "heading": "First", "body": "First concept explanation" },
        { "heading": "Second", "body": "Second concept explanation" },
        { "heading": "Third", "body": "Third concept explanation" }
      ]
    },
    {
      "type": "timeline",
      "label": "PROCESS",
      "title": "Slide Title",
      "steps": [
        { "number": 1, "title": "Step Title", "body": "Step description" },
        { "number": 2, "title": "Step Title", "body": "Step description" },
        { "number": 3, "title": "Step Title", "body": "Step description" }
      ]
    },
    {
      "type": "image-caption",
      "label": "VISUAL",
      "title": "Slide Title",
      "body": "Description of the visual or diagram shown",
      "imageLabel": "DIAGRAM / FIGURE LABEL"
    },
    {
      "type": "comparison",
      "label": "COMPARE",
      "title": "Slide Title",
      "leftHeader": "Option A",
      "rightHeader": "Option B",
      "rows": [
        { "label": "Feature", "left": "Value A", "right": "Value B" }
      ]
    },
    {
      "type": "code",
      "label": "IMPLEMENTATION",
      "title": "Slide Title",
      "body": "Brief description",
      "code": "// code here",
      "language": "typescript"
    },
    {
      "type": "stats",
      "label": "BY THE NUMBERS",
      "title": "Slide Title",
      "stats": [
        { "value": "94%", "label": "Metric label" }
      ]
    },
    {
      "type": "quote",
      "quote": "Impactful quote here",
      "author": "Attribution"
    },
    {
      "type": "section-break",
      "label": "PART 02",
      "title": "Section Title",
      "body": "Brief section description",
      "ticker": "SECTION TOPIC ◆ "
    },
    {
      "type": "closing",
      "title": "Thank You.",
      "body": "Optional closing message",
      "cta": "Optional CTA text",
      "ctaUrl": "https://example.com",
      "ticker": "THANK YOU ◆ QUESTIONS ◆ "
    }
  ]
}

RULES:
- First slide must be type "hero"
- Last slide must be type "closing"
- Use section-break slides to divide major sections
- Vary slide types — never use the same type more than 3 times in a row
- Bullets should be substantive, 1-2 sentences each, not single words
- Stats slides need real numbers if topic allows
- accent: pick any hex colour that fits the topic's mood — used as fallback only if no theme is provided
- ticker text: short repeating phrase ending with " ◆ "
- suggestedPalettes: suggest exactly 4 thematically matched palettes (dark-preferred, use actual #rrggbb hex values)
- Use timeline for sequential processes (up to 5 steps)
- Use three-column for exactly 3 parallel concepts
- Use image-caption for diagram or visual reference slides
- Use comparison for feature comparisons, pros/cons, or side-by-side analysis`;

export async function POST(req: NextRequest) {
  try {
    const { topic, outline, slideCount, style, theme: themeInput } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "Topic required" }, { status: 400 });

    const prompt = `Topic: "${topic}"
Style: ${style ?? "technical"}
Number of slides: ${slideCount ?? 8}
${outline ? `Outline:\n${outline}` : ""}

Generate the slide deck JSON now. Make content substantive and specific — not generic filler.`;

    const raw = await callGemini(SYSTEM, prompt, "gemini-2.5-flash", 0.75);
    const cleaned = raw
      .replace(/^```json\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const rawDeck = JSON.parse(cleaned) as DeckConfig & { suggestedPalettes?: unknown[] };
    const suggestedPalettes: SuggestedPalette[] = (rawDeck.suggestedPalettes ?? [])
      .filter((p: unknown): p is SuggestedPalette => {
        const x = p as Record<string, string>;
        return typeof x?.name === "string"
          && /^#[0-9a-fA-F]{6}$/.test(x?.bg ?? "")
          && /^#[0-9a-fA-F]{6}$/.test(x?.accent ?? "");
      })
      .slice(0, 4);
    const deck: DeckConfig = { ...rawDeck };
    delete (deck as unknown as Record<string, unknown>).suggestedPalettes;

    const resolvedTheme = themeInput
      ? buildTheme(themeInput as ThemeInput)
      : { ...DEFAULT_THEME, accent: deck.accent ?? DEFAULT_THEME.accent };

    deck.theme = resolvedTheme;
    const html = renderDeck(deck);

    return NextResponse.json({ html, deck, suggestedPalettes });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
