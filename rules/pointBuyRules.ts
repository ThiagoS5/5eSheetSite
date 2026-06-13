import type { AttributeKey, CharacterAttributes } from "@/types/dnd";

export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN_SCORE = 8;
export const POINT_BUY_MAX_SCORE = 15;

export const POINT_BUY_COST_BY_SCORE: Readonly<Record<number, number>> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function isValidPointBuyScore(score: number): boolean {
  return (
    Number.isInteger(score) &&
    score >= POINT_BUY_MIN_SCORE &&
    score <= POINT_BUY_MAX_SCORE
  );
}

export function getPointBuyCost(score: number): number {
  return POINT_BUY_COST_BY_SCORE[score] ?? Number.POSITIVE_INFINITY;
}

export function getPointBuySpent(attributes: CharacterAttributes): number {
  return (Object.keys(attributes) as AttributeKey[]).reduce(
    (total, attribute) => total + getPointBuyCost(attributes[attribute]),
    0,
  );
}

export function getPointBuyRemaining(attributes: CharacterAttributes): number {
  return POINT_BUY_BUDGET - getPointBuySpent(attributes);
}

export function isPointBuyComplete(attributes: CharacterAttributes): boolean {
  return (
    Object.values(attributes).every(isValidPointBuyScore) &&
    getPointBuySpent(attributes) === POINT_BUY_BUDGET
  );
}

export function getPointBuyMarginalIncreaseCost(score: number): number | null {
  if (!isValidPointBuyScore(score) || score >= POINT_BUY_MAX_SCORE) {
    return null;
  }

  return getPointBuyCost(score + 1) - getPointBuyCost(score);
}

export function canIncreasePointBuyAttribute(
  attributes: CharacterAttributes,
  attribute: AttributeKey,
): boolean {
  const currentScore = attributes[attribute];
  const marginalCost = getPointBuyMarginalIncreaseCost(currentScore);

  return marginalCost !== null && marginalCost <= getPointBuyRemaining(attributes);
}

export function canDecreasePointBuyAttribute(
  attributes: CharacterAttributes,
  attribute: AttributeKey,
): boolean {
  return attributes[attribute] > POINT_BUY_MIN_SCORE;
}

export function increasePointBuyAttribute(
  attributes: CharacterAttributes,
  attribute: AttributeKey,
): CharacterAttributes {
  if (!canIncreasePointBuyAttribute(attributes, attribute)) {
    return attributes;
  }

  return {
    ...attributes,
    [attribute]: attributes[attribute] + 1,
  };
}

export function decreasePointBuyAttribute(
  attributes: CharacterAttributes,
  attribute: AttributeKey,
): CharacterAttributes {
  if (!canDecreasePointBuyAttribute(attributes, attribute)) {
    return attributes;
  }

  return {
    ...attributes,
    [attribute]: attributes[attribute] - 1,
  };
}
