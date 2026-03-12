export type FontPairing = "modern" | "editorial" | "tech" | "sharp" | "classic";
export type LayoutVibe = "minimal" | "editorial" | "bold";

export interface ThemeInput {
  bg: string;       // hex e.g. "#0d0d14"
  accent: string;   // hex e.g. "#7c6af7"
  fontPairing: FontPairing;
  vibe: LayoutVibe;
}

export interface ThemeConfig extends ThemeInput {
  bg2: string;        // card/panel bg (derived)
  bg3: string;        // elevated bg (derived)
  text: string;       // primary text (auto from bg luminance)
  textMuted: string;  // muted text (rgba)
  border: string;     // border colour (rgba)
  accentText: string; // text on top of accent colour (auto)
}

export interface SuggestedPalette {
  name: string;
  bg: string;    // #rrggbb hex
  accent: string;// #rrggbb hex
}
