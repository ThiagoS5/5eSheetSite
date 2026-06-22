import type { BuilderEquipmentOption } from "@/types/builder";
import type {
  AttributeBonuses,
  AttributeKey,
  CharacterAttributes,
} from "@/types/dnd";

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function calculateFinalAttributes(
  baseAttributes: CharacterAttributes,
  bonuses: AttributeBonuses,
): CharacterAttributes {
  return (Object.keys(baseAttributes) as AttributeKey[]).reduce<CharacterAttributes>(
    (attributes, key) => ({
      ...attributes,
      [key]: baseAttributes[key] + (bonuses[key] ?? 0),
    }),
    { ...baseAttributes },
  );
}

export function calculateInitialHitPoints(
  hitDie: number,
  constitutionScore: number,
): number {
  return hitDie + getAbilityModifier(constitutionScore);
}

/**
 * Pontos de vida máximos usando a regra fixa (média) do 5e 2024:
 * nível 1 recebe o valor cheio do dado; cada nível seguinte soma a média
 * arredondada para cima (`floor(hitDie / 2) + 1`). O modificador de
 * Constituição é somado em todos os níveis.
 */
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
