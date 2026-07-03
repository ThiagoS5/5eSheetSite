import { describe, expect, it } from "vitest";
import {
  createCharacterBuildFromFlatState,
  createStoreStateFromBuild,
  getDefaultFlatState,
  normalizeCharacterBuild,
} from "@/src/store/characterBuildModel";
import { EMPTY_COIN_POUCH } from "@/src/types/characterBuild";

describe("schema v5 migration — money, carried load, skill overrides", () => {
  it("normalizes a v4-shaped build (no money fields) into v5 defaults", () => {
    const v4Build = {
      draft: {
        currentStepSlug: "classe",
        maxUnlockedStepIndex: 1,
        pendingChoiceIds: [],
        inventory: [],
        equipmentChoicesBySource: {},
        description: {},
      },
      progression: {
        level: 1,
        levelChoices: {},
      },
      choices: {
        ruleset: "2024",
        selectedSpeciesId: "",
        selectedClassId: "fighter-xphb",
        selectedSubclassId: "",
        selectedBackgroundId: "",
        classSkillProficiencies: [],
        skillTraining: {},
        classFeatureChoices: {},
        speciesChoices: {},
        speciesLanguages: [],
        attributeGenerationMethod: "standard-array",
        baseAttributes: {
          forca: 8,
          destreza: 8,
          constituicao: 8,
          inteligencia: 8,
          sabedoria: 8,
          carisma: 8,
        },
        backgroundAbilityBonuses: {},
      },
      derivedSheet: {},
      exportMetadata: {
        schemaVersion: 4,
        saveId: "legacy-v4",
        createdAt: "x",
        updatedAt: "x",
      },
    };

    const normalized = normalizeCharacterBuild(v4Build as never);

    expect(normalized.exportMetadata.schemaVersion).toBe(7);
    expect(normalized.choices.money).toEqual(EMPTY_COIN_POUCH);
    expect(normalized.choices.moneyTouched).toBe(false);
    expect(normalized.choices.carriedLoadKg).toBe(0);
    expect(normalized.choices.skillModifierOverrides).toEqual({});
  });

  it("round-trips money/carriedLoad/skillModifierOverrides through createStoreStateFromBuild -> createCharacterBuildFromFlatState", () => {
    const flatState = {
      ...getDefaultFlatState(),
      money: { pc: 0, pp: 0, pe: 0, po: 42, pl: 0 },
      moneyTouched: true,
      carriedLoadKg: 3,
      skillModifierOverrides: { Arcana: 9 },
    };

    const build = createCharacterBuildFromFlatState(flatState);
    const storeState = createStoreStateFromBuild(build);
    const roundTrippedBuild = createCharacterBuildFromFlatState(storeState, build);

    expect(roundTrippedBuild.choices.money).toEqual({ pc: 0, pp: 0, pe: 0, po: 42, pl: 0 });
    expect(roundTrippedBuild.choices.moneyTouched).toBe(true);
    expect(roundTrippedBuild.choices.carriedLoadKg).toBe(3);
    expect(roundTrippedBuild.choices.skillModifierOverrides).toEqual({ Arcana: 9 });
  });
});
