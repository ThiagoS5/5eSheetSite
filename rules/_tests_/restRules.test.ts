import { describe, expect, it } from "vitest";
import {
  applyDamageToPlayState,
  applyHealingToPlayState,
  applyLongRestToPlayState,
  applyShortRestToPlayState,
  spendSpellSlotInPlayState,
  toggleConditionInPlayState,
} from "@/rules/restRules";
import type { CharacterBuildPlayState } from "@/src/types/characterBuild";

const playState = (overrides: Partial<CharacterBuildPlayState> = {}): CharacterBuildPlayState => ({
  currentHp: 20,
  tempHp: 0,
  hitDiceSpent: 0,
  usedSpellSlots: {},
  resourceUses: {},
  resourceRecoveries: {},
  deathSaves: { successes: 0, failures: 0 },
  inspiration: false,
  conditions: [],
  overrides: {},
  ...overrides,
});

describe("rest rules", () => {
  it("clamps damage, healing, and temporary HP to valid table values", () => {
    const damaged = applyDamageToPlayState(playState({ tempHp: 5 }), {
      amount: 12,
      maxHp: 20,
    });
    expect(damaged).toMatchObject({ currentHp: 13, tempHp: 0 });

    const dropped = applyDamageToPlayState(damaged, { amount: 99, maxHp: 20 });
    expect(dropped.currentHp).toBe(0);

    const healed = applyHealingToPlayState(dropped, { amount: 99, maxHp: 20 });
    expect(healed.currentHp).toBe(20);
  });

  it("tracks spent slots and resets them on a long rest", () => {
    const spent = spendSpellSlotInPlayState(playState(), {
      slotLevel: 1,
      availableSlots: { 1: 2 },
    });
    expect(spent.usedSpellSlots[1]).toBe(1);

    const capped = spendSpellSlotInPlayState(spent, {
      slotLevel: 1,
      availableSlots: { 1: 2 },
    });
    expect(capped.usedSpellSlots[1]).toBe(2);
    expect(
      spendSpellSlotInPlayState(capped, {
        slotLevel: 1,
        availableSlots: { 1: 2 },
      }).usedSpellSlots[1],
    ).toBe(2);

    expect(applyLongRestToPlayState(capped, { maxHp: 20 })).toMatchObject({
      currentHp: 20,
      tempHp: 0,
      hitDiceSpent: 0,
      usedSpellSlots: {},
      resourceUses: {},
      resourceRecoveries: {},
      deathSaves: { successes: 0, failures: 0 },
    });
  });

  it("spends hit dice on short rest and persists conditions as toggles", () => {
    const rested = applyShortRestToPlayState(playState({ currentHp: 5 }), {
      maxHp: 20,
      hitDieValue: 8,
      constitutionModifier: 2,
      hitDiceToSpend: 2,
      totalHitDice: 3,
    });

    expect(rested.currentHp).toBe(20);
    expect(rested.hitDiceSpent).toBe(2);

    const prone = toggleConditionInPlayState(rested, "Prone");
    expect(prone.conditions).toEqual(["Prone"]);
    expect(toggleConditionInPlayState(prone, "Prone").conditions).toEqual([]);
  });

  it("recovers short-rest resources on short rests and all resources on long rests", () => {
    const rested = applyShortRestToPlayState(
      playState({
        resourceUses: { "second-wind": 1, "indomitable": 1 },
        resourceRecoveries: {
          "second-wind": "shortRest",
          indomitable: "longRest",
        },
      }),
      {
        maxHp: 20,
        hitDieValue: 10,
        constitutionModifier: 0,
        hitDiceToSpend: 0,
        totalHitDice: 1,
        recoverSpellSlots: false,
      },
    );

    expect(rested.resourceUses).toEqual({ indomitable: 1 });
    expect(rested.resourceRecoveries).toEqual({
      "second-wind": "shortRest",
      indomitable: "longRest",
    });

    expect(applyLongRestToPlayState(rested, { maxHp: 20 })).toMatchObject({
      resourceUses: {},
      resourceRecoveries: {},
    });
  });

  it("recovers pact magic spell slots on a short rest", () => {
    const rested = applyShortRestToPlayState(
      playState({ usedSpellSlots: { 3: 2 } }),
      {
        maxHp: 20,
        hitDieValue: 8,
        constitutionModifier: 0,
        hitDiceToSpend: 0,
        totalHitDice: 1,
        recoverSpellSlots: true,
      },
    );

    expect(rested.usedSpellSlots).toEqual({});
  });
});
