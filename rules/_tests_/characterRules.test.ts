import { describe, expect, it } from "vitest";
import {
  calculateArmorClass,
  calculateFinalAttributes,
  calculateInitialHitPoints,
  getAbilityModifier,
  getProficiencyBonus,
} from "@/rules/characterRules";

describe("character rules", () => {
  it("calculates core 5e modifiers and level 1 proficiency", () => {
    expect(getAbilityModifier(8)).toBe(-1);
    expect(getAbilityModifier(15)).toBe(2);
    expect(getProficiencyBonus(1)).toBe(2);
  });

  it("applies 2024 background bonuses to final attributes", () => {
    expect(
      calculateFinalAttributes(
        {
          forca: 8,
          destreza: 14,
          constituicao: 13,
          inteligencia: 15,
          sabedoria: 12,
          carisma: 10,
        },
        {
          inteligencia: 2,
          sabedoria: 1,
        },
      ),
    ).toStrictEqual({
      forca: 8,
      destreza: 14,
      constituicao: 13,
      inteligencia: 17,
      sabedoria: 13,
      carisma: 10,
    });
  });

  it("calculates level 1 hit points and armor class from selected equipment", () => {
    expect(calculateInitialHitPoints(10, 14)).toBe(12);
    expect(calculateArmorClass(14, [{ id: "chain-mail-xphb", armorClass: 16 }])).toBe(16);
    expect(calculateArmorClass(14, [])).toBe(12);
  });
});
