import { describe, expect, it } from "vitest";
import { calculateArmorClass, deriveArmorClass } from "@/rules/armorClassRules";

describe("armor class rules", () => {
  it("uses unarmored AC when no armor is equipped", () => {
    expect(deriveArmorClass({ dexterityScore: 14, selectedEquipment: [] })).toStrictEqual({
      armorClass: 12,
      breakdown: [{ label: "Base sem armadura", value: 12 }],
    });
  });

  it("adds a shield bonus on top of the selected body armor", () => {
    const result = deriveArmorClass({
      dexterityScore: 14,
      selectedEquipment: [
        { id: "chain-mail-xphb", name: "Chain Mail", armorClass: 16, armorType: "heavy" },
        { id: "shield-xphb", name: "Shield", armorClass: 2, armorType: "shield" },
      ],
    });

    expect(result.armorClass).toBe(18);
    expect(result.breakdown).toStrictEqual([
      { label: "Chain Mail", value: 16 },
      { label: "Shield", value: 2 },
    ]);
  });

  it("caps Dexterity bonus for medium armor", () => {
    expect(
      deriveArmorClass({
        dexterityScore: 18,
        selectedEquipment: [
          { id: "half-plate-xphb", name: "Half Plate Armor", armorClass: 15, armorType: "medium" },
        ],
      }).armorClass,
    ).toBe(17);
  });

  it("keeps the legacy calculateArmorClass API as a value-only wrapper", () => {
    expect(
      calculateArmorClass(14, [
        { id: "chain-mail-xphb", armorClass: 16, armorType: "heavy" },
        { id: "shield-xphb", armorClass: 2, armorType: "shield" },
      ]),
    ).toBe(18);
  });
});
