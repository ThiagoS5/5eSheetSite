import { describe, expect, it } from "vitest";
import {
  createCharacterStore,
  initialCharacterState,
} from "@/src/store/createCharacterStore";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getBuilderClasses } from "@/src/services/ruleService";

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

  it("stores wizard choices without embedding derived RPG calculations", () => {
    const store = createCharacterStore();

    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(1);
    store.getState().setDescriptionField("nome", "Aelar");
    store.getState().toggleEquipment("chain-mail-xphb");

    expect(store.getState()).toMatchObject({
      selectedClassId: "fighter-xphb",
      level: 1,
      description: { nome: "Aelar" },
      selectedEquipmentIds: ["chain-mail-xphb"],
    });
  });
});
