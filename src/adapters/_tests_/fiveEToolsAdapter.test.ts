/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { extractBackgroundGold, extractBackgroundItemsA, extractClassGoldAlternative } from "@/src/adapters/fiveEToolsAdapter";
import { getBuilderClasses } from "@/src/services/ruleService";

describe("extractBackgroundGold", () => {
  it("returns formatted GP string when option b has a copper value", () => {
    const startingEquipment = [{ a: [], b: [{ value: 5000 }] }];
    expect(extractBackgroundGold(startingEquipment)).toBe("50 GP");
  });

  it("returns undefined when startingEquipment is undefined", () => {
    expect(extractBackgroundGold(undefined)).toBeUndefined();
  });

  it("returns undefined when startingEquipment is empty", () => {
    expect(extractBackgroundGold([])).toBeUndefined();
  });

  it("returns undefined when first entry has no b property", () => {
    expect(extractBackgroundGold([{ a: [] }])).toBeUndefined();
  });

  it("returns undefined when b entry has no value", () => {
    expect(extractBackgroundGold([{ b: [{}] }])).toBeUndefined();
  });

  it("rounds up copper values that are not exact multiples of 100", () => {
    expect(extractBackgroundGold([{ b: [{ value: 4999 }] }])).toBe("50 GP");
  });
});

describe("extractClassGoldAlternative", () => {
  it("returns GP string from B package copper value", () => {
    expect(extractClassGoldAlternative([{ B: [{ value: 7500 }] }])).toBe("75 GP");
  });

  it("returns empty string when defaultData is undefined", () => {
    expect(extractClassGoldAlternative(undefined)).toBe("");
  });

  it("returns empty string when no B package exists", () => {
    expect(extractClassGoldAlternative([{}])).toBe("");
    expect(extractClassGoldAlternative([{ A: [{ value: 1500 }] }])).toBe("");
  });

  it("sums multiple copper values in B package", () => {
    expect(extractClassGoldAlternative([{ B: [{ value: 5000 }, { value: 2500 }] }])).toBe("75 GP");
  });

  it("handles lowercase b key as fallback", () => {
    expect(extractClassGoldAlternative([{ b: [{ value: 10000 }] }])).toBe("100 GP");
  });
});

describe("extractBackgroundItemsA", () => {
  it("returns empty array when startingEquipment is undefined or missing a", () => {
    expect(extractBackgroundItemsA(undefined)).toEqual([]);
    expect(extractBackgroundItemsA([])).toEqual([]);
    expect(extractBackgroundItemsA([{ b: [] }])).toEqual([]);
  });

  it("parses string item references into title-cased items", () => {
    const result = extractBackgroundItemsA([{ a: ["dagger|xphb", "disguise kit|xphb"] }]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ label: "Dagger", quantity: 1 });
    expect(result[1]).toMatchObject({ label: "Disguise Kit", quantity: 1 });
  });

  it("parses gold value objects as items with value field", () => {
    const result = extractBackgroundItemsA([{ a: [{ value: 1600 }] }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ label: "Gold", quantity: 1, value: 1600 });
  });

  it("uses displayName for object entries that provide it", () => {
    const result = extractBackgroundItemsA([{
      a: [{ item: "holy water|xphb", displayName: "Holy Water (1 flask)" }],
    }]);
    expect(result[0]?.label).toBe("Holy Water (1 flask)");
  });

  it("handles a full real-world option A (Aberrant Heir)", () => {
    const result = extractBackgroundItemsA([{
      a: [
        "dagger|xphb",
        "disguise kit|xphb",
        "costume|xphb",
        "traveler's clothes|xphb",
        { value: 1600 },
      ],
    }]);
    expect(result).toHaveLength(5);
    expect(result[4]).toMatchObject({ value: 1600 });
  });
});

it("marks the subclass-granting feature with grantsSubclass", () => {
  const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
  const subclassPoint = fighter?.allFeatures.find(
    (f) => f.level === 3 && f.grantsSubclass,
  );
  expect(subclassPoint).toBeDefined();
  const secondWind = fighter?.allFeatures.find((f) => f.name === "Second Wind");
  expect(secondWind?.grantsSubclass).toBeFalsy();
});
