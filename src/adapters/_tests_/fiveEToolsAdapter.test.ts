/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { extractBackgroundGold, extractClassGoldAlternative } from "@/src/adapters/fiveEToolsAdapter";

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
