/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { extractBackgroundGold } from "@/src/adapters/fiveEToolsAdapter";

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

  it("rounds correctly for non-round values", () => {
    expect(extractBackgroundGold([{ b: [{ value: 4999 }] }])).toBe("50 GP");
  });
});
