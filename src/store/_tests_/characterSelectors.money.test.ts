import { describe, expect, it } from "vitest";
import {
  createCharacterStore,
} from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderBackgrounds, getBuilderClasses } from "@/src/services/ruleService";

describe("character selectors — money, carry, category, skill overrides", () => {
  it("derives starting gold (PO) from the class gold label when money is untouched", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter) {
      throw new Error("expected fighter-xphb to exist");
    }
    const expectedPo = parseInt(fighter.startingEquipmentGold, 10);
    expect(Number.isNaN(expectedPo)).toBe(false);

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceMode("class", "gold");

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.money.po).toBe(expectedPo);
    expect(summary.money.pc).toBe(0);
    expect(summary.money.pp).toBe(0);
    expect(summary.money.pe).toBe(0);
    expect(summary.money.pl).toBe(0);
  });

  it("uses the persisted money once moneyTouched is true, ignoring derived gold", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    if (!fighter) {
      throw new Error("expected fighter-xphb to exist");
    }
    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceMode("class", "gold");

    store.setState((state) => ({
      ...state,
      moneyTouched: true,
      money: { pc: 0, pp: 0, pe: 0, po: 7, pl: 0 },
    }));

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.money.po).toBe(7);
  });

  it("adds gold embedded in selected equipment packages while money is untouched", () => {
    const store = createCharacterStore();
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
    const packageWithGold = fighter?.startingEquipmentPackages.find(
      (entry) => entry.goldValue > 0,
    );
    if (!packageWithGold) {
      throw new Error("expected fighter to have a package with gold");
    }

    store.getState().selectClass("fighter-xphb");
    store.getState().selectBackground("aberrant-heir-efa");
    store.getState().setEquipmentSourceOption("class", packageWithGold.id);
    store.getState().setEquipmentSourceOption("background", "background-kit");

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.money.po).toBe(20);
    expect(summary.inventory.map((entry) => entry.item.name)).not.toContain("Gold");
  });

  it("adds Chondathan Freebooter package gold to the sheet without carrying Gold as an item", () => {
    const store = createCharacterStore();
    const background = getBuilderBackgrounds().find(
      (entry) => entry.name === "Chondathan Freebooter",
    );
    if (!background) {
      throw new Error("expected Chondathan Freebooter to exist");
    }

    store.getState().selectBackground(background.id);
    store.getState().setEquipmentSourceOption("background", "background-kit");

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.money.po).toBe(38);
    expect(summary.inventory.map((entry) => entry.item.name)).toEqual([
      "Dagger",
      "Weaver's Tools",
      "Backpack",
      "Ball Bearings",
      "Basket",
      "Bedroll",
      "Bucket",
      "Rations (3 days' worth)",
      "Rope",
      "Signal Whistle",
      "Traveler's Clothes",
    ]);
  });

  it("does not add background item gold until the background kit is selected", () => {
    const store = createCharacterStore();
    const background = getBuilderBackgrounds().find((entry) => entry.id === "aberrant-heir-efa");
    const hasGoldItem = background?.equipmentItemsA?.some((item) => item.label === "Gold");
    if (!hasGoldItem) {
      throw new Error("expected aberrant-heir-efa to include embedded gold");
    }

    store.getState().selectBackground("aberrant-heir-efa");
    store.getState().setEquipmentSourceMode("background", "items");

    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.money.po).toBe(0);
    expect(summary.inventory.some((entry) => entry.item.sourceType === "background")).toBe(false);
  });

  it("derives carry.maxKg from finalAttributes.forca", () => {
    const store = createCharacterStore();
    const summary = selectCharacterSheetSummary(store.getState());

    expect(summary.carry.maxKg).toBe(Math.round(summary.finalAttributes.forca * 7.5));
    expect(summary.carry.currentKg).toBe(store.getState().carriedLoadKg);
  });

  it("reports skillModifierOverrides on the matching skill and leaves others untouched", () => {
    const store = createCharacterStore();
    store.setState((state) => ({
      ...state,
      skillModifierOverrides: { Perception: 99 },
    }));

    const summary = selectCharacterSheetSummary(store.getState());
    const perception = summary.skills.find((s) => s.name === "Perception");
    const insight = summary.skills.find((s) => s.name === "Insight");

    expect(perception?.modifier).toBe(99);
    expect(perception?.isOverridden).toBe(true);
    expect(insight?.isOverridden).toBe(false);
  });

  it("ignores a NaN skillModifierOverrides entry, keeping the computed modifier", () => {
    const store = createCharacterStore();
    store.setState((state) => ({
      ...state,
      skillModifierOverrides: { Perception: NaN },
    }));

    const before = selectCharacterSheetSummary(createCharacterStore().getState());
    const expectedModifier = before.skills.find((s) => s.name === "Perception")?.modifier;

    const summary = selectCharacterSheetSummary(store.getState());
    const perception = summary.skills.find((s) => s.name === "Perception");

    expect(perception?.isOverridden).toBe(false);
    expect(perception?.modifier).toBe(expectedModifier);
    expect(Number.isNaN(perception?.modifier)).toBe(false);
  });

  it("populates category on selectedEquipment entries", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");
    store.getState().toggleEquippedItem("chain-mail-xphb");

    const summary = selectCharacterSheetSummary(store.getState());
    const entry = summary.selectedEquipment.find((e) => e.id === "chain-mail-xphb");

    expect(entry?.category).toBeTruthy();
  });
});
