import { describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { getBuilderClasses, getSubclassesForClass } from "@/src/services/ruleService";
import {
  collectAsiBonuses,
  getActiveSubclassFeatures,
  getPendingRequirements,
  getUnresolvedLevelChoices,
} from "@/src/store/levelChoiceResolver";

function fighterClass() {
  const c = getBuilderClasses().find((x) => x.id === "fighter-xphb");
  if (!c) throw new Error("fighter-xphb missing");
  return c;
}

describe("collectAsiBonuses", () => {
  it("sums ASI increases and half-feat bonuses up to the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(6);
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });
    store.getState().setLevelAsiOrFeat(6, { mode: "feat", featId: "x", asi: { forca: 1 } });

    expect(collectAsiBonuses(store.getState())).toEqual({ constituicao: 2, forca: 1 });
  });

  it("ignores choices above the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 2 } });
    store.getState().setLevelAsiOrFeat(8, { mode: "asi", increases: { destreza: 2 } });

    expect(collectAsiBonuses(store.getState())).toEqual({ forca: 2 });
  });
});

describe("getUnresolvedLevelChoices", () => {
  it("reports an unfilled subclass and ASI choice", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "subclass" && u.level === 3)).toBe(true);
    expect(unresolved.some((u) => u.kind === "asi-or-feat" && u.level === 4)).toBe(true);
  });

  it("clears the subclass pending once a valid subclass is chosen", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 2 } });

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "subclass")).toBe(false);
    expect(unresolved.some((u) => u.kind === "asi-or-feat")).toBe(false);
  });

  it("treats an ASI that does not total 2 as unresolved", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 1 } });

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "asi-or-feat" && u.level === 4)).toBe(true);
  });

  it("reports an unfilled feature-option and clears it when the count is met", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(1);

    let unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "feature-option")).toBe(true);

    store.getState().setClassFeatureChoice("weapon-mastery", [
      "Longsword", "Shortsword", "Greataxe",
    ]);
    unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "feature-option")).toBe(false);
  });

  it("treats a malformed ASI distribution (summing to 2) as unresolved", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevelAsiOrFeat(4, {
      mode: "asi",
      increases: { forca: 3, destreza: -1 },
    });

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "asi-or-feat" && u.level === 4)).toBe(true);
  });

  it("treats non-subclass choices through an external baseline as already resolved", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(8);
    store.getState().selectSubclass("battle-master-xphb");

    const unresolved = getUnresolvedLevelChoices(
      {
        ...store.getState(),
        externalLevelChoiceBaseline: 8,
      },
      fighterClass(),
    );

    expect(unresolved.some((u) => u.kind === "asi-or-feat")).toBe(false);
    expect(unresolved.some((u) => u.kind === "feature-option")).toBe(false);
  });

  it("keeps subclass choices pending across an external baseline", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(8);

    const unresolved = getUnresolvedLevelChoices(
      {
        ...store.getState(),
        externalLevelChoiceBaseline: 8,
      },
      fighterClass(),
    );

    expect(unresolved.some((u) => u.kind === "subclass")).toBe(true);
  });

  it("requires choices above the external baseline during future level-up", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(12);
    store.getState().selectSubclass("battle-master-xphb");

    const unresolved = getUnresolvedLevelChoices(
      {
        ...store.getState(),
        externalLevelChoiceBaseline: 8,
      },
      fighterClass(),
    );

    expect(unresolved.some((u) => u.kind === "asi-or-feat" && u.level === 12)).toBe(
      true,
    );
  });
});

describe("getActiveSubclassFeatures", () => {
  it("returns subclass features unlocked up to the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(7);
    store.getState().selectSubclass("battle-master-xphb");

    const features = getActiveSubclassFeatures(store.getState(), fighterClass());
    expect(features.length).toBeGreaterThan(0);
    expect(features.every((f) => (f.level ?? 1) <= 7)).toBe(true);
    const bm = getSubclassesForClass("fighter-xphb").find((s) => s.id === "battle-master-xphb");
    const level10 = bm?.features.find((f) => f.level === 10);
    if (level10) expect(features.some((f) => f.name === level10.name)).toBe(false);
  });

  it("returns nothing when no subclass is selected", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(7);
    expect(getActiveSubclassFeatures(store.getState(), fighterClass())).toEqual([]);
  });
});

describe("getPendingRequirements", () => {
  it("returns the full unresolved requirement objects (with options/level/kind)", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);

    const pending = getPendingRequirements(store.getState(), fighterClass());
    expect(pending.some((r) => r.kind === "subclass" && r.level === 3)).toBe(true);
    expect(pending.some((r) => r.kind === "asi-or-feat" && r.level === 4)).toBe(true);
    const wm = pending.find((r) => r.kind === "feature-option");
    expect(wm && "options" in wm && Array.isArray(wm.options)).toBe(true);
  });

  it("drops a requirement once it is resolved", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");

    const pending = getPendingRequirements(store.getState(), fighterClass());
    expect(pending.some((r) => r.kind === "subclass")).toBe(false);
  });
});
