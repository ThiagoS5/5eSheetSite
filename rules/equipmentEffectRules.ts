import type { BuilderEquipmentOption } from "@/src/types/builder";

export function deriveEquipmentSavingThrowBonus(
  selectedEquipment: readonly BuilderEquipmentOption[],
): number {
  return selectedEquipment.reduce(
    (total, item) => total + (item.savingThrowBonus ?? 0),
    0,
  );
}

export function deriveEquipmentResistances(
  selectedEquipment: readonly BuilderEquipmentOption[],
): string[] {
  return selectedEquipment.flatMap((item) => item.resistances ?? []);
}

export function combineDefenseLabels(...groups: string[][]): string[] {
  return [
    ...new Set(
      groups
        .flat()
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.charAt(0).toUpperCase() + value.slice(1)),
    ),
  ];
}
