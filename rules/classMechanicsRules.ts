import type { BuilderClass, BuilderEquipmentOption } from "@/src/types/builder";
import type { AttributeKey } from "@/src/types/dnd";

/** Permanent 2024 class effects. Conditional activations remain play-state actions. */
export function deriveClassMovementAndDefense(input: {
  characterClass: BuilderClass | undefined;
  level: number;
  finalAttributes: Record<AttributeKey, number>;
  selectedEquipment: readonly BuilderEquipmentOption[];
}) {
  const { characterClass, level, finalAttributes, selectedEquipment } = input;
  const hasFeature = (name: string) => characterClass?.allFeatures.some(
    (feature) => feature.name === name && (feature.level ?? 1) <= level,
  );
  const hasArmorOrShield = selectedEquipment.some((item) => item.armorType);
  let speedBonusFeet = 0;
  let unarmoredDefense: { label: string; abilityScore: number; allowsShield: boolean } | undefined;

  if (characterClass?.id === "monk-xphb") {
    if (hasFeature("Unarmored Defense")) unarmoredDefense = {
      label: "Unarmored Defense (10 + DEX + WIS)",
      abilityScore: finalAttributes.sabedoria,
      allowsShield: false,
    };
    if (hasFeature("Unarmored Movement") && !hasArmorOrShield) {
      speedBonusFeet = 10 + Math.floor((level - 2) / 4) * 5;
    }
  }
  if (characterClass?.id === "barbarian-xphb") {
    if (hasFeature("Unarmored Defense")) unarmoredDefense = {
      label: "Unarmored Defense (10 + DEX + CON)",
      abilityScore: finalAttributes.constituicao,
      allowsShield: true,
    };
    if (hasFeature("Fast Movement") && !selectedEquipment.some((item) => item.armorType === "heavy")) {
      speedBonusFeet = 10;
    }
  }
  return { speedBonusFeet, unarmoredDefense };
}
