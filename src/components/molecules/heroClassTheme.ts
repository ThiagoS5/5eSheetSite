import {
  defaultHeroChoiceTheme,
  type HeroChoiceTheme,
} from "@/src/components/molecules/HeroChoiceCard";
import { getHitDieIconClass } from "@/src/components/atoms/FontAwesomeIcon";
import type { BuilderClass } from "@/types/builder";

/**
 * Temas por classe transcritos do character builder da D&D Beyond
 * (custom properties --theme-color / --accent-color de cada card).
 * Compartilhados entre o step de classe e o step de subclasse para que a
 * subclasse herde a identidade visual da classe-mãe.
 */
const heroClassThemes: Array<{ keyword: string; theme: HeroChoiceTheme }> = [
  { keyword: "artificer", theme: { theme: "#3B2A1E", accent: "#D59139" } },
  { keyword: "artifice", theme: { theme: "#3B2A1E", accent: "#D59139" } },
  { keyword: "barbar", theme: { theme: "#2E200F", accent: "#B56906" } },
  { keyword: "bard", theme: { theme: "#2C1A2C", accent: "#FF40FF" } },
  { keyword: "cleric", theme: { theme: "#7A661F", accent: "#FFE8B5" } },
  { keyword: "clerigo", theme: { theme: "#7A661F", accent: "#FFE8B5" } },
  { keyword: "druid", theme: { theme: "#4E5E16", accent: "#8AC249" } },
  { keyword: "fighter", theme: { theme: "#4A2B01", accent: "#A5865C" } },
  { keyword: "guerreiro", theme: { theme: "#4A2B01", accent: "#A5865C" } },
  { keyword: "monk", theme: { theme: "#3E8080", accent: "#48FDFF" } },
  { keyword: "monge", theme: { theme: "#3E8080", accent: "#48FDFF" } },
  { keyword: "paladin", theme: { theme: "#3D4C4C", accent: "#D6D6D6" } },
  { keyword: "ranger", theme: { theme: "#2B3D1A", accent: "#539100" } },
  { keyword: "patrulheiro", theme: { theme: "#2B3D1A", accent: "#539100" } },
  { keyword: "rogue", theme: { theme: "#041343", accent: "#1F6CBF" } },
  { keyword: "ladino", theme: { theme: "#041343", accent: "#1F6CBF" } },
  { keyword: "sorcerer", theme: { theme: "#6F5624", accent: "#F2AA21" } },
  { keyword: "feiticeiro", theme: { theme: "#6F5624", accent: "#F2AA21" } },
  { keyword: "warlock", theme: { theme: "#47110B", accent: "#F54E39" } },
  { keyword: "bruxo", theme: { theme: "#47110B", accent: "#F54E39" } },
  { keyword: "wizard", theme: { theme: "#2C0E4E", accent: "#BA7DFF" } },
  { keyword: "mago", theme: { theme: "#2C0E4E", accent: "#BA7DFF" } },
];

const classBannerIcons: Array<{ keyword: string; iconClassName: string }> = [
  { keyword: "artificer", iconClassName: "fa-solid fa-wrench" },
  { keyword: "artifice", iconClassName: "fa-solid fa-wrench" },
  { keyword: "barbar", iconClassName: "fa-solid fa-axe-battle" },
  { keyword: "bard", iconClassName: "fa-solid fa-music" },
  { keyword: "cleric", iconClassName: "fa-solid fa-sun" },
  { keyword: "clerigo", iconClassName: "fa-solid fa-sun" },
  { keyword: "druid", iconClassName: "fa-solid fa-leaf" },
  { keyword: "fighter", iconClassName: "fa-solid fa-swords" },
  { keyword: "guerreiro", iconClassName: "fa-solid fa-swords" },
  { keyword: "monk", iconClassName: "fa-solid fa-hand-fist" },
  { keyword: "monge", iconClassName: "fa-solid fa-hand-fist" },
  { keyword: "paladin", iconClassName: "fa-solid fa-shield-cross" },
  { keyword: "ranger", iconClassName: "fa-solid fa-bow-arrow" },
  { keyword: "patrulheiro", iconClassName: "fa-solid fa-bow-arrow" },
  { keyword: "rogue", iconClassName: "fa-solid fa-user-ninja" },
  { keyword: "ladino", iconClassName: "fa-solid fa-user-ninja" },
  { keyword: "sorcerer", iconClassName: "fa-solid fa-fire" },
  { keyword: "feiticeiro", iconClassName: "fa-solid fa-fire" },
  { keyword: "warlock", iconClassName: "fa-solid fa-eye" },
  { keyword: "bruxo", iconClassName: "fa-solid fa-eye" },
  { keyword: "wizard", iconClassName: "fa-solid fa-hat-wizard" },
  { keyword: "mago", iconClassName: "fa-solid fa-hat-wizard" },
];

function normalizeClassName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getHeroClassTheme(classEntry: BuilderClass): HeroChoiceTheme {
  const normalizedName = normalizeClassName(classEntry.name);
  const match = heroClassThemes.find((entry) =>
    normalizedName.includes(entry.keyword),
  );

  return match?.theme ?? defaultHeroChoiceTheme;
}

export function getClassBannerIconClass(classEntry: BuilderClass): string {
  const normalizedName = normalizeClassName(classEntry.name);
  const match = classBannerIcons.find((entry) =>
    normalizedName.includes(entry.keyword),
  );

  return match?.iconClassName ?? getHitDieIconClass(classEntry.hitDie);
}
