import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { HpRollChoice } from "@/src/types/characterBuild";
import type { BreakdownPart } from "@/types/builder";

export interface HitPointsInput {
  hitDie: number;
  constitutionScore: number;
  level: number;
  hpRollByLevel: Record<string, HpRollChoice>;
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
  let total = input.hitDie + conModifier;
  for (let level = 2; level <= effectiveLevel; level += 1) {
    total += perLevelGain(input, level) + conModifier;
  }
  return total;
}

export function getHitPointsBreakdown(input: HitPointsInput): BreakdownPart[] {
  const effectiveLevel = Math.max(1, Math.floor(input.level));
  const conModifier = getAbilityModifier(input.constitutionScore);
  const parts: BreakdownPart[] = [
    { label: `Nivel 1 (d${input.hitDie})`, value: input.hitDie },
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
    parts.push({ label: `Media (${averageCount} niveis)`, value: averageSum });
  }
  if (rolledCount > 0) {
    parts.push({ label: `Rolados (${rolledCount} niveis)`, value: rolledSum });
  }
  if (conModifier !== 0) {
    parts.push({
      label: `CON (${conModifier > 0 ? "+" : ""}${conModifier} x ${effectiveLevel})`,
      value: conModifier * effectiveLevel,
    });
  }
  return parts;
}

export function rollHitDie(hitDie: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * hitDie) + 1;
}
