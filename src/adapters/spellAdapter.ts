import { formatTaggedTextAsPlain, toSlug } from "@/src/adapters/fiveEToolsAdapter";
import type { BuilderSpell, SpellSchool } from "@/types/spells";

export interface RawSpell {
  name: string;
  source: string;
  level?: number;
  school?: string;
  time?: Array<{ number?: number; unit?: string }>;
  range?: {
    type?: string;
    distance?: { type?: string; amount?: number };
  };
  duration?: Array<{
    type?: string;
    concentration?: boolean;
    duration?: { type?: string; amount?: number };
  }>;
  components?: {
    v?: boolean;
    s?: boolean;
    m?: boolean | string | { text?: string };
  };
  entries?: unknown[];
  entriesHigherLevel?: unknown[];
}

const SCHOOL_NAMES: Record<string, SpellSchool> = {
  A: "Abjuration",
  C: "Conjuration",
  D: "Divination",
  E: "Enchantment",
  V: "Evocation",
  I: "Illusion",
  N: "Necromancy",
  T: "Transmutation",
};

export function normalizeSpell(
  raw: RawSpell,
  classNames: string[],
): BuilderSpell {
  return {
    id: toSlug(raw.name, raw.source),
    name: raw.name,
    source: raw.source,
    level: raw.level ?? 0,
    school: SCHOOL_NAMES[raw.school ?? ""] ?? "Unknown",
    schoolCode: raw.school ?? "",
    classNames,
    castingTime: formatCastingTime(raw.time),
    range: formatRange(raw.range),
    duration: formatDuration(raw.duration),
    components: formatComponents(raw.components),
    description: formatSpellEntries(raw.entries),
  };
}

export function formatSpellEntries(entries: unknown[] | undefined): string {
  return (entries ?? [])
    .map(stringifyEntry)
    .map(formatTaggedTextAsPlain)
    .filter(Boolean)
    .join("\n\n");
}

function stringifyEntry(entry: unknown): string {
  if (typeof entry === "string") return entry;
  if (!entry || typeof entry !== "object") return "";
  const record = entry as Record<string, unknown>;
  if (typeof record.entry === "string") return record.entry;
  if (Array.isArray(record.entries)) {
    return record.entries.map(stringifyEntry).filter(Boolean).join(" ");
  }
  if (Array.isArray(record.items)) {
    return record.items.map(stringifyEntry).filter(Boolean).join(" ");
  }
  return "";
}

function formatCastingTime(time: RawSpell["time"]): string {
  const first = time?.[0];
  if (!first) return "Special";
  const amount = first.number ?? 1;
  return `${amount} ${first.unit ?? "action"}${amount === 1 ? "" : "s"}`;
}

function formatRange(range: RawSpell["range"]): string {
  const distance = range?.distance;
  if (!distance) return "Self";
  if (typeof distance.amount === "number") {
    return `${distance.amount} ${distance.type ?? "feet"}`;
  }
  return distance.type ?? range?.type ?? "Self";
}

function formatDuration(duration: RawSpell["duration"]): string {
  const first = duration?.[0];
  if (!first) return "Instantaneous";
  const prefix = first.concentration ? "Concentration, up to " : "";
  if (first.duration?.amount) {
    return `${prefix}${first.duration.amount} ${first.duration.type ?? ""}`.trim();
  }
  if (first.type === "instant") return "Instantaneous";
  return first.type ?? "Special";
}

function formatComponents(components: RawSpell["components"]): string {
  const labels = [
    components?.v ? "V" : "",
    components?.s ? "S" : "",
    components?.m ? "M" : "",
  ].filter(Boolean);

  return labels.join(", ");
}
