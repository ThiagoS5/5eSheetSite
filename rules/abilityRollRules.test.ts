import { describe, expect, it } from "vitest";
import {
  createSeededRng,
  rollAbilityScore,
  rollAbilityScoreSet,
} from "@/rules/abilityRollRules";

describe("abilityRollRules", () => {
  it("rolls 4 dice in 1..6 and drops exactly the lowest", () => {
    const rng = createSeededRng(42);
    for (let i = 0; i < 100; i += 1) {
      const roll = rollAbilityScore(rng);
      expect(roll.dice).toHaveLength(4);
      for (const die of roll.dice) {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      }
      expect(roll.dropped).toBe(Math.min(...roll.dice));
      const sum = roll.dice.reduce((a, b) => a + b, 0);
      expect(roll.total).toBe(sum - roll.dropped);
      expect(roll.total).toBeGreaterThanOrEqual(3);
      expect(roll.total).toBeLessThanOrEqual(18);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = rollAbilityScoreSet(createSeededRng(7));
    const b = rollAbilityScoreSet(createSeededRng(7));
    expect(a).toEqual(b);
    expect(a).toHaveLength(6);
  });

  it("different seeds produce different sets (sanity)", () => {
    const a = rollAbilityScoreSet(createSeededRng(1));
    const b = rollAbilityScoreSet(createSeededRng(2));
    expect(a).not.toEqual(b);
  });
});
