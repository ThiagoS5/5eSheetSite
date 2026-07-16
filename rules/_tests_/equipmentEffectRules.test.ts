import { describe, expect, it } from "vitest";
import {
  combineDefenseLabels,
  deriveEquipmentResistances,
  deriveEquipmentSavingThrowBonus,
} from "@/rules/equipmentEffectRules";
import type { BuilderEquipmentOption } from "@/src/types/builder";

function equipment(
  partial: Partial<BuilderEquipmentOption>,
): BuilderEquipmentOption {
  return {
    id: "item",
    name: "Item",
    source: "XDMG",
    sourceType: "manual",
    category: "Wondrous",
    type: "gear",
    ...partial,
  };
}

describe("equipment effect rules", () => {
  it("sums saving throw bonuses from equipped items", () => {
    expect(
      deriveEquipmentSavingThrowBonus([
        equipment({ savingThrowBonus: 1 }),
        equipment({ savingThrowBonus: 2 }),
        equipment({}),
      ]),
    ).toBe(3);
  });

  it("collects and normalizes equipment defense labels", () => {
    const resistances = deriveEquipmentResistances([
      equipment({ resistances: ["fire", "Cold"] }),
      equipment({ resistances: [" fire "] }),
    ]);

    expect(combineDefenseLabels(resistances)).toEqual(["Fire", "Cold"]);
  });
});
