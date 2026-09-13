import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { ArmorClassBreakdownPart, ArmorType, Pendency } from "@/src/types/builder";

type ArmorClassEquipment = {
  id: string;
  name?: string;
  armorClass?: number;
  armorClassBonus?: number;
  armorType?: ArmorType;
  shieldBonus?: number;
};

export function deriveArmorClass(input: {
  dexterityScore: number;
  selectedEquipment: ArmorClassEquipment[];
  unarmoredDefense?: { label: string; abilityScore: number; allowsShield: boolean };
}): { armorClass: number; breakdown: ArmorClassBreakdownPart[] } {
  const dexterityModifier = getAbilityModifier(input.dexterityScore);
  const shields = input.selectedEquipment.filter(isShield);
  const shield = shields.reduce<ArmorClassEquipment | undefined>(
    (best, item) => !best || shieldValue(item) > shieldValue(best) ? item : best,
    undefined,
  );
  const defense = input.unarmoredDefense;
  const bodyArmor = chooseBestBodyArmor(
    input.selectedEquipment,
    dexterityModifier,
    defense && (defense.allowsShield || shields.length === 0) ? defense : undefined,
  );
  const shieldBonus = shield ? shieldValue(shield) : 0;
  const passiveBonus = input.selectedEquipment
    .filter((item) => !item.armorType && typeof item.armorClassBonus === "number")
    .reduce((total, item) => total + (item.armorClassBonus ?? 0), 0);

  const armorClass = bodyArmor.value + shieldBonus + passiveBonus;
  const breakdown = [
    bodyArmor.breakdown,
    ...(shield ? [{ label: shield.name ?? shield.id, value: shieldBonus }] : []),
    ...input.selectedEquipment
      .filter((item) => !item.armorType && typeof item.armorClassBonus === "number")
      .map((item) => ({
        label: item.name ?? item.id,
        value: item.armorClassBonus ?? 0,
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
  const pendencies: Pendency[] = [];
  if (bodyArmors.length > 1) pendencies.push({
    id: "equipment-armor-conflict",
    stepSlug: "equipamento",
    label: `Choose only one worn body armor: ${bodyArmors
      .map((item) => item.name ?? item.id)
      .join(", ")}.`,
    severity: "blocking",
  });
  if (selectedEquipment.filter(isShield).length > 1) pendencies.push({
    id: "equipment-shield-conflict",
    stepSlug: "equipamento",
    label: "Equip only one shield. Shield bonuses do not stack.",
    severity: "blocking",
  });
  return pendencies;
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
  defense?: { label: string; abilityScore: number },
): { value: number; breakdown: ArmorClassBreakdownPart } {
  const defenseBonus = defense ? getAbilityModifier(defense.abilityScore) : 0;
  const unarmored = {
    value: 10 + dexterityModifier + Math.max(0, defenseBonus),
    breakdown: {
      label: defense && defenseBonus > 0 ? defense.label : "Unarmored (10 + DEX)",
      value: 10 + dexterityModifier + Math.max(0, defenseBonus),
    },
  };

  const armors = selectedEquipment
    .filter((item) => !isShield(item) && item.armorClass !== undefined)
    .map((item) => ({
      value: bodyArmorValue(item, dexterityModifier),
      breakdown: {
        label: item.name ?? item.id,
        value: bodyArmorValue(item, dexterityModifier),
      },
    }));
  return armors.length ? armors.reduce(
      (best, candidate) => (candidate.value > best.value ? candidate : best),
      armors[0],
    ) : unarmored;
}

function bodyArmorValue(
  item: ArmorClassEquipment,
  dexterityModifier: number,
): number {
  const armorClass = item.armorClass ?? 0;
  const magicBonus = item.armorClassBonus ?? 0;
  if (item.armorType === "light") return armorClass + dexterityModifier + magicBonus;
  if (item.armorType === "medium") return armorClass + Math.min(dexterityModifier, 2) + magicBonus;
  return armorClass + magicBonus;
}

function isShield(item: ArmorClassEquipment): boolean {
  return item.armorType === "shield";
}

function shieldValue(item: ArmorClassEquipment): number {
  return (item.shieldBonus ?? item.armorClass ?? 0) + (item.armorClassBonus ?? 0);
}
