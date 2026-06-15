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
