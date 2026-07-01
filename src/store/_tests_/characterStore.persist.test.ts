/**
 * @vitest-environment jsdom
 */
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
    // Seed a v2-era save: a characterBuild whose draft has the old `selectedEquipmentIds`
    // array and NO `inventory` field. The migration must map each id to { itemId, quantity: 1 }.
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
          // v2→v3 migration: legacy selectedEquipmentIds must be mapped to inventory
          inventory: [{ itemId: "chain-mail-xphb", quantity: 1 }],
          equipmentChoicesBySource: {
            class: { mode: "gold", selectedOptionId: null },
          },
        },
        exportMetadata: {
          schemaVersion: 5,
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

    expect(build.exportMetadata.schemaVersion).toBe(5);
    expect(build.choices.selectedSubclassId).toBe("");
    expect(build.progression.levelChoices["1"].classFeatureChoices).toEqual({
      "weapon-mastery": ["Longsword"],
    });
    expect(store.getState().selectedSubclassId).toBe("");
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
