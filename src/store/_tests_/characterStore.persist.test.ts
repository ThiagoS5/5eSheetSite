/**
 * @vitest-environment jsdom
 */
import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";
import { beforeEach, describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { getCharacter } from "@/src/services/characterService";

describe("createCharacterStore persistence", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("restores builder selections and unlocked progress from sessionStorage", () => {
    const firstStore = createCharacterStore();

    firstStore.getState().selectClass("fighter-xphb");
    firstStore.getState().setClassSkillProficiencies(["Athletics", "Perception"]);
    firstStore.getState().unlockStep(2);

    const secondStore = createCharacterStore();

    expect(secondStore.getState()).toMatchObject({
      selectedClassId: "fighter-xphb",
      classSkillProficiencies: ["Athletics", "Perception"],
      maxUnlockedStepIndex: 2,
      characterBuild: {
        choices: {
          selectedClassId: "fighter-xphb",
          classSkillProficiencies: ["Athletics", "Perception"],
        },
        draft: {
          maxUnlockedStepIndex: 2,
        },
      },
    });
  });

  it("migrates legacy flat sessionStorage state into the canonical build", () => {


    sessionStorage.setItem(
      "ficha-5e-builder",
      JSON.stringify({
        state: {
          characterBuild: {
            draft: {
              currentStepSlug: "detalhes-especie",
              maxUnlockedStepIndex: 4,
              pendingChoiceIds: [],
              selectedEquipmentIds: ["chain-mail-xphb"],
              equipmentChoicesBySource: {
                class: { mode: "gold", selectedOptionId: null },
              },
              description: { nome: "Migrated Hero" },
            },
            progression: {
              level: 3,
              levelChoices: {
                "3": { classFeatureChoices: { "weapon-mastery": ["longsword-xphb"] } },
              },
            },
            choices: {
              ruleset: "2024",
              selectedSpeciesId: "human-xphb",
              selectedClassId: "fighter-xphb",
              selectedBackgroundId: "acolyte-xphb",
              classSkillProficiencies: ["Athletics", "Perception"],
              skillTraining: { Athletics: "proficient", Perception: "proficient" },
              classFeatureChoices: { "weapon-mastery": ["longsword-xphb"] },
              speciesChoices: {},
              speciesLanguages: ["Common", "Draconic"],
              attributeGenerationMethod: "standard-array",
              baseAttributes: {
                forca: 15,
                destreza: 14,
                constituicao: 13,
                inteligencia: 12,
                sabedoria: 10,
                carisma: 8,
              },
              backgroundAbilityBonuses: { inteligencia: 2, sabedoria: 1 },
            },
            exportMetadata: {
              schemaVersion: 2,
              saveId: "legacy-save-id",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        version: 2,
      }),
    );

    const store = createCharacterStore();

    expect(store.getState()).toMatchObject({
      level: 3,
      selectedClassId: "fighter-xphb",
      inventory: [{ itemId: "chain-mail-xphb", quantity: 1 }],
      characterBuild: {
        progression: { level: 3 },
        choices: {
          selectedClassId: "fighter-xphb",
          selectedSpeciesId: "human-xphb",
          selectedBackgroundId: "acolyte-xphb",
          classSkillProficiencies: ["Athletics", "Perception"],
        },
        draft: {
          currentStepSlug: "detalhes-especie",
          maxUnlockedStepIndex: 4,
          description: expect.objectContaining({ nome: "Migrated Hero" }),

          inventory: [{ itemId: "chain-mail-xphb", quantity: 1 }],
          equipmentChoicesBySource: {
            class: { mode: "gold", selectedOptionId: null },
          },
        },
        exportMetadata: {
          schemaVersion: CHARACTER_BUILD_SCHEMA_VERSION,
          saveId: expect.any(String),
        },
      },
    });
  });

  it("migrates a v3 save to v4 with subclass defaults and preserved levelChoices", () => {
    const v3Build = {
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
        levelChoices: { "1": { classFeatureChoices: { "weapon-mastery": ["Longsword"] } } },
      },
      choices: {
        ruleset: "2024",
        selectedSpeciesId: "",
        selectedClassId: "fighter-xphb",
        selectedBackgroundId: "",
        classSkillProficiencies: [],
        skillTraining: {},
        classFeatureChoices: { "weapon-mastery": ["Longsword"] },
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
      exportMetadata: { schemaVersion: 3, saveId: "legacy-1", createdAt: "x", updatedAt: "x" },
    };
    sessionStorage.setItem(
      "ficha-5e-builder",
      JSON.stringify({ state: { characterBuild: v3Build }, version: 3 }),
    );

    const store = createCharacterStore();
    const build = store.getState().characterBuild;

    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(build.choices.selectedSubclassId).toBe("");
    expect(build.progression.levelChoices["1"].classFeatureChoices).toEqual({
      "weapon-mastery": ["Longsword"],
    });
    expect(store.getState().selectedSubclassId).toBe("");
  });

  it("migrates a v6 save to v8 with beginnerMode disabled by default", () => {
    const v6Build = {
      draft: {
        currentStepSlug: "classe",
        maxUnlockedStepIndex: 0,
        pendingChoiceIds: [],
        inventory: [],
        equipmentChoicesBySource: {},
        description: {},
      },
      progression: { level: 1, levelChoices: {} },
      choices: {
        ruleset: "2024",
        selectedSpeciesId: "",
        selectedClassId: "",
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
        money: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
        moneyTouched: false,
        carriedLoadKg: 0,
        skillModifierOverrides: {},
        creationPreferences: { activeSources: ["XPHB"], progressionMode: "xp" },
      },
      derivedSheet: {},
      exportMetadata: { schemaVersion: 6, saveId: "legacy-v6", createdAt: "x", updatedAt: "x" },
    };

    sessionStorage.setItem(
      "ficha-5e-builder",
      JSON.stringify({ state: { characterBuild: v6Build }, version: 6 }),
    );

    const store = createCharacterStore();

    expect(store.getState().characterBuild.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(store.getState().beginnerMode).toBe(false);
    expect(store.getState().characterBuild.choices.beginnerMode).toBe(false);
  });

  it("migrates a v7 save to v8 preserving feat choices", () => {
    const v7Build = {
      draft: {
        currentStepSlug: "classe",
        maxUnlockedStepIndex: 0,
        pendingChoiceIds: [],
        inventory: [],
        equipmentChoicesBySource: {},
        description: {},
      },
      progression: {
        level: 4,
        levelChoices: {
          "4": {
            classFeatureChoices: {},
            asiOrFeat: { mode: "feat", featId: "grappler-xphb", asi: { forca: 1 } },
          },
        },
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
        money: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
        moneyTouched: false,
        carriedLoadKg: 0,
        skillModifierOverrides: {},
        creationPreferences: { activeSources: ["XPHB"], progressionMode: "xp" },
        beginnerMode: false,
      },
      derivedSheet: {},
      exportMetadata: { schemaVersion: 7, saveId: "legacy-v7", createdAt: "x", updatedAt: "x" },
    };

    sessionStorage.setItem(
      "ficha-5e-builder",
      JSON.stringify({ state: { characterBuild: v7Build }, version: 7 }),
    );

    const store = createCharacterStore();

    expect(store.getState().characterBuild.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(store.getState().asiOrFeatByLevel["4"]).toEqual({
      mode: "feat",
      featId: "grappler-xphb",
      asi: { forca: 1 },
    });
  });

  it("migrates a v8 save to v9 with a separate playState block", () => {
    const v8Build = {
      draft: {
        currentStepSlug: "recursos-classe",
        maxUnlockedStepIndex: 1,
        pendingChoiceIds: [],
        inventory: [],
        equipmentChoicesBySource: {},
        description: {},
      },
      progression: { level: 5, levelChoices: {} },
      choices: {
        ruleset: "2024",
        selectedSpeciesId: "",
        selectedClassId: "wizard-xphb",
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
          inteligencia: 16,
          sabedoria: 8,
          carisma: 8,
        },
        backgroundAbilityBonuses: {},
        money: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
        moneyTouched: false,
        carriedLoadKg: 0,
        skillModifierOverrides: {},
        spellcasting: {
          cantripIds: ["acid-splash-xphb"],
          knownSpellIds: [],
          preparedSpellIds: ["fireball-xphb"],
        },
        beginnerMode: false,
      },
      derivedSheet: {},
      exportMetadata: { schemaVersion: 8, saveId: "legacy-v8", createdAt: "x", updatedAt: "x" },
    };

    sessionStorage.setItem(
      "ficha-5e-builder",
      JSON.stringify({ state: { characterBuild: v8Build }, version: 8 }),
    );

    const store = createCharacterStore();

    expect(store.getState().characterBuild.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(store.getState().spellcasting?.preparedSpellIds).toEqual(["fireball-xphb"]);
    const migrated = store.getState().characterBuild;
    expect(migrated.playState).toMatchObject({
      currentHp: migrated.derivedSheet.maxHp,
      tempHp: 0,
      usedSpellSlots: {},
      inspiration: false,
    });
    expect(migrated.playState.currentHp).toBeGreaterThan(0);
  });

  it("commits the active build into the local repository when advancing", async () => {
    const store = createCharacterStore();
    const saveId = store.getState().characterBuild.exportMetadata.saveId;

    store.getState().selectClass("fighter-xphb");
    store.getState().setDescriptionField("nome", "Committed Hero");
    const committed = await store.getState().commitCurrentBuild("recursos-classe", 1);

    expect(committed.draft.currentStepSlug).toBe("recursos-classe");
    expect(committed.draft.maxUnlockedStepIndex).toBe(1);
    expect(committed.derivedSheet).toMatchObject({
      level: 1,
      classId: "fighter-xphb",
      hitPoints: expect.any(Number),
      proficiencyBonus: 2,
    });
    await expect(getCharacter(saveId)).resolves.toMatchObject({
      draft: {
        currentStepSlug: "recursos-classe",
      },
      exportMetadata: {
        saveId,
      },
    });
  });
});
