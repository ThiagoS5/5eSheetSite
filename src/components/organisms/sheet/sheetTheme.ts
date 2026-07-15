import type { CSSProperties } from "react";


export const SHEET_THEME_VARS = {
  "--primary": "oklch(0.59 0.23 27)",
  "--brand-crimson-alt": "oklch(0.53 0.2 28)",
} as CSSProperties;

export type OriginSource = "class" | "species" | "background" | "feat";

const ORIGIN_COLOR: Record<OriginSource, string> = {
  class: "var(--brand-gold-alt)",
  species: "var(--brand-green)",
  background: "var(--brand-blue)",
  feat: "var(--brand-crimson-alt)",
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
