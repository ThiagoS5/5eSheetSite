import { describe, expect, it } from "vitest";
import {
  calculateInitialHitPoints,
  calculateMaxHitPoints,
} from "@/src/adapters/characterDerivedAdapter";

describe("calculateMaxHitPoints (level-aware)", () => {
  it("matches the level-1 value for level 1", () => {
    // d10, CON 14 (+2) → 10 + 2 = 12
    expect(calculateMaxHitPoints(10, 14, 1)).toBe(12);
    expect(calculateMaxHitPoints(10, 14, 1)).toBe(
      calculateInitialHitPoints(10, 14),
    );
  });

  it("adds the fixed average per level after the first", () => {
    // d10, CON 14 (+2): L1 = 12; each extra level = floor(10/2)+1 + 2 = 8
    // level 3 → 12 + 2 * 8 = 28
    expect(calculateMaxHitPoints(10, 14, 3)).toBe(28);
  });

  it("uses the correct fixed average for each hit die", () => {
    // CON 10 (+0), level 2 → L1 hitDie + (floor(hitDie/2)+1)
    expect(calculateMaxHitPoints(6, 10, 2)).toBe(6 + 4); // d6 → +4
    expect(calculateMaxHitPoints(8, 10, 2)).toBe(8 + 5); // d8 → +5
    expect(calculateMaxHitPoints(12, 10, 2)).toBe(12 + 7); // d12 → +7
  });

  it("applies a negative Constitution modifier to every level", () => {
    // d8, CON 8 (-1), level 3: L1 = 8 - 1 = 7; each extra = 5 - 1 = 4
    // → 7 + 2 * 4 = 15
    expect(calculateMaxHitPoints(8, 8, 3)).toBe(15);
  });

  it("clamps a level below 1 to a single hit die", () => {
    expect(calculateMaxHitPoints(10, 14, 0)).toBe(12);
  });
});
