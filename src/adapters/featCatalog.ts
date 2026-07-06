import type {
  BuilderFeat,
  FeatChoiceRequirement,
  FeatAbilityBonus,
  FeatCategory,
  FeatPrerequisite,
  FeatStructuredEffects,
} from "@/types/builder";
import { ATTRIBUTE_ABBREVIATION_MAP, type AttributeKey } from "@/types/dnd";
import { stringifyEntries, toSlug } from "@/src/adapters/fiveEToolsAdapter";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";

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
  skillProficiencies?: unknown[];
  toolProficiencies?: unknown[];
  languageProficiencies?: unknown[];
  skillToolLanguageProficiencies?: unknown[];
  repeatable?: boolean;
  entries?: unknown[];
}

export interface AppliedFeatEffects {
  abilityBonuses: Partial<Record<AttributeKey, number>>;
  initiativeBonus: number;
  speedBonusFeet: number;
  skillProficiencies: string[];
  toolProficiencies: string[];
  languageProficiencies: string[];
}

const CURATED_EFFECTS: Record<string, FeatStructuredEffects> = {
  "alert-xphb": { initiativeBonus: 5 },
  "speedy-xphb": { speedBonusFeet: 10 },
};

export const ASI_FEAT_ID = "ability-score-improvement-xphb";

const CANONICAL_SKILL_NAMES = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

const ABILITY_LABEL: Record<AttributeKey, string> = {
  forca: "forca",
  destreza: "destreza",
  constituicao: "constituicao",
  inteligencia: "inteligencia",
  sabedoria: "sabedoria",
  carisma: "carisma",
};

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
      prereq.feat = record.feat.map((f) => {
        const [featName, featSource] = f.split("|");
        return toSlug(featName, featSource ?? "xphb");
      });
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

function normalizeSkillName(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  return CANONICAL_SKILL_NAMES.find((skill) => skill.toLowerCase() === normalized);
}

function normalizeChoiceEntries(
  choose: unknown,
): Array<{ from?: string[]; count?: number }> {
  if (Array.isArray(choose)) {
    return choose.filter((entry): entry is { from?: string[]; count?: number } =>
      typeof entry === "object" && entry !== null,
    );
  }
  if (typeof choose === "object" && choose !== null) {
    return [choose as { from?: string[]; count?: number }];
  }
  return [];
}

function mapSkillProficiencyEffects(raw: RawFeat): {
  fixed: string[];
  requirements: FeatChoiceRequirement[];
} {
  const fixed: string[] = [];
  const requirements: FeatChoiceRequirement[] = [];

  for (const entry of raw.skillProficiencies ?? []) {
    const record = entry as {
      any?: number;
      choose?: unknown;
      [key: string]: unknown;
    };

    if (typeof record.any === "number" && record.any > 0) {
      requirements.push({
        kind: "skill",
        count: record.any,
        options: CANONICAL_SKILL_NAMES,
      });
    }

    for (const choice of normalizeChoiceEntries(record.choose)) {
      const options =
        choice.from
          ?.map((option) => normalizeSkillName(option))
          .filter((option): option is string => Boolean(option)) ?? CANONICAL_SKILL_NAMES;
      requirements.push({
        kind: "skill",
        count: choice.count ?? 1,
        options: options.length > 0 ? options : CANONICAL_SKILL_NAMES,
      });
    }

    for (const [key, value] of Object.entries(record)) {
      if (key === "any" || key === "choose") continue;
      const skill = normalizeSkillName(key);
      if (skill && value) fixed.push(skill);
    }
  }

  return { fixed, requirements };
}

function mapChoiceRequirements(raw: RawFeat): FeatChoiceRequirement[] {
  const requirements: FeatChoiceRequirement[] = [];
  const abilityBonus = mapAbilityBonus(raw.ability);
  if (abilityBonus?.choose) {
    requirements.push({
      kind: "ability",
      count: 1,
      options: abilityBonus.choose.from,
    });
  }
  requirements.push(...mapSkillProficiencyEffects(raw).requirements);

  for (const entry of raw.skillToolLanguageProficiencies ?? []) {
    const record = entry as { choose?: Array<{ from?: string[]; count?: number }> };
    for (const choice of record.choose ?? []) {
      if (!choice.from?.length || !choice.count) continue;
      if (choice.from.includes("anySkill") && choice.from.includes("anyTool")) {
        requirements.push({
          kind: "skill",
          count: choice.count,
          options: CANONICAL_SKILL_NAMES,
        });
      }
    }
  }

  return requirements;
}

function mapStructuredEffects(raw: RawFeat, id: string): FeatStructuredEffects | undefined {
  const abilityBonus = mapAbilityBonus(raw.ability);
  const choiceRequirements = mapChoiceRequirements(raw);
  const skillEffects = mapSkillProficiencyEffects(raw);
  const effects: FeatStructuredEffects = {
    ...CURATED_EFFECTS[id],
  };

  if (abilityBonus?.fixed) {
    effects.abilityBonuses = { ...abilityBonus.fixed };
  }
  if (skillEffects.fixed.length > 0) {
    effects.skillProficiencies = skillEffects.fixed;
  }
  if (choiceRequirements.length > 0) {
    effects.choiceRequirements = choiceRequirements;
  }

  return Object.keys(effects).length > 0 ? effects : undefined;
}

export function normalizeFeats(rawFeats: RawFeat[]): BuilderFeat[] {
  return rawFeats.map((feat) => {
    const id = toSlug(feat.name, feat.source);
    return {
      id,
      name: feat.name,
      source: feat.source,
      category: CATEGORY_MAP[feat.category ?? "G"] ?? "general",
      prerequisites: mapPrerequisites(feat.prerequisite),
      abilityBonus: mapAbilityBonus(feat.ability),
      effects: mapStructuredEffects(feat, id),
      repeatable: feat.repeatable === true,
      description: stringifyEntries(feat.entries),
    };
  });
}

export interface FeatPrerequisiteContext {
  level: number;
  finalAttributes: Record<AttributeKey, number>;
  chosenFeatIds: string[];
}

export function meetsPrerequisite(
  feat: BuilderFeat,
  ctx: FeatPrerequisiteContext,
): boolean {
  if (feat.prerequisites.length === 0) return true;


  return feat.prerequisites.some((entry) => {
    if (entry.level !== undefined && ctx.level < entry.level) return false;
    if (entry.abilities) {
      for (const [key, threshold] of Object.entries(entry.abilities)) {
        if (ctx.finalAttributes[key as AttributeKey] < (threshold ?? 0)) {
          return false;
        }
      }
    }
    if (entry.feat) {
      const owned = new Set(ctx.chosenFeatIds);
      if (!entry.feat.every((featId) => owned.has(featId))) {
        return false;
      }
    }
    return true;
  });
}

export interface FeatPrerequisiteStatus {
  met: boolean;
  reason?: string;
}

function prerequisiteEntryFailures(
  entry: FeatPrerequisite,
  ctx: FeatPrerequisiteContext,
): string[] {
  const failures: string[] = [];
  if (entry.level !== undefined && ctx.level < entry.level) {
    failures.push(`nivel ${entry.level}`);
  }
  if (entry.abilities) {
    for (const [key, threshold] of Object.entries(entry.abilities)) {
      if (ctx.finalAttributes[key as AttributeKey] < (threshold ?? 0)) {
        failures.push(`${ABILITY_LABEL[key as AttributeKey]} ${threshold}`);
      }
    }
  }
  if (entry.feat) {
    const owned = new Set(ctx.chosenFeatIds);
    const missing = entry.feat.filter((featId) => !owned.has(featId));
    if (missing.length > 0) {
      failures.push(`talento ${missing.join(", ")}`);
    }
  }
  return failures;
}

export function getFeatPrerequisiteStatus(
  feat: BuilderFeat,
  ctx: FeatPrerequisiteContext,
): FeatPrerequisiteStatus {
  if (feat.category === "epic-boon" && ctx.level < 19) {
    return { met: false, reason: "Requer nivel 19." };
  }
  if (feat.prerequisites.length === 0) return { met: true };

  const failures = feat.prerequisites.map((entry) => prerequisiteEntryFailures(entry, ctx));
  if (failures.some((entryFailures) => entryFailures.length === 0)) {
    return { met: true };
  }

  return {
    met: false,
    reason: `Requer ${failures.map((entryFailures) => entryFailures.join(" e ")).join(" ou ")}.`,
  };
}

export function getSelectableFeats(
  category: FeatCategory,
  feats: BuilderFeat[],
  ctx: FeatPrerequisiteContext,
): BuilderFeat[] {
  const chosen = new Set(ctx.chosenFeatIds);
  return feats.filter(
    (feat) =>
      feat.id !== ASI_FEAT_ID &&
      feat.category === category &&
      getFeatPrerequisiteStatus(feat, ctx).met &&
      (feat.repeatable || !chosen.has(feat.id)),
  );
}

function addBonuses(
  target: Partial<Record<AttributeKey, number>>,
  source: Partial<Record<AttributeKey, number>> | undefined,
): void {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "number") {
      target[key as AttributeKey] = (target[key as AttributeKey] ?? 0) + value;
    }
  }
}

function mergeEffects(target: AppliedFeatEffects, source: FeatStructuredEffects | undefined): void {
  addBonuses(target.abilityBonuses, source?.abilityBonuses);
  target.initiativeBonus += source?.initiativeBonus ?? 0;
  target.speedBonusFeet += source?.speedBonusFeet ?? 0;
  target.skillProficiencies.push(...(source?.skillProficiencies ?? []));
  target.toolProficiencies.push(...(source?.toolProficiencies ?? []));
  target.languageProficiencies.push(...(source?.languageProficiencies ?? []));
}

export function applyFeatEffects(
  current: AppliedFeatEffects | undefined,
  feat: BuilderFeat,
  choice?: AsiOrFeatChoice,
): AppliedFeatEffects {
  const result: AppliedFeatEffects = {
    abilityBonuses: { ...(current?.abilityBonuses ?? {}) },
    initiativeBonus: current?.initiativeBonus ?? 0,
    speedBonusFeet: current?.speedBonusFeet ?? 0,
    skillProficiencies: [...(current?.skillProficiencies ?? [])],
    toolProficiencies: [...(current?.toolProficiencies ?? [])],
    languageProficiencies: [...(current?.languageProficiencies ?? [])],
  };

  mergeEffects(result, feat.effects);
  if (choice?.mode === "feat") {
    addBonuses(result.abilityBonuses, choice.asi);
    result.skillProficiencies.push(...(choice.skillProficiencies ?? []));
    result.toolProficiencies.push(...(choice.toolProficiencies ?? []));
    result.languageProficiencies.push(...(choice.languageProficiencies ?? []));
  }

  return result;
}
