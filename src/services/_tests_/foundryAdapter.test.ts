import { describe, expect, it } from "vitest";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { CharacterSheetSummary } from "@/types/builder";

const state: CharacterBuilderState = {
  ruleset: "2024",
  level: 1,
  selectedSpeciesId: "aasimar-xphb",
  selectedClassId: "fighter-xphb",
  selectedSubclassId: "",
  asiOrFeatByLevel: {},
  selectedBackgroundId: "guard-xphb",
  inventory: [{ itemId: "chain-mail-xphb", quantity: 3 }],
  equippedItemIds: ["chain-mail-xphb"],
  equipmentChoicesBySource: {},
  maxUnlockedStepIndex: 7,
  pendingChoiceIds: [],
  classSkillProficiencies: ["Athletics", "Perception"],
  skillTraining: {
    Athletics: "proficient",
    Perception: "proficient",
  },
  classFeatureChoices: {},
  speciesChoices: {
    "draconic-ancestry": "black",
  },
  speciesLanguages: ["Draconic", "Elvish"],
  attributeGenerationMethod: "standard-array",
  baseAttributes: {
    forca: 15,
    destreza: 14,
    constituicao: 13,
    inteligencia: 12,
    sabedoria: 10,
    carisma: 8,
  },
  backgroundAbilityBonuses: { forca: 2, constituicao: 1 },
  description: {
    nome: "Brienne",
    alinhamento: "Lawful Good",
    faith: "Bahamut",
    lifestyle: "Modest",
    age: "28",
    height: "6 ft.",
    weight: "180 lb.",
    eyes: "Blue",
    skin: "Bronze",
    hair: "Black",
    gender: "Female",
    aparencia: "Travel-worn armor.",
    personalidade: "Protective and direct.",
    tracos: "Never backs down.",
    notas: "Export test.",
  },
  money: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
  moneyTouched: false,
  carriedLoadKg: 0,
  skillModifierOverrides: {},
  hpRollByLevel: {},
};

const summary: CharacterSheetSummary = {
  ruleset: "2024",
  level: 1,
  speciesId: "aasimar-xphb",
  classId: "fighter-xphb",
  backgroundId: "guard-xphb",
  originFeat: "Alert",
  baseAttributes: state.baseAttributes,
  backgroundAbilityBonuses: state.backgroundAbilityBonuses,
  finalAttributes: {
    forca: 17,
    destreza: 14,
    constituicao: 14,
    inteligencia: 12,
    sabedoria: 10,
    carisma: 8,
  },
  proficiencyBonus: 2,
  hitPoints: 12,
  armorClass: 16,
  selectedEquipment: [
    {
      id: "chain-mail-xphb",
      name: "Chain Mail",
      source: "XPHB",
      sourceType: "manual",
      category: "Armor",
      armorClass: 16,
    },
  ],
  selectedTraits: [{ name: "Healing Hands", description: "Restore hit points." }],
  classFeatures: [{ name: "Second Wind", description: "Regain hit points." }],
  classSkillProficiencies: state.classSkillProficiencies,
  skillTraining: state.skillTraining,
  classFeatureChoices: state.classFeatureChoices,
  speciesChoices: state.speciesChoices,
  speciesLanguages: state.speciesLanguages,
  validationMessages: [],
  name: "Brienne",
  className: "Fighter",
  speciesName: "Aasimar",
  backgroundName: "Guard",
  currentHp: 12,
  maxHp: 12,
  tempHp: 0,
  hitDice: "1d10",
  initiative: 2,
  speedFeet: 30,
  speedMeters: 9,
  xp: 0,
  xpThreshold: 300,
  isSpellcaster: false,
  attributes: [],
  skills: [],
  savingThrows: [],
  passives: { perception: 10, investigation: 10, insight: 10 },
  senses: [],
  languages: state.speciesLanguages,
  resistances: [],
  immunities: [],
  vulnerabilities: [],
  features: [],
  weapons: [],
  money: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
  carry: { currentKg: 0, maxKg: 0 },
};

describe("foundryAdapter", () => {
  it("maps builder state and sheet summary into a Foundry character actor export", () => {
    const actor = createFoundryCharacterExport(state, summary);

    expect(actor.type).toBe("character");
    expect(actor.name).toBe("Brienne");
    expect(actor.system.abilities.str.value).toBe(17);
    expect(actor.system.abilities.dex.value).toBe(14);
    expect(actor.system.attributes.hp.max).toBe(12);
    expect(actor.system.attributes.hp.value).toBe(12);
    expect(actor.system.attributes.ac.flat).toBe(16);
    expect(actor.system.details.level).toBe(1);
    expect(actor.system.details.alignment).toBe("Lawful Good");
    expect(actor.system.details.faith).toBe("Bahamut");
    expect(actor.system.details.trait).toBe("Never backs down.");
    expect(actor.system.details.appearance).toContain("Travel-worn");
    expect(actor.system.traits?.languages).toMatchObject({
      value: ["draconic", "elvish"],
    });
    expect(actor.items.map((item) => item.name)).toEqual(
      expect.arrayContaining([
        "Fighter",
        "Aasimar",
        "Guard",
        "Healing Hands",
        "Second Wind",
        "Chain Mail",
      ]),
    );
    const chainMailItem = actor.items.find((item) => item.name === "Chain Mail");
    expect(chainMailItem?.system.quantity).toBe(3);
  });
});
