import { NextRequest, NextResponse } from "next/server";
import { renderDeck, buildTheme, DeckConfig } from "@/lib/slideTemplates";
import type { ThemeInput } from "@/lib/themeTypes";

export async function POST(req: NextRequest) {
  try {
    const { deck, theme }: { deck: DeckConfig; theme: ThemeInput } = await req.json();
    if (!deck || !theme)
      return NextResponse.json({ error: "deck and theme required" }, { status: 400 });
    const hexRe = /^#[0-9a-fA-F]{6}$/;
    if (!hexRe.test(theme.bg) || !hexRe.test(theme.accent))
      return NextResponse.json({ error: "Invalid hex color" }, { status: 400 });
    deck.theme = buildTheme(theme);
    return NextResponse.json({ html: renderDeck(deck) });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
