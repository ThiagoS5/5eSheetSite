import { describe, expect, it } from "vitest";
import {
  ABILITY_SCORE_CAP,
  EPIC_BOON_ABILITY_CAP,
  calculateFinalAttributes,
  calculateInitialHitPoints,
  calculateMaxHitPoints,
  getMaxHitPointsBreakdown,
} from "@/src/adapters/characterDerivedAdapter";
import type { CharacterAttributes } from "@/src/types/dnd";

const baseAttributes = (overrides: Partial<CharacterAttributes> = {}): CharacterAttributes => ({
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
  ...overrides,
});

describe("calculateFinalAttributes (cap de atributo)", () => {
  it("soma bônus normalmente abaixo do cap", () => {
    const result = calculateFinalAttributes(baseAttributes({ forca: 15 }), { forca: 2 });
    expect(result.forca).toBe(17);
  });

  it("capa em 20: 19 + 2 => 20", () => {
    const result = calculateFinalAttributes(baseAttributes({ forca: 19 }), { forca: 2 });
    expect(result.forca).toBe(ABILITY_SCORE_CAP);
  });

  it("capa em 20: 20 + 1 (half-feat) => 20", () => {
    const result = calculateFinalAttributes(baseAttributes({ forca: 20 }), { forca: 1 });
    expect(result.forca).toBe(20);
  });

  it("base acima do cap é preservada, mas bônus não empurram além", () => {
    const result = calculateFinalAttributes(baseAttributes({ forca: 22 }), { forca: 2 });
    expect(result.forca).toBe(22);
  });

  it("capOverrides permite cap 30 para Epic Boons", () => {
    const result = calculateFinalAttributes(
      baseAttributes({ forca: 20 }),
      { forca: 2 },
      { forca: EPIC_BOON_ABILITY_CAP },
    );
    expect(result.forca).toBe(22);
  });

  it("não altera atributos sem bônus", () => {
    const result = calculateFinalAttributes(baseAttributes(), {});
    expect(result).toEqual(baseAttributes());
  });
});

describe("calculateMaxHitPoints (level-aware)", () => {
  it("matches the level-1 value for level 1", () => {

    expect(calculateMaxHitPoints(10, 14, 1)).toBe(12);
    expect(calculateMaxHitPoints(10, 14, 1)).toBe(
      calculateInitialHitPoints(10, 14),
    );
  });

  it("adds the fixed average per level after the first", () => {


    expect(calculateMaxHitPoints(10, 14, 3)).toBe(28);
  });

  it("uses the correct fixed average for each hit die", () => {

    expect(calculateMaxHitPoints(6, 10, 2)).toBe(6 + 4);
    expect(calculateMaxHitPoints(8, 10, 2)).toBe(8 + 5);
    expect(calculateMaxHitPoints(12, 10, 2)).toBe(12 + 7);
  });

  it("applies a negative Constitution modifier to every level", () => {


    expect(calculateMaxHitPoints(8, 8, 3)).toBe(15);
  });

  it("clamps a level below 1 to a single hit die", () => {
    expect(calculateMaxHitPoints(10, 14, 0)).toBe(12);
  });
});

describe("getMaxHitPointsBreakdown", () => {
  it("parts always sum to calculateMaxHitPoints (d10, CON 14, level 5)", () => {
    const parts = getMaxHitPointsBreakdown(10, 14, 5);
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    expect(total).toBe(calculateMaxHitPoints(10, 14, 5));
    expect(parts).toEqual([
      { label: "Level 1 (d10)", value: 10 },
      { label: "Levels 2-5 (4 x 6)", value: 24 },
      { label: "CON (+2 x 5)", value: 10 },
    ]);
  });

  it("level 1 with CON mod 0 has only the hit-die part", () => {
    expect(getMaxHitPointsBreakdown(8, 10, 1)).toEqual([
      { label: "Level 1 (d8)", value: 8 },
    ]);
  });

  it("negative CON modifier appears as a negative part", () => {
    const parts = getMaxHitPointsBreakdown(8, 8, 3);
    expect(parts.reduce((sum, part) => sum + part.value, 0)).toBe(
      calculateMaxHitPoints(8, 8, 3),
    );
    expect(parts[2]).toEqual({ label: "CON (-1 x 3)", value: -3 });
  });
});
