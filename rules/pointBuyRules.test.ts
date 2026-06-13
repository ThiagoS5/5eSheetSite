import { describe, expect, it } from "vitest";
import {
  POINT_BUY_BUDGET,
  POINT_BUY_COST_BY_SCORE,
  canDecreasePointBuyAttribute,
  canIncreasePointBuyAttribute,
  getPointBuyMarginalIncreaseCost,
  getPointBuyRemaining,
  getPointBuySpent,
  increasePointBuyAttribute,
  isPointBuyComplete,
  isValidPointBuyScore,
} from "@/rules/pointBuyRules";
import type { CharacterAttributes } from "@/types/dnd";

const baseAttributes: CharacterAttributes = {
  forca: 8,
  destreza: 8,
  constituicao: 8,
  inteligencia: 8,
  sabedoria: 8,
  carisma: 8,
};

describe("point buy rules", () => {
  it("uses the official 27 point budget and score cost table", () => {
    expect(POINT_BUY_BUDGET).toBe(27);
    expect(POINT_BUY_COST_BY_SCORE).toStrictEqual({
      8: 0,
      9: 1,
      10: 2,
      11: 3,
      12: 4,
      13: 5,
      14: 7,
      15: 9,
    });
  });

  it("calculates total spent and remaining without background bonuses", () => {
    const attributes: CharacterAttributes = {
      ...baseAttributes,
      forca: 15,
      destreza: 15,
      constituicao: 15,
    };

    expect(getPointBuySpent(attributes)).toBe(27);
    expect(getPointBuyRemaining(attributes)).toBe(0);
    expect(isPointBuyComplete(attributes)).toBe(true);
  });

  it("enforces the 8 to 15 point buy score range", () => {
    expect(isValidPointBuyScore(7)).toBe(false);
    expect(isValidPointBuyScore(8)).toBe(true);
    expect(isValidPointBuyScore(15)).toBe(true);
    expect(isValidPointBuyScore(16)).toBe(false);
  });

  it("uses progressive marginal costs for score increases", () => {
    expect(getPointBuyMarginalIncreaseCost(12)).toBe(1);
    expect(getPointBuyMarginalIncreaseCost(13)).toBe(2);
    expect(getPointBuyMarginalIncreaseCost(14)).toBe(2);
    expect(getPointBuyMarginalIncreaseCost(15)).toBeNull();
  });

  it("blocks increases above 15 or beyond remaining budget", () => {
    const nearlyComplete: CharacterAttributes = {
      ...baseAttributes,
      forca: 15,
      destreza: 15,
      constituicao: 14,
      inteligencia: 9,
    };

    expect(canIncreasePointBuyAttribute(nearlyComplete, "forca")).toBe(false);
    expect(canIncreasePointBuyAttribute(nearlyComplete, "constituicao")).toBe(false);
    expect(canDecreasePointBuyAttribute(nearlyComplete, "sabedoria")).toBe(false);
    expect(canDecreasePointBuyAttribute(nearlyComplete, "inteligencia")).toBe(true);
  });

  it("returns a new attribute object when increasing a score", () => {
    const result = increasePointBuyAttribute(baseAttributes, "forca");

    expect(result).not.toBe(baseAttributes);
    expect(result.forca).toBe(9);
    expect(baseAttributes.forca).toBe(8);
  });
});
