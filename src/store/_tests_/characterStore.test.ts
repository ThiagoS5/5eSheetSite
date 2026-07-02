import { describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { deriveStartingGoldPo } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";

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
          schemaVersion: 6,
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

  it("adds inventory items and increments quantity on repeat", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");
    store.getState().addInventoryItem("chain-mail-xphb");
    expect(store.getState().inventory).toStrictEqual([{ itemId: "chain-mail-xphb", quantity: 2 }]);
  });
  it("sets and clamps quantity, removing at zero", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("rope-xphb");
    store.getState().setInventoryQuantity("rope-xphb", 5);
    expect(store.getState().inventory).toStrictEqual([{ itemId: "rope-xphb", quantity: 5 }]);
    store.getState().setInventoryQuantity("rope-xphb", 0);
    expect(store.getState().inventory).toStrictEqual([]);
  });
  it("removes an inventory entry", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("rope-xphb");
    store.getState().removeInventoryItem("rope-xphb");
    expect(store.getState().inventory).toStrictEqual([]);
  });

  it("defaults equipmentChoicesBySource to an empty object", () => {
    const store = createCharacterStore();
    expect(store.getState().equipmentChoicesBySource).toStrictEqual({});
  });

  it("sets per-source mode and option independently", () => {
    const store = createCharacterStore();

    store.getState().setEquipmentSourceOption("class", "A");
    store.getState().setEquipmentSourceMode("background", "gold");

    expect(store.getState().equipmentChoicesBySource).toStrictEqual({
      class: { mode: "items", selectedOptionId: "A" },
      background: { mode: "gold", selectedOptionId: null },
    });
  });

  it("clears the selected option when a source switches to gold", () => {
    const store = createCharacterStore();
    store.getState().setEquipmentSourceOption("class", "A");
    store.getState().setEquipmentSourceMode("class", "gold");
    expect(store.getState().equipmentChoicesBySource.class).toStrictEqual({
      mode: "gold",
      selectedOptionId: null,
    });
  });

  it("persists subclass and per-level ASI/feat choices through the build round-trip", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });

    const build = store.getState().characterBuild;
    expect(build.choices.selectedSubclassId).toBe("battle-master-xphb");
    expect(build.progression.levelChoices["4"].asiOrFeat).toEqual({
      mode: "asi",
      increases: { constituicao: 2 },
    });
    expect(store.getState().selectedSubclassId).toBe("battle-master-xphb");
    expect(store.getState().asiOrFeatByLevel["4"]).toEqual({
      mode: "asi",
      increases: { constituicao: 2 },
    });
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

  it("clears a stale subclass when the class changes", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().selectSubclass("battle-master-xphb");
    expect(store.getState().selectedSubclassId).toBe("battle-master-xphb");

    store.getState().selectClass("wizard-xphb");
    expect(store.getState().selectedSubclassId).toBe("");
  });

  it("adjustCoin materializes the derived starting gold before applying the delta", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter) {
      throw new Error("expected fighter-xphb to exist");
    }
    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceMode("class", "gold");

    const expectedStartingPo = deriveStartingGoldPo(store.getState());
    expect(store.getState().moneyTouched).toBe(false);

    store.getState().adjustCoin("po", 5);

    expect(store.getState().moneyTouched).toBe(true);
    expect(store.getState().money.po).toBe(expectedStartingPo + 5);
  });

  it("adjustCoin clamps the resulting value to zero", () => {
    const store = createCharacterStore();
    store.getState().adjustCoin("po", -100000);
    expect(store.getState().money.po).toBe(0);
    expect(store.getState().moneyTouched).toBe(true);
  });

  it("setCoin clamps the resulting value to zero", () => {
    const store = createCharacterStore();
    store.getState().setCoin("pp", -50);
    expect(store.getState().money.pp).toBe(0);
    expect(store.getState().moneyTouched).toBe(true);
  });

  it("setCarriedLoadKg clamps to zero", () => {
    const store = createCharacterStore();
    store.getState().setCarriedLoadKg(-3);
    expect(store.getState().carriedLoadKg).toBe(0);
  });

  it("setSkillOverride sets and then removes a skill override key", () => {
    const store = createCharacterStore();
    store.getState().setSkillOverride("Arcana", 9);
    expect(store.getState().skillModifierOverrides.Arcana).toBe(9);

    store.getState().setSkillOverride("Arcana", null);
    expect(store.getState().skillModifierOverrides).not.toHaveProperty("Arcana");
  });

  it("setSkillTraining persists the training level", () => {
    const store = createCharacterStore();
    store.getState().setSkillTraining("Stealth", "expertise");
    expect(store.getState().skillTraining.Stealth).toBe("expertise");
  });
});
