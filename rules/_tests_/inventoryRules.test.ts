import { describe, expect, it } from "vitest";
import {
  deriveCarriedEquipment,
  deriveCarriedLoadKg,
  deriveSelectedEquipment,
} from "@/rules/inventoryRules";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { getBuilderClasses } from "@/src/services/ruleService";

function fighterClass() {
  const characterClass = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");
  if (!characterClass || characterClass.startingEquipmentPackages.length === 0) {
    throw new Error("expected fighter-xphb with starting equipment packages");
  }
  return characterClass;
}

describe("deriveCarriedEquipment", () => {
  it("returns an empty list for a fresh character", () => {
    const store = createCharacterStore();

    expect(deriveCarriedEquipment({ state: store.getState() })).toEqual([]);
  });

  it("includes the chosen class kit items tagged as class source, excluding gold entries", () => {
    const store = createCharacterStore();
    const fighter = fighterClass();
    const kit = fighter.startingEquipmentPackages[0];

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", kit.id);

    const carried = deriveCarriedEquipment({
      state: store.getState(),
      characterClass: fighter,
    });

    expect(carried.length).toBeGreaterThan(0);
    for (const entry of carried) {
      expect(entry.item.sourceType).toBe("class");
      expect(entry.item.name.toLowerCase()).not.toBe("gold");
      expect(entry.quantity).toBeGreaterThan(0);
    }
  });

  it("merges manual inventory quantities on top of kit items", () => {
    const store = createCharacterStore();
    const fighter = fighterClass();
    const kitWithChainMail = fighter.startingEquipmentPackages.find((entry) =>
      entry.items.some((item) => item.id === "chain-mail-xphb"),
    );
    if (!kitWithChainMail) throw new Error("expected a fighter kit with chain mail");

    store.getState().selectClass("fighter-xphb");
    store.getState().setEquipmentSourceOption("class", kitWithChainMail.id);
    store.getState().addInventoryItem("chain-mail-xphb");

    const carried = deriveCarriedEquipment({
      state: store.getState(),
      characterClass: fighter,
    });
    const chainMail = carried.find((entry) => entry.item.id === "chain-mail-xphb");

    expect(chainMail?.quantity).toBe(2);
    expect(chainMail?.item.sourceType).toBe("class");
  });

  it("tags manual catalog items as manual source with catalog metadata", () => {
    const store = createCharacterStore();

    store.getState().addInventoryItem("chain-mail-xphb");

    const carried = deriveCarriedEquipment({ state: store.getState() });
    const chainMail = carried.find((entry) => entry.item.id === "chain-mail-xphb");

    expect(chainMail?.item.sourceType).toBe("manual");
    expect(chainMail?.item.category).toBe("Armor");
    expect(chainMail?.item.weightKg ?? 0).toBeGreaterThan(0);
  });

  it("falls back to an Unknown Item option when the id is not in the catalog", () => {
    const store = createCharacterStore();
    const state = {
      ...store.getState(),
      inventory: [{ itemId: "does-not-exist", quantity: 1 }],
    };

    const carried = deriveCarriedEquipment({ state });

    expect(carried).toHaveLength(1);
    expect(carried[0]?.item.name).toBe("Unknown Item");
    expect(carried[0]?.item.sourceType).toBe("manual");
    expect(carried[0]?.item.category).toBe("Other Gear");
  });
});

describe("deriveSelectedEquipment", () => {
  it("returns only carried items whose ids are equipped", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");
    store.getState().addInventoryItem("shield-xphb");
    store.getState().toggleEquippedItem("chain-mail-xphb");

    const state = store.getState();
    const carried = deriveCarriedEquipment({ state });
    const selected = deriveSelectedEquipment({ state, carriedEquipment: carried });

    expect(selected.map((item) => item.id)).toEqual(["chain-mail-xphb"]);
  });

  it("returns nothing when nothing is equipped", () => {
    const store = createCharacterStore();
    store.getState().addInventoryItem("chain-mail-xphb");

    const state = store.getState();
    const carried = deriveCarriedEquipment({ state });

    expect(deriveSelectedEquipment({ state, carriedEquipment: carried })).toEqual([]);
  });
});

describe("deriveCarriedLoadKg", () => {
  it("sums item weight times quantity, rounded to two decimals", () => {
    const load = deriveCarriedLoadKg([
      { item: { id: "a", name: "A", source: "X", sourceType: "manual", category: "Other Gear", weightKg: 1.333 }, quantity: 2 },
      { item: { id: "b", name: "B", source: "X", sourceType: "manual", category: "Other Gear", weightKg: 0.5 }, quantity: 1 },
    ]);

    expect(load).toBe(3.17);
  });

  it("treats items without weight as weightless", () => {
    const load = deriveCarriedLoadKg([
      { item: { id: "a", name: "A", source: "X", sourceType: "manual", category: "Other Gear" }, quantity: 5 },
    ]);

    expect(load).toBe(0);
  });
});
