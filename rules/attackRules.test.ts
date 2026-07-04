import { describe, expect, it } from "vitest";
import { deriveAttacks } from "@/rules/attackRules";
import type { CharacterAttributes } from "@/types/dnd";

const attributes: CharacterAttributes = {
  forca: 16,
  destreza: 14,
  constituicao: 12,
  inteligencia: 10,
  sabedoria: 8,
  carisma: 13,
};

describe("attack rules", () => {
  it("derives melee weapon attacks from Strength and proficiency", () => {
    const attacks = deriveAttacks({
      finalAttributes: attributes,
      proficiencyBonus: 2,
      weaponProficiencies: ["martial"],
      weapons: [
        {
          id: "longsword-xphb",
          name: "Longsword",
          source: "XPHB",
          category: "Weapon",
          weaponCategory: "martial",
          weaponRangeType: "melee",
          damageDice: "1d8",
          damageType: "S",
          weaponProperties: ["V"],
        },
      ],
    });

    expect(attacks).toContainEqual({
      name: "Longsword",
      attackBonus: "+5",
      damage: "1d8+3 Slashing",
      notes: "STR, proficient, Versatile",
      abilityKey: "forca",
      isProficient: true,
      damageBreakdown: [
        { label: "Weapon die", value: "1d8" },
        { label: "STR", value: "+3" },
      ],
    });
  });

  it("uses Dexterity for ranged weapons and finesse weapons when it is better", () => {
    const attacks = deriveAttacks({
      finalAttributes: { ...attributes, forca: 10, destreza: 18 },
      proficiencyBonus: 2,
      weaponProficiencies: ["simple", "martial"],
      weapons: [
        {
          id: "longbow-xphb",
          name: "Longbow",
          source: "XPHB",
          category: "Weapon",
          weaponCategory: "martial",
          weaponRangeType: "ranged",
          damageDice: "1d8",
          damageType: "P",
          weaponProperties: ["A", "H", "2H"],
        },
        {
          id: "dagger-xphb",
          name: "Dagger",
          source: "XPHB",
          category: "Weapon",
          weaponCategory: "simple",
          weaponRangeType: "melee",
          damageDice: "1d4",
          damageType: "P",
          weaponProperties: ["F", "L", "T"],
        },
      ],
    });

    expect(attacks.find((attack) => attack.name === "Longbow")).toMatchObject({
      attackBonus: "+6",
      damage: "1d8+4 Piercing",
      abilityKey: "destreza",
    });
    expect(attacks.find((attack) => attack.name === "Dagger")).toMatchObject({
      attackBonus: "+6",
      damage: "1d4+4 Piercing",
      abilityKey: "destreza",
    });
  });
});
