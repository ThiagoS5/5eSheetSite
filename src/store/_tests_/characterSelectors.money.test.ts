import { describe, expect, it } from "vitest";
import {
  createCharacterStore,
} from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";

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

  it("populates category on selectedEquipment entries", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");

    const summary = selectCharacterSheetSummary(store.getState());
    const entry = summary.selectedEquipment.find((e) => e.id === "chain-mail-xphb");

    expect(entry?.category).toBeTruthy();
  });
});
