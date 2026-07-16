import { CHARACTER_BUILD_SCHEMA_VERSION } from "@/src/types/characterBuild";
import { describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { deriveStartingGoldPo, selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getProficiencyBonus } from "@/src/adapters/characterDerivedAdapter";

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
          schemaVersion: CHARACTER_BUILD_SCHEMA_VERSION,
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

  it("preserves the selected option when a source switches to gold and back", () => {
    const store = createCharacterStore();
    store.getState().setEquipmentSourceOption("class", "A");
    store.getState().setEquipmentSourceMode("class", "gold");
    expect(store.getState().equipmentChoicesBySource.class).toStrictEqual({
      mode: "gold",
      selectedOptionId: "A",
    });

    store.getState().setEquipmentSourceMode("class", "items");
    expect(store.getState().equipmentChoicesBySource.class).toStrictEqual({
      mode: "items",
      selectedOptionId: "A",
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

  it("persists beginner mode through the CharacterBuild contract", () => {
    const store = createCharacterStore();

    store.getState().setBeginnerMode(true);

    expect(store.getState().beginnerMode).toBe(true);
    expect(store.getState().characterBuild.choices.beginnerMode).toBe(true);
    expect(store.getState().characterBuild.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
  });
});

describe("levelUp integration 1->20", () => {
  it("levelUp caps at 20", () => {
    const store = createCharacterStore();
    store.getState().setLevel(20);
    store.getState().levelUp();
    expect(store.getState().level).toBe(20);
  });

  it("Fighter 1->20: PB, PV e features consistentes em todos os niveis", () => {
    const store = createCharacterStore();


    store.getState().selectClass("fighter-xphb");
    for (let level = 2; level <= 20; level += 1) {
      store.getState().levelUp();
      store.getState().setLevelHpRoll(level, "average");
      const summary = selectCharacterSheetSummary(store.getState());
      expect(summary.level).toBe(level);
      expect(summary.proficiencyBonus).toBe(getProficiencyBonus(level));
      expect(summary.maxHp).toBeGreaterThan(0);
      expect(summary.hitDice).toBe(`${level}d10`);
      expect(summary.classFeatures.every((f) => (f.level ?? 1) <= level)).toBe(true);
    }
    const final = selectCharacterSheetSummary(store.getState());
    expect(final.proficiencyBonus).toBe(6);
    // initialCharacterState.baseAttributes.constituicao = 8 (nao 10), mod CON = -1.
    // Nivel 1: 10 (d10) + (-1) = 9. Niveis 2-20 (19x): media floor(10/2)+1=6, +(-1) = 5 cada.
    // 9 + 19*5 = 104.
    expect(final.maxHp).toBe(104);
  }, 30000);

  it("keeps current HP maximized when the level-up HP roll changes max HP", () => {
    const store = createCharacterStore();

    store.getState().selectClass("fighter-xphb");
    store.getState().applyDamage(5);
    store.getState().levelUp();
    const beforeRoll = selectCharacterSheetSummary(store.getState());
    expect(beforeRoll.currentHp).toBe(beforeRoll.maxHp);

    store.getState().setLevelHpRoll(2, 10);
    const afterRoll = selectCharacterSheetSummary(store.getState());

    expect(afterRoll.maxHp).toBeGreaterThan(beforeRoll.maxHp);
    expect(afterRoll.currentHp).toBe(afterRoll.maxHp);
    expect(store.getState().playState?.currentHp).toBe(afterRoll.maxHp);
  });

  it("Cleric 1->20 com rolagens numericas de PV", () => {
    const store = createCharacterStore();
    store.getState().selectClass("cleric-xphb");
    for (let level = 2; level <= 20; level += 1) {
      store.getState().levelUp();
      store.getState().setLevelHpRoll(level, 5); // d8: 5 e valido
    }
    const summary = selectCharacterSheetSummary(store.getState());
    // initialCharacterState.baseAttributes.constituicao = 8 (nao 10), mod CON = -1.
    // Nivel 1: 8 (d8) + (-1) = 7. Niveis 2-20 (19x): rolagem 5 + (-1) = 4 cada.
    // 7 + 19*4 = 83.
    expect(summary.maxHp).toBe(83);
    expect(summary.proficiencyBonus).toBe(6);
  }, 30000);
});

describe("character store spellcasting and play mode", () => {
  it("stores spell choices and spent slots in the canonical build", () => {
    const store = createCharacterStore();

    store.getState().selectClass("wizard-xphb");
    store.getState().setLevel(5);
    store.getState().setSpellcastingChoices({
      cantripIds: ["acid-splash-xphb"],
      knownSpellIds: [],
      preparedSpellIds: ["fireball-xphb"],
    });
    store.getState().spendSlot(3);

    expect(store.getState().characterBuild.choices.spellcasting).toMatchObject({
      cantripIds: ["acid-splash-xphb"],
      preparedSpellIds: ["fireball-xphb"],
    });
    expect(store.getState().characterBuild.playState.usedSpellSlots[3]).toBe(1);
  });

  it("clears stale spell choices and spent slots when the class changes", () => {
    const store = createCharacterStore();

    store.getState().selectClass("wizard-xphb");
    store.getState().setLevel(5);
    store.getState().setSpellcastingChoices({
      cantripIds: ["acid-splash-xphb"],
      knownSpellIds: [],
      preparedSpellIds: ["fireball-xphb"],
    });
    store.getState().spendSlot(3);

    store.getState().selectClass("cleric-xphb");

    expect(store.getState().spellcasting).toBeUndefined();
    expect(store.getState().characterBuild.choices.spellcasting).toBeUndefined();
    expect(store.getState().playState!.usedSpellSlots).toEqual({});
  });

  it("recovers pact magic slots on a short rest", () => {
    const store = createCharacterStore();

    store.getState().selectClass("warlock-xphb");
    store.getState().setLevel(5);
    store.getState().spendSlot(3);
    expect(store.getState().playState!.usedSpellSlots[3]).toBe(1);

    store.getState().shortRest({ hitDiceToSpend: 0 });

    expect(store.getState().playState!.usedSpellSlots).toEqual({});
  });

  it("tracks resource recovery timing for rests", () => {
    const store = createCharacterStore();

    store.getState().useResource("second-wind", 2, "shortRest");
    store.getState().useResource("indomitable", 1, "longRest");
    expect(store.getState().playState!.resourceUses).toEqual({
      "second-wind": 1,
      indomitable: 1,
    });

    store.getState().shortRest({ hitDiceToSpend: 0 });
    expect(store.getState().playState!.resourceUses).toEqual({
      indomitable: 1,
    });

    store.getState().longRest();
    expect(store.getState().playState!.resourceUses).toEqual({});
  });

  it("preserves non-rest play state data on a long rest", () => {
    const store = createCharacterStore();

    store.getState().toggleCondition("Poisoned");
    store.getState().setOverride("armorClass", 18);
    store.getState().addCampaignLogEntry({
      title: "Session 1",
      date: "2026-07-12",
      body: "Found the ruin.",
    });

    store.getState().longRest();

    expect(store.getState().playState!.conditions).toEqual(["Poisoned"]);
    expect(store.getState().playState!.overrides).toEqual({ armorClass: 18 });
    expect(store.getState().playState!.campaignLog).toHaveLength(1);
  });

  it("clamps damage, healing, temp HP, inspiration, and rests", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    const maxHp = selectCharacterSheetSummary(store.getState()).maxHp;

    store.getState().setTempHp(5);
    store.getState().applyDamage(maxHp + 20);
    expect(store.getState().playState!.currentHp).toBe(0);
    expect(store.getState().playState!.tempHp).toBe(0);

    store.getState().heal(maxHp + 20);
    expect(store.getState().playState!.currentHp).toBe(maxHp);

    store.getState().toggleInspiration();
    expect(store.getState().playState!.inspiration).toBe(true);

    store.getState().applyDamage(6);
    store.getState().shortRest({ hitDiceToSpend: 1 });
    expect(store.getState().playState!.currentHp).toBe(maxHp);
    expect(store.getState().playState!.hitDiceSpent).toBe(1);

    store.getState().applyDamage(3);
    store.getState().longRest();
    expect(store.getState().playState!).toMatchObject({
      currentHp: maxHp,
      tempHp: 0,
      hitDiceSpent: 0,
      inspiration: true,
    });
  });
});

describe("campaign log CRUD", () => {
  it("adds, updates, and removes entries", () => {
    const store = createCharacterStore();
    store.getState().addCampaignLogEntry({ title: "Session 1", date: "2026-07-10", body: "Met the guild." });

    let log = store.getState().characterBuild.playState.campaignLog;
    expect(log).toHaveLength(1);
    expect(log[0].title).toBe("Session 1");
    const id = log[0].id;
    expect(id).toBeTruthy();

    store.getState().updateCampaignLogEntry(id, { body: "Met the thieves' guild." });
    log = store.getState().characterBuild.playState.campaignLog;
    expect(log[0].body).toBe("Met the thieves' guild.");
    expect(log[0].title).toBe("Session 1");

    store.getState().removeCampaignLogEntry(id);
    expect(store.getState().characterBuild.playState.campaignLog).toHaveLength(0);
  });
});
