import { describe, expect, it } from "vitest";
import {
  calculateMaxHitPointsWithRolls,
  getHitPointsBreakdown,
} from "@/rules/hitPointRules";
import { calculateMaxHitPoints } from "@/src/adapters/characterDerivedAdapter";

describe("calculateMaxHitPointsWithRolls", () => {
  it("without rolls equals the fixed-average rule (d10, CON 14, level 5 = 44)", () => {
    const input = { hitDie: 10, constitutionScore: 14, level: 5, hpRollByLevel: {} };
    expect(calculateMaxHitPointsWithRolls(input)).toBe(44);
    expect(calculateMaxHitPointsWithRolls(input)).toBe(calculateMaxHitPoints(10, 14, 5));
  });

  it("uses recorded rolls instead of the average for those levels", () => {
    // d10, CON 14 (+2): L1=12; L2 rolled 10 → 12; L3 avg 6+2=8; total 32
    expect(
      calculateMaxHitPointsWithRolls({
        hitDie: 10, constitutionScore: 14, level: 3,
        hpRollByLevel: { "2": 10, "3": "average" },
      }),
    ).toBe(32);
  });

  it("clamps out-of-range rolls to 1..hitDie and ignores rolls above current level", () => {
    expect(
      calculateMaxHitPointsWithRolls({
        hitDie: 8, constitutionScore: 10, level: 2,
        hpRollByLevel: { "2": 99, "7": 8 },
      }),
    ).toBe(8 + 8); // roll clampado a 8; nível 7 ignorado
    expect(
      calculateMaxHitPointsWithRolls({
        hitDie: 8, constitutionScore: 10, level: 2,
        hpRollByLevel: { "2": 0 },
      }),
    ).toBe(8 + 1);
  });

  it("breakdown parts always sum to the total", () => {
    const input = {
      hitDie: 10, constitutionScore: 14, level: 4,
      hpRollByLevel: { "2": 10 as const, "4": 3 as const },
    };
    const parts = getHitPointsBreakdown(input);
    expect(parts.reduce((sum, p) => sum + p.value, 0)).toBe(
      calculateMaxHitPointsWithRolls(input),
    );
    // rolagens aparecem como parcela separada da média
    expect(parts.some((p) => /rolad/i.test(p.label))).toBe(true);
  });
});
