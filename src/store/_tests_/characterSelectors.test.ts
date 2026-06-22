import { describe, expect, it } from "vitest";
import {
  createCharacterStore,
  initialCharacterState,
} from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";
import { calculateMaxHitPoints } from "@/src/adapters/characterDerivedAdapter";

describe("character selectors", () => {
  it("derives final attributes from 2024 background bonuses, not species", () => {
    const store = createCharacterStore();

    store.getState().selectSpecies("aasimar-xphb");
    store.getState().selectBackground("acolyte-xphb");
    store.getState().setBackgroundAbilityBonuses({
      inteligencia: 2,
      sabedoria: 1,
    });

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.ruleset).toBe("2024");
    expect(summary.speciesId).toBe("aasimar-xphb");
    expect(summary.backgroundId).toBe("acolyte-xphb");
    expect(summary.finalAttributes.inteligencia).toBe(
      initialCharacterState.baseAttributes.inteligencia + 2,
    );
    expect(summary.originFeat).toBe("Magic Initiate (Cleric)");
  });

  it("includes the chosen class package items in selectedEquipment", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter || fighter.startingEquipmentPackages.length === 0) {
      throw new Error("expected fighter to have starting equipment packages");
    }
    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", fighter.startingEquipmentPackages[0].id);

    const summary = selectCharacterSheetSummary(store.getState());
    expect(summary.selectedEquipment.length).toBeGreaterThan(0);
  });

  it("scales max HP with character level", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter || fighter.hitDie !== 10) {
      throw new Error("expected fighter to use a d10 hit die");
    }
    store.getState().selectClass("fighter-xphb");

    const atLevelOne = selectCharacterSheetSummary(store.getState()).maxHp;

    store.getState().setLevel(5);
    const summary = selectCharacterSheetSummary(store.getState());
    const con = summary.finalAttributes.constituicao;

    expect(summary.maxHp).toBe(calculateMaxHitPoints(10, con, 5));
    expect(summary.maxHp).toBeGreaterThan(atLevelOne);
    expect(summary.hitPoints).toBe(summary.maxHp);
    expect(summary.currentHp).toBe(summary.maxHp);
  });

  it("exposes class features unlocked up to the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");

    const atLevelOne = selectCharacterSheetSummary(store.getState());
    expect(atLevelOne.classFeatures.some((f) => f.name === "Extra Attack")).toBe(
      false,
    );

    store.getState().setLevel(5);
    const atLevelFive = selectCharacterSheetSummary(store.getState());

    // Extra Attack is gained at level 5.
    expect(atLevelFive.classFeatures.some((f) => f.name === "Extra Attack")).toBe(
      true,
    );
    // Level-1 features remain present.
    expect(
      atLevelFive.classFeatures.some((f) => f.name === "Second Wind"),
    ).toBe(true);
    // Nothing above the current level leaks in.
    expect(
      atLevelFive.classFeatures.every((f) => (f.level ?? 1) <= 5),
    ).toBe(true);
  });

  it("includes inventory items in selectedEquipment", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");
    const summary = selectCharacterSheetSummary(store.getState());
    expect(summary.selectedEquipment.some((e) => e.id === "chain-mail-xphb")).toBe(true);
  });
});
