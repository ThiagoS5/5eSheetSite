import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { ArmorClassBreakdownPart, ArmorType, Pendency } from "@/types/builder";

type ArmorClassEquipment = {
  id: string;
  name?: string;
  armorClass?: number;
  armorType?: ArmorType;
  shieldBonus?: number;
};

export function deriveArmorClass(input: {
  dexterityScore: number;
  selectedEquipment: ArmorClassEquipment[];
}): { armorClass: number; breakdown: ArmorClassBreakdownPart[] } {
  const dexterityModifier = getAbilityModifier(input.dexterityScore);
  const bodyArmor = chooseBestBodyArmor(input.selectedEquipment, dexterityModifier);
  const shieldBonus = input.selectedEquipment
    .filter((item) => isShield(item))
    .reduce((total, item) => total + shieldValue(item), 0);

  const armorClass = bodyArmor.value + shieldBonus;
  const breakdown = [
    bodyArmor.breakdown,
    ...input.selectedEquipment
      .filter((item) => isShield(item) && (item.armorClass ?? 0) > 0)
      .map((item) => ({
        label: item.name ?? item.id,
        value: shieldValue(item),
      })),
  ];

  return { armorClass, breakdown };
}

export function deriveArmorEquipmentPendencies(
  selectedEquipment: ArmorClassEquipment[],
): Pendency[] {
  const bodyArmors = selectedEquipment.filter(
    (item) => !isShield(item) && item.armorClass !== undefined,
  );
  if (bodyArmors.length <= 1) {
    return [];
  }

  return [{
    id: "equipment-armor-conflict",
    stepSlug: "equipamento",
    label: `Choose only one worn body armor: ${bodyArmors
      .map((item) => item.name ?? item.id)
      .join(", ")}.`,
    severity: "blocking",
  }];
}

export function calculateArmorClass(
  dexterityScore: number,
  selectedEquipment: ArmorClassEquipment[],
): number {
  return deriveArmorClass({ dexterityScore, selectedEquipment }).armorClass;
}

function chooseBestBodyArmor(
  selectedEquipment: ArmorClassEquipment[],
  dexterityModifier: number,
): { value: number; breakdown: ArmorClassBreakdownPart } {
  const unarmored = {
    value: 10 + dexterityModifier,
    breakdown: { label: "Base sem armadura", value: 10 + dexterityModifier },
  };

  return selectedEquipment
    .filter((item) => !isShield(item) && item.armorClass !== undefined)
    .map((item) => ({
      value: bodyArmorValue(item, dexterityModifier),
      breakdown: {
        label: item.name ?? item.id,
        value: bodyArmorValue(item, dexterityModifier),
      },
    }))
    .reduce(
      (best, candidate) => (candidate.value > best.value ? candidate : best),
      unarmored,
    );
}

function bodyArmorValue(
  item: ArmorClassEquipment,
  dexterityModifier: number,
): number {
  const armorClass = item.armorClass ?? 0;
  if (item.armorType === "light") return armorClass + dexterityModifier;
  if (item.armorType === "medium") return armorClass + Math.min(dexterityModifier, 2);
  return armorClass;
}

function isShield(item: ArmorClassEquipment): boolean {
  return item.armorType === "shield";
}

function shieldValue(item: ArmorClassEquipment): number {
  return item.shieldBonus ?? item.armorClass ?? 0;
}
