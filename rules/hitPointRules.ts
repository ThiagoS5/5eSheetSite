import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { HpRollChoice } from "@/src/types/characterBuild";
import type { BreakdownPart, BuilderSpecies } from "@/src/types/builder";
import type { AppliedFeatEffects } from "@/src/adapters/featCatalog";

export function deriveHitPointBonuses(species: BuilderSpecies | undefined, level: number, featEffects: AppliedFeatEffects): BreakdownPart[] {
  const bonuses: BreakdownPart[] = [];
  if (species?.id === "dwarf-xphb" && species.traits.some((trait) => trait.name === "Dwarven Toughness")) {
    bonuses.push({ label: `Dwarven Toughness (+1 × ${level})`, value: level });
  }
  if (featEffects.hitPointsPerLevel) bonuses.push({
    label: `Tough (+${featEffects.hitPointsPerLevel} × ${level})`,
    value: featEffects.hitPointsPerLevel * level,
  });
  if (featEffects.hitPointBonus) bonuses.push({ label: "Boon of Fortitude", value: featEffects.hitPointBonus });
  return bonuses;
}

export interface HitPointsInput {
  hitDie: number;
  constitutionScore: number;
  level: number;
  hpRollByLevel: Record<string, HpRollChoice>;
  bonuses?: BreakdownPart[];
}

function perLevelGain(input: HitPointsInput, level: number): number {
  const average = Math.floor(input.hitDie / 2) + 1;
  const roll = input.hpRollByLevel[String(level)];
  if (typeof roll === "number" && Number.isFinite(roll)) {
    return Math.min(Math.max(Math.floor(roll), 1), input.hitDie);
  }
  return average;
}

export function calculateMaxHitPointsWithRolls(input: HitPointsInput): number {
  const effectiveLevel = Math.max(1, Math.floor(input.level));
  const conModifier = getAbilityModifier(input.constitutionScore);
  let total = Math.max(1, input.hitDie + conModifier);
  for (let level = 2; level <= effectiveLevel; level += 1) {
    total += Math.max(1, perLevelGain(input, level) + conModifier);
  }
  return total + (input.bonuses ?? []).reduce((sum, part) => sum + part.value, 0);
}

export function getHitPointsBreakdown(input: HitPointsInput): BreakdownPart[] {
  const effectiveLevel = Math.max(1, Math.floor(input.level));
  const conModifier = getAbilityModifier(input.constitutionScore);
  const parts: BreakdownPart[] = [
    { label: `Level 1 (d${input.hitDie})`, value: input.hitDie },
  ];
  let averageSum = 0;
  let averageCount = 0;
  let rolledSum = 0;
  let rolledCount = 0;
  for (let level = 2; level <= effectiveLevel; level += 1) {
    const roll = input.hpRollByLevel[String(level)];
    const gain = perLevelGain(input, level);
    if (typeof roll === "number" && Number.isFinite(roll)) {
      rolledSum += gain;
      rolledCount += 1;
    } else {
      averageSum += gain;
      averageCount += 1;
    }
  }
  if (averageCount > 0) {
    parts.push({ label: `Average (${averageCount} levels)`, value: averageSum });
  }
  if (rolledCount > 0) {
    parts.push({ label: `Rolled (${rolledCount} levels)`, value: rolledSum });
  }
  if (conModifier !== 0) {
    parts.push({
      label: `CON (${conModifier > 0 ? "+" : ""}${conModifier} x ${effectiveLevel})`,
      value: conModifier * effectiveLevel,
    });
  }
  const rawTotal = parts.reduce((sum, part) => sum + part.value, 0);
  const minimumAdjustment = calculateMaxHitPointsWithRolls({ ...input, bonuses: [] }) - rawTotal;
  if (minimumAdjustment > 0) parts.push({ label: "Minimum 1 HP per level", value: minimumAdjustment });
  return [...parts, ...(input.bonuses ?? [])];
}

export function rollHitDie(hitDie: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * hitDie) + 1;
}
