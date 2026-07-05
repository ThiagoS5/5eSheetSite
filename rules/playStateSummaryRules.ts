import { createDefaultPlayState, normalizePlayState } from "@/rules/restRules";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

export function deriveEffectivePlayState(input: {
  state: CharacterBuilderState;
  maxHitPoints: number;
  armorClass: number;
}) {
  const rawPlayState =
    input.state.playState ?? createDefaultPlayState(input.maxHitPoints);
  const effectiveMaxHitPoints =
    rawPlayState.overrides.maxHp ?? input.maxHitPoints;
  const effectiveArmorClass =
    rawPlayState.overrides.armorClass ?? input.armorClass;

  return {
    maxHitPoints: effectiveMaxHitPoints,
    armorClass: effectiveArmorClass,
    playState: normalizePlayState(rawPlayState, effectiveMaxHitPoints),
  };
}
