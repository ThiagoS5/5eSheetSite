/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createCharacterStore } from "@/store/createCharacterStore";
import { getCharacter } from "@/services/characterService";

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
          ruleset: "2024",
          level: 3,
          selectedSpeciesId: "human-xphb",
          selectedClassId: "fighter-xphb",
          selectedBackgroundId: "acolyte-xphb",
          selectedEquipmentIds: ["chain-mail-xphb"],
          equipmentAcquisitionMode: "items",
          maxUnlockedStepIndex: 4,
          pendingChoiceIds: [],
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
          description: { nome: "Migrated Hero" },
        },
        version: 0,
      }),
    );

    const store = createCharacterStore();

    expect(store.getState()).toMatchObject({
      level: 3,
      selectedClassId: "fighter-xphb",
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
        },
        exportMetadata: {
          schemaVersion: 1,
          saveId: expect.any(String),
        },
      },
    });
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
