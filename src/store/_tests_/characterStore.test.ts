import { describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";

describe("createCharacterStore", () => {
  it("starts with a canonical character build and mirrored level 1 fields", () => {
    const store = createCharacterStore();

    expect(store.getState()).toMatchObject({
      ruleset: "2024",
      level: 1,
      selectedSpeciesId: "",
      selectedClassId: "",
      selectedBackgroundId: "",
      baseAttributes: {
        forca: 8,
        destreza: 8,
        constituicao: 8,
        inteligencia: 8,
        sabedoria: 8,
        carisma: 8,
      },
      characterBuild: {
        draft: {
          currentStepSlug: "classe",
          maxUnlockedStepIndex: 0,
        },
        progression: {
          level: 1,
          levelChoices: {},
        },
        choices: {
          selectedSpeciesId: "",
          selectedClassId: "",
          selectedBackgroundId: "",
        },
        exportMetadata: {
          schemaVersion: 1,
          saveId: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      },
    });
  });

  it("updates wizard selections independently", () => {
    const store = createCharacterStore();

    store.getState().selectSpecies("dragonborn-xphb");
    store.getState().selectClass("fighter-xphb");
    store.getState().selectBackground("guard-xphb");

    expect(store.getState()).toMatchObject({
      selectedSpeciesId: "dragonborn-xphb",
      selectedClassId: "fighter-xphb",
      selectedBackgroundId: "guard-xphb",
    });
  });

  it("tracks internal builder decisions independently from selected cards", () => {
    const store = createCharacterStore();

    store.getState().setClassSkillProficiencies(["Athletics", "Perception"]);
    store.getState().setSkillTraining("Athletics", "proficient");
    store.getState().setSkillTraining("Stealth", "expertise");
    store.getState().setSpeciesChoice("draconic-ancestry", "black");
    store.getState().setSpeciesLanguages(["Draconic", "Elvish"]);
    store.getState().setDescriptionField("faith", "Bahamut");
    store.getState().setDescriptionField("lifestyle", "Modest");

    expect(store.getState()).toMatchObject({
      classSkillProficiencies: ["Athletics", "Perception"],
      skillTraining: {
        Athletics: "proficient",
        Stealth: "expertise",
      },
      speciesChoices: {
        "draconic-ancestry": "black",
      },
      speciesLanguages: ["Draconic", "Elvish"],
      description: {
        faith: "Bahamut",
        lifestyle: "Modest",
      },
    });
  });

  it("updates each base attribute independently", () => {
    const store = createCharacterStore();

    store.getState().setForca(15);
    store.getState().setDestreza(14);
    store.getState().setConstituicao(13);
    store.getState().setInteligencia(12);
    store.getState().setSabedoria(10);
    store.getState().setCarisma(9);

    expect(store.getState().baseAttributes).toStrictEqual({
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 12,
      sabedoria: 10,
      carisma: 9,
    });
  });

  it("toggles selected equipment without duplicates", () => {
    const store = createCharacterStore();

    store.getState().toggleEquipment("chain-mail-xphb");
    store.getState().toggleEquipment("chain-mail-xphb");

    expect(store.getState().selectedEquipmentIds).toStrictEqual([]);
    expect(store.getState().characterBuild.draft.selectedEquipmentIds).toStrictEqual([]);
  });

  it("resets the active build with a new save id", () => {
    const store = createCharacterStore();
    const initialSaveId = store.getState().characterBuild.exportMetadata.saveId;

    store.getState().selectClass("fighter-xphb");
    const resetBuild = store.getState().resetStore();

    expect(resetBuild.exportMetadata.saveId).not.toBe(initialSaveId);
    expect(store.getState()).toMatchObject({
      selectedClassId: "",
      maxUnlockedStepIndex: 0,
      characterBuild: {
        choices: {
          selectedClassId: "",
        },
        draft: {
          currentStepSlug: "classe",
          maxUnlockedStepIndex: 0,
        },
      },
    });
  });
});
