import type { CSSProperties } from "react";

/** Crimson accent override, scoped to the sheet root (mirrors the mock's
 *  cardThemeVars). Spread onto the root element's `style`; every descendant
 *  using var(--primary)/var(--brand-crimson-alt) recolors via the cascade. */
export const SHEET_THEME_VARS = {
  "--primary": "oklch(0.59 0.23 27)",
  "--brand-crimson-alt": "oklch(0.53 0.2 28)",
} as CSSProperties;

export type OriginSource = "class" | "species" | "background";

const ORIGIN_COLOR: Record<OriginSource, string> = {
  class: "var(--brand-gold-alt)",
  species: "var(--brand-green)",
  background: "var(--brand-blue)",
};

export function originColor(source: OriginSource): string {
  return ORIGIN_COLOR[source];
}

export function originColorVars(source: OriginSource): {
  color: string;
  colorSoft: string;
  colorBg: string;
} {
  const color = ORIGIN_COLOR[source];
  return {
    color,
    colorSoft: `color-mix(in oklab, ${color} 45%, transparent)`,
    colorBg: `color-mix(in oklab, ${color} 13%, transparent)`,
  };
}
