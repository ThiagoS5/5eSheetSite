import type { BreakdownPart, BuilderEquipmentOption } from "@/src/types/builder";
import type {
  AttributeBonuses,
  AttributeKey,
  CharacterAttributes,
} from "@/src/types/dnd";

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

// 5e 2024: aumentos por ASI e half-feat não podem elevar um atributo acima de 20;
// apenas Epic Boons (nível 19+) permitem chegar a 30.
export const ABILITY_SCORE_CAP = 20;
export const EPIC_BOON_ABILITY_CAP = 30;

export function calculateFinalAttributes(
  baseAttributes: CharacterAttributes,
  bonuses: AttributeBonuses,
  capOverrides?: Partial<Record<AttributeKey, number>>,
): CharacterAttributes {
  return (Object.keys(baseAttributes) as AttributeKey[]).reduce<CharacterAttributes>(
    (attributes, key) => {
      const cap = capOverrides?.[key] ?? ABILITY_SCORE_CAP;
      const total = baseAttributes[key] + (bonuses[key] ?? 0);
      return {
        ...attributes,
        [key]: Math.min(total, Math.max(baseAttributes[key], cap)),
      };
    },
    { ...baseAttributes },
  );
}

export function calculateInitialHitPoints(
  hitDie: number,
  constitutionScore: number,
): number {
  return hitDie + getAbilityModifier(constitutionScore);
}


export function calculateMaxHitPoints(
  hitDie: number,
  constitutionScore: number,
  level: number,
): number {
  const effectiveLevel = Math.max(1, Math.floor(level));
  const conModifier = getAbilityModifier(constitutionScore);
  const firstLevel = hitDie + conModifier;
  const perAdditionalLevel = Math.floor(hitDie / 2) + 1 + conModifier;

  return firstLevel + (effectiveLevel - 1) * perAdditionalLevel;
}


export function getMaxHitPointsBreakdown(
  hitDie: number,
  constitutionScore: number,
  level: number,
): BreakdownPart[] {
  const effectiveLevel = Math.max(1, Math.floor(level));
  const conModifier = getAbilityModifier(constitutionScore);
  const perAdditionalLevel = Math.floor(hitDie / 2) + 1;

  const parts: BreakdownPart[] = [
    { label: `Level 1 (d${hitDie})`, value: hitDie },
  ];
  if (effectiveLevel > 1) {
    parts.push({
      label: `Levels 2-${effectiveLevel} (${effectiveLevel - 1} x ${perAdditionalLevel})`,
      value: (effectiveLevel - 1) * perAdditionalLevel,
    });
  }
  if (conModifier !== 0) {
    parts.push({
      label: `CON (${conModifier > 0 ? "+" : ""}${conModifier} x ${effectiveLevel})`,
      value: conModifier * effectiveLevel,
    });
  }
  return parts;
}

export function calculateArmorClass(
  dexterityScore: number,
  selectedEquipment: Array<Pick<BuilderEquipmentOption, "id" | "armorClass">>,
): number {
  const baseArmorClass = 10 + getAbilityModifier(dexterityScore);
  const equipmentArmorClass = selectedEquipment
    .map((equipment) => equipment.armorClass ?? 0)
    .reduce((highest, armorClass) => Math.max(highest, armorClass), 0);

  return Math.max(baseArmorClass, equipmentArmorClass);
}
