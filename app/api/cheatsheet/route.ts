import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { callClaude } from "@/lib/claude";

const GEMINI_EXTRACT_SYSTEM = `You are a content extraction specialist. Your job is to read the provided source material and extract ALL key information faithfully.

Extract and return:
1. All definitions and key terms
2. All formulas, equations, algorithms
3. All concepts with their explanations
4. All examples mentioned
5. Any warnings, common mistakes, or exam tips mentioned
6. Any numbered lists or processes

DO NOT add information not in the source. DO NOT summarise away detail.
Return as structured plain text with clear section headers.`;

const CLAUDE_STRUCTURE_SYSTEM = `You are an expert at creating dense, exam-ready cheatsheets. You will receive extracted content from lecture slides and notes.

Your job: structure this into a cheatsheet JSON. ONLY use information from the provided content — never add external knowledge.

Return ONLY valid JSON (no markdown fences):
{
  "title": "Module Name",
  "subtitle": "Course Code — Topic Cheatsheet",
  "accentColor": "#7c6af7",
  "sections": [
    {
      "heading": "Section Name",
      "type": "formulas|definitions|concepts|examples|warnings|algorithms",
      "items": [
        {
          "term": "Term or Formula (concise)",
          "definition": "Clear explanation (1-3 sentences max)",
          "note": "Optional: exam tip or common mistake"
        }
      ]
    }
  ],
  "keyWarnings": ["Common mistake students make", "Another common mistake"],
  "quickRef": ["One-liner fact 1", "One-liner fact 2", "One-liner fact 3"]
}

RULES:
- Group related items into logical sections
- Formulas go in their own section with exact notation preserved
- Definitions should be precise, not verbose
- quickRef should be the most high-yield facts (5-8 items)
- keyWarnings should be exam-critical mistakes (3-5 items)
- If source material mentions exam tips, include them as notes
- accentColor: #7c6af7 (purple), #4ade80 (green), #fbbf24 (amber) — pick based on subject type`;

export async function POST(req: NextRequest) {
  try {
    const { topic, sourceText, density } = await req.json();

    if (!sourceText || sourceText.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide source material (at least a few paragraphs)" },
        { status: 400 },
      );
    }

    // Step 1: Gemini 2.5 Flash reads and extracts from source material
    const extractPrompt = `Topic: ${topic ?? "Infer from content"}
Density level: ${density ?? "high"}

SOURCE MATERIAL:
${sourceText.slice(0, 50000)}

Extract all key information from this source material now.`;

    const extracted = await callGemini(
      GEMINI_EXTRACT_SYSTEM,
      extractPrompt,
      "gemini-2.5-flash",
      0.2,
    );

    // Step 2: Claude structures the extracted content into cheatsheet JSON
    const structurePrompt = `Topic: ${topic ?? "Infer from content"}

EXTRACTED CONTENT FROM SOURCE MATERIAL:
${extracted}

Create the cheatsheet JSON now. Remember: only use what is in the extracted content above.`;

    const raw = await callClaude(CLAUDE_STRUCTURE_SYSTEM, structurePrompt, 0.2);
    const cleaned = raw
      .replace(/^```json\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const cheatData = JSON.parse(cleaned);

    return NextResponse.json({ cheatData, extracted });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
