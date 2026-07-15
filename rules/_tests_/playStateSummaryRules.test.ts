import { describe, expect, it } from "vitest";
import { deriveEffectivePlayState } from "@/rules/playStateSummaryRules";
import { createDefaultPlayState } from "@/rules/restRules";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

function baseState(): CharacterBuilderState {
  return createCharacterStore().getState();
}

describe("deriveEffectivePlayState", () => {
  it("creates a full-health default play state when none exists", () => {
    const result = deriveEffectivePlayState({
      state: { ...baseState(), playState: undefined },
      maxHitPoints: 12,
      armorClass: 14,
    });

    expect(result.maxHitPoints).toBe(12);
    expect(result.armorClass).toBe(14);
    expect(result.playState.currentHp).toBe(12);
    expect(result.playState.tempHp).toBe(0);
  });

  it("prefers manual max HP and AC overrides over the derived values", () => {
    const playState = createDefaultPlayState(12);
    playState.overrides = { maxHp: 20, armorClass: 18 };

    const result = deriveEffectivePlayState({
      state: { ...baseState(), playState },
      maxHitPoints: 12,
      armorClass: 14,
    });

    expect(result.maxHitPoints).toBe(20);
    expect(result.armorClass).toBe(18);
  });

  it("clamps current HP to the effective max when the override lowers it", () => {
    const playState = createDefaultPlayState(30);
    playState.currentHp = 30;
    playState.overrides = { maxHp: 10 };

    const result = deriveEffectivePlayState({
      state: { ...baseState(), playState },
      maxHitPoints: 30,
      armorClass: 14,
    });

    expect(result.maxHitPoints).toBe(10);
    expect(result.playState.currentHp).toBe(10);
  });

  it("keeps stored play-state progress (damage, temp HP) when no override exists", () => {
    const playState = createDefaultPlayState(25);
    playState.currentHp = 7;
    playState.tempHp = 5;

    const result = deriveEffectivePlayState({
      state: { ...baseState(), playState },
      maxHitPoints: 25,
      armorClass: 16,
    });

    expect(result.playState.currentHp).toBe(7);
    expect(result.playState.tempHp).toBe(5);
    expect(result.armorClass).toBe(16);
  });
});
