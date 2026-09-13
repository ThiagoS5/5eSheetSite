import { describe, expect, it } from "vitest";
import { deriveClassMovementAndDefense } from "@/rules/classMechanicsRules";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";

describe("2024 permanent class and origin mechanics", () => {
  it.each([[1, 30], [2, 40], [6, 45], [10, 50], [14, 55], [18, 60], [20, 60]])("derives Monk movement at level %i", (level, speed) => {
    const store = createCharacterStore();
    store.getState().selectClass("monk-xphb");
    store.getState().setLevel(level);
    store.getState().setDestreza(16);
    store.getState().setSabedoria(16);
    const summary = selectCharacterSheetSummary(store.getState());
    expect(summary.speedFeet).toBe(speed);
    expect(summary.armorClass).toBe(16);
    store.getState().addInventoryItem("shield-xphb");
    store.getState().toggleEquippedItem("shield-xphb");
    const shielded = selectCharacterSheetSummary(store.getState());
    expect(shielded.speedFeet).toBe(30);
    expect(shielded.armorClass).toBe(15);
  });

  it("allows a Barbarian shield but removes Fast Movement in heavy armor", () => {
    const store = createCharacterStore();
    store.getState().selectClass("barbarian-xphb");
    store.getState().setLevel(5);
    store.getState().setDestreza(14);
    store.getState().setConstituicao(16);
    store.getState().addInventoryItem("shield-xphb");
    store.getState().toggleEquippedItem("shield-xphb");
    expect(selectCharacterSheetSummary(store.getState())).toMatchObject({ armorClass: 17, speedFeet: 40 });
    store.getState().addInventoryItem("chain-mail-xphb");
    store.getState().toggleEquippedItem("chain-mail-xphb");
    expect(selectCharacterSheetSummary(store.getState())).toMatchObject({ armorClass: 18, speedFeet: 30 });
  });

  it("adds Dwarven Toughness and the Farmer's Tough feat at every level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().selectSpecies("dwarf-xphb");
    store.getState().selectBackground("farmer-xphb");
    store.getState().setConstituicao(14);
    store.getState().setLevel(5);
    const summary = selectCharacterSheetSummary(store.getState());
    expect(summary.maxHp).toBe(59);
    expect(summary.maxHpBreakdown?.reduce((sum, part) => sum + part.value, 0)).toBe(59);
    store.getState().setLevel(6);
    expect(selectCharacterSheetSummary(store.getState()).maxHp).toBe(70);
  });

  it("applies Tough retroactively and ignores future feat choices", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setConstituicao(14);
    store.getState().setLevelAsiOrFeat(4, { mode: "feat", featId: "tough-xphb" });
    expect(selectCharacterSheetSummary(store.getState()).maxHp).toBe(12);
    store.getState().setLevel(4);
    expect(selectCharacterSheetSummary(store.getState()).maxHp).toBe(44);
  });

  it("adds the level-19 Boon of Fortitude to maximum HP", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(19);
    const before = selectCharacterSheetSummary(store.getState()).maxHp;
    store.getState().setLevelAsiOrFeat(19, { mode: "feat", featId: "boon-of-fortitude-xphb" });
    expect(selectCharacterSheetSummary(store.getState()).maxHp).toBe(before + 40);
  });

  it("does not grant class effects to a different class", () => {
    const effects = deriveClassMovementAndDefense({ characterClass: getBuilderClasses().find((entry) => entry.id === "fighter-xphb"), level: 20, finalAttributes: { forca: 16, destreza: 16, constituicao: 16, inteligencia: 10, sabedoria: 16, carisma: 10 }, selectedEquipment: [] });
    expect(effects).toEqual({ speedBonusFeet: 0, unarmoredDefense: undefined });
  });
});
