import { describe, expect, it } from "vitest";
import { getBuilderClasses } from "@/src/services/ruleService";
import {
  deriveSpellcastingSummary,
  getHighestSpellLevelAvailable,
  isSpellcastingSelectionComplete,
} from "@/rules/spellcastingRules";

const wizard = () => {
  const entry = getBuilderClasses().find((item) => item.id === "wizard-xphb");
  if (!entry) throw new Error("wizard-xphb class fixture missing");
  return entry;
};

const warlock = () => {
  const entry = getBuilderClasses().find((item) => item.id === "warlock-xphb");
  if (!entry) throw new Error("warlock-xphb class fixture missing");
  return entry;
};

describe("spellcasting rules", () => {
  it("derives prepared-caster limits, slots, save DC, and spell attack", () => {
    const summary = deriveSpellcastingSummary({
      characterClass: wizard(),
      level: 5,
      finalAttributes: {
        forca: 8,
        destreza: 12,
        constituicao: 14,
        inteligencia: 16,
        sabedoria: 10,
        carisma: 8,
      },
      proficiencyBonus: 3,
      choices: {
        cantripIds: ["acid-splash-xphb", "light-xphb", "mage-hand-xphb"],
        knownSpellIds: [],
        preparedSpellIds: ["fireball-xphb", "arcane-gate-xphb"],
      },
      usedSpellSlots: {},
    });

    expect(summary).toMatchObject({
      ability: "inteligencia",
      abilityLabel: "Intelligence",
      spellSaveDc: 14,
      spellAttackBonus: 6,
      cantripsKnownLimit: 4,
      preparedSpellLimit: 9,
      selectedCantripCount: 3,
      selectedPreparedCount: 2,
      slots: [
        { level: 1, total: 4, used: 0, remaining: 4 },
        { level: 2, total: 3, used: 0, remaining: 3 },
        { level: 3, total: 2, used: 0, remaining: 2 },
      ],
    });
  });

  it("subtracts spent spell slots without going below zero", () => {
    const summary = deriveSpellcastingSummary({
      characterClass: wizard(),
      level: 5,
      finalAttributes: {
        forca: 8,
        destreza: 12,
        constituicao: 14,
        inteligencia: 16,
        sabedoria: 10,
        carisma: 8,
      },
      proficiencyBonus: 3,
      choices: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [] },
      usedSpellSlots: { 1: 2, 3: 99 },
    });

    expect(summary).toBeDefined();
    expect(summary!.slots.find((slot) => slot.level === 1)).toMatchObject({
      total: 4,
      used: 2,
      remaining: 2,
    });
    expect(summary!.slots.find((slot) => slot.level === 3)).toMatchObject({
      total: 2,
      used: 2,
      remaining: 0,
    });
  });

  it("derives pact magic slots at the warlock slot level", () => {
    const summary = deriveSpellcastingSummary({
      characterClass: warlock(),
      level: 5,
      finalAttributes: {
        forca: 8,
        destreza: 12,
        constituicao: 14,
        inteligencia: 10,
        sabedoria: 8,
        carisma: 16,
      },
      proficiencyBonus: 3,
      choices: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [] },
      usedSpellSlots: { 3: 1 },
    });

    expect(summary).toBeDefined();
    expect(summary!.preparedSpellLimit).toBe(6);
    expect(summary!.slots).toEqual([
      { level: 3, total: 2, used: 1, remaining: 1 },
    ]);
  });

  it("reports the highest spell level available to a class level", () => {
    expect(getHighestSpellLevelAvailable(wizard(), 1)).toBe(1);
    expect(getHighestSpellLevelAvailable(wizard(), 5)).toBe(3);
    expect(getHighestSpellLevelAvailable(warlock(), 5)).toBe(3);
  });

  it("requires spell selections to meet cantrip and spell limits", () => {
    expect(
      isSpellcastingSelectionComplete({
        cantripLimit: 3,
        spellLimit: 4,
        spellMode: "prepared",
        choices: {
          cantripIds: ["acid-splash-xphb", "light-xphb"],
          knownSpellIds: [],
          preparedSpellIds: ["alarm-xphb"],
        },
      }),
    ).toBe(false);

    expect(
      isSpellcastingSelectionComplete({
        cantripLimit: 3,
        spellLimit: 4,
        spellMode: "prepared",
        choices: {
          cantripIds: ["acid-splash-xphb", "light-xphb", "mage-hand-xphb"],
          knownSpellIds: [],
          preparedSpellIds: [
            "alarm-xphb",
            "burning-hands-xphb",
            "charm-person-xphb",
            "detect-magic-xphb",
          ],
        },
      }),
    ).toBe(true);
  });
});
