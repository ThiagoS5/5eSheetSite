import { describe, expect, it } from "vitest";
import {
  deriveStartingGoldPo,
  selectCharacterSheetSummary,
} from "@/rules/characterSheetSummaryRules";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
} from "@/src/services/ruleService";

function fighterClass() {
  const characterClass = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");
  if (!characterClass) throw new Error("fighter-xphb missing");
  return characterClass;
}

describe("deriveStartingGoldPo", () => {
  it("returns zero when no equipment choice was made", () => {
    const store = createCharacterStore();

    expect(deriveStartingGoldPo(store.getState())).toBe(0);
  });

  it("parses the class starting gold label when the gold mode is chosen", () => {
    const store = createCharacterStore();
    const fighter = fighterClass();
    const expectedGold = parseInt(fighter.startingEquipmentGold.match(/\d+/)?.[0] ?? "0", 10);
    expect(expectedGold).toBeGreaterThan(0);

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceMode("class", "gold");

    expect(deriveStartingGoldPo(store.getState())).toBe(expectedGold);
  });

  it("converts the chosen class package copper value into gold", () => {
    const store = createCharacterStore();
    const fighter = fighterClass();
    const kit = fighter.startingEquipmentPackages[0];

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", kit.id);

    expect(deriveStartingGoldPo(store.getState())).toBe((kit.goldValue ?? 0) / 100);
  });

  it("adds background gold when the background gold mode is chosen", () => {
    const store = createCharacterStore();
    const background = getBuilderBackgrounds().find((entry) =>
      /\d/.test(entry.equipmentGold ?? ""),
    );
    if (!background) throw new Error("expected a background exposing a gold alternative");
    const expectedGold = parseInt(background.equipmentGold?.match(/\d+/)?.[0] ?? "0", 10);
    expect(expectedGold).toBeGreaterThan(0);

    store.getState().selectBackground(background.id);
    store.getState().setEquipmentSourceMode("background", "gold");

    expect(deriveStartingGoldPo(store.getState())).toBe(expectedGold);
  });
});

describe("selectCharacterSheetSummary derived fields", () => {
  it("reports XP earned and the threshold for the next level (2024 table)", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(3);

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.xp).toBe(900);
    expect(summary.xpThreshold).toBe(2700);
  });

  it("caps the XP threshold at the level-20 entry", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(20);

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.xp).toBe(355000);
    expect(summary.xpThreshold).toBe(355000);
  });

  it("converts the walking speed to rounded meters", () => {
    const store = createCharacterStore();
    store.getState().selectSpecies("human-xphb");

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.speedFeet).toBe(30);
    expect(summary.speedMeters).toBe(9);
  });

  it("derives carry capacity from Strength (7.5 kg per point)", () => {
    const store = createCharacterStore();

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.carry.maxKg).toBe(Math.round(summary.finalAttributes.forca * 7.5));
  });

  it("seeds the coin pouch with starting gold until money is touched", () => {
    const store = createCharacterStore();
    const fighter = fighterClass();
    const kit = fighter.startingEquipmentPackages[0];

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", kit.id);

    const summary = selectCharacterSheetSummary(store.getState());

    expect(store.getState().moneyTouched).toBe(false);
    expect(summary.money.po).toBe((kit.goldValue ?? 0) / 100);
  });

  it("formats hit dice from level and class hit die", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(5);

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.hitDice).toBe("5d10");
  });
});
