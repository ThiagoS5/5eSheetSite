import type {
  BuilderFeat,
  FeatAbilityBonus,
  FeatCategory,
  FeatPrerequisite,
} from "@/types/builder";
import { ATTRIBUTE_ABBREVIATION_MAP, type AttributeKey } from "@/types/dnd";
import { stringifyEntries, toSlug } from "@/src/adapters/fiveEToolsAdapter";

const CATEGORY_MAP: Record<string, FeatCategory> = {
  O: "origin",
  G: "general",
  FS: "fighting-style",
  "FS:P": "fighting-style",
  "FS:R": "fighting-style",
  EB: "epic-boon",
};

interface RawFeat {
  name: string;
  source: string;
  category?: string;
  prerequisite?: unknown[];
  ability?: unknown[];
  repeatable?: boolean;
  entries?: unknown[];
}

function mapPrerequisites(raw: unknown[] | undefined): FeatPrerequisite[] {
  return (raw ?? []).map((entry) => {
    const record = entry as {
      level?: number | { level?: number };
      ability?: Array<Record<string, number>>;
      feat?: string[];
    };
    const level =
      typeof record.level === "object" ? record.level?.level : record.level;
    const abilities: Partial<Record<AttributeKey, number>> = {};
    for (const abilityObj of record.ability ?? []) {
      for (const [abbr, value] of Object.entries(abilityObj)) {
        const key = ATTRIBUTE_ABBREVIATION_MAP[abbr];
        if (key) abilities[key] = value;
      }
    }
    const prereq: FeatPrerequisite = {};
    if (typeof level === "number") prereq.level = level;
    if (Object.keys(abilities).length > 0) prereq.abilities = abilities;
    if (record.feat?.length) {
      prereq.feat = record.feat.map((f) => f.split("|")[0].toLowerCase());
    }
    return prereq;
  });
}

function mapAbilityBonus(raw: unknown[] | undefined): FeatAbilityBonus | undefined {
  const first = (raw ?? [])[0] as
    | { choose?: { from?: string[]; amount?: number }; [k: string]: unknown }
    | undefined;
  if (!first) return undefined;

  if (first.choose?.from) {
    const from = first.choose.from
      .map((abbr) => ATTRIBUTE_ABBREVIATION_MAP[abbr])
      .filter((key): key is AttributeKey => Boolean(key));
    return { choose: { from, amount: first.choose.amount ?? 1 } };
  }

  const fixed: Partial<Record<AttributeKey, number>> = {};
  for (const [abbr, value] of Object.entries(first)) {
    const key = ATTRIBUTE_ABBREVIATION_MAP[abbr];
    if (key && typeof value === "number") fixed[key] = value;
  }
  return Object.keys(fixed).length > 0 ? { fixed } : undefined;
}

export function normalizeFeats(rawFeats: RawFeat[]): BuilderFeat[] {
  return rawFeats.map((feat) => ({
    id: toSlug(feat.name, feat.source),
    name: feat.name,
    source: feat.source,
    category: CATEGORY_MAP[feat.category ?? "G"] ?? "general",
    prerequisites: mapPrerequisites(feat.prerequisite),
    abilityBonus: mapAbilityBonus(feat.ability),
    repeatable: feat.repeatable === true,
    description: stringifyEntries(feat.entries),
  }));
}
