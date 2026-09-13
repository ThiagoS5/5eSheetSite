import type { CharacterBuildPlayState } from "@/src/types/characterBuild";
import type { SheetResource } from "@/src/types/builder";
import { recoverClassResources } from "@/rules/classResourceRules";

export function createDefaultPlayState(maxHp = 0): CharacterBuildPlayState {
  return {
    currentHp: Math.max(0, maxHp),
    tempHp: 0,
    hitDiceSpent: 0,
    usedSpellSlots: {},
    resourceUses: {},
    resourceRecoveries: {},
    deathSaves: { successes: 0, failures: 0 },
    inspiration: false,
    conditions: [],
    campaignLog: [],
    overrides: {},
  };
}

export function applyDamageToPlayState(
  state: CharacterBuildPlayState,
  input: { amount: number; maxHp: number },
): CharacterBuildPlayState {
  const amount = Math.max(0, input.amount);
  const tempDamage = Math.min(state.tempHp, amount);
  const remainingDamage = amount - tempDamage;

  return normalizePlayState(
    {
      ...state,
      tempHp: state.tempHp - tempDamage,
      currentHp: state.currentHp - remainingDamage,
    },
    input.maxHp,
  );
}

export function applyHealingToPlayState(
  state: CharacterBuildPlayState,
  input: { amount: number; maxHp: number },
): CharacterBuildPlayState {
  return normalizePlayState(
    {
      ...state,
      currentHp: state.currentHp + Math.max(0, input.amount),
      deathSaves: input.amount > 0 && input.maxHp > state.currentHp
        ? { successes: 0, failures: 0 } : state.deathSaves,
    },
    input.maxHp,
  );
}

export function setTemporaryHitPointsInPlayState(
  state: CharacterBuildPlayState,
  input: { amount: number; maxHp: number },
): CharacterBuildPlayState {
  return normalizePlayState(
    { ...state, tempHp: Math.max(state.tempHp, input.amount, 0) },
    input.maxHp,
  );
}

export function spendSpellSlotInPlayState(
  state: CharacterBuildPlayState,
  input: { slotLevel: number; availableSlots: Record<number, number> },
): CharacterBuildPlayState {
  const total = Math.max(0, input.availableSlots[input.slotLevel] ?? 0);
  const current = Math.max(0, state.usedSpellSlots[input.slotLevel] ?? 0);
  return {
    ...state,
    usedSpellSlots: {
      ...state.usedSpellSlots,
      [input.slotLevel]: Math.min(total, current + 1),
    },
  };
}

export function applyShortRestToPlayState(
  state: CharacterBuildPlayState,
  input: {
    maxHp: number;
    hitDieValue: number;
    constitutionModifier: number;
    hitDiceToSpend: number;
    totalHitDice: number;
    recoverSpellSlots?: boolean;
    rolledHitDice?: readonly number[];
    resources?: readonly SheetResource[];
  },
): CharacterBuildPlayState {
  if (state.currentHp <= 0) return state;
  const availableHitDice = Math.max(0, input.totalHitDice - state.hitDiceSpent);
  const hitDiceSpent = Math.min(
    availableHitDice,
    Math.max(0, Math.trunc(input.hitDiceToSpend)),
  );
  const healing = Array.from({ length: hitDiceSpent }, (_, index) =>
    Math.max(1, (input.rolledHitDice?.[index] ?? input.hitDieValue) + input.constitutionModifier),
  ).reduce((sum, value) => sum + value, 0);

  return normalizePlayState(
    {
      ...state,
      currentHp: state.currentHp + healing,
      hitDiceSpent: state.hitDiceSpent + hitDiceSpent,
      usedSpellSlots: input.recoverSpellSlots ? {} : state.usedSpellSlots,
      resourceUses: recoverClassResources({
        ...recoverRestResources(state, "shortRest"),
        ...Object.fromEntries((input.resources ?? []).filter((resource) => state.resourceUses[resource.id] !== undefined).map((resource) => [resource.id, state.resourceUses[resource.id]])),
      }, input.resources ?? []),
    },
    input.maxHp,
  );
}

export function applyLongRestToPlayState(
  state: CharacterBuildPlayState,
  input: { maxHp: number },
): CharacterBuildPlayState {
  if (state.currentHp <= 0) return state;
  return normalizePlayState(
    {
      ...state,
      currentHp: Math.max(0, input.maxHp),
      tempHp: 0,
      hitDiceSpent: 0,
      usedSpellSlots: {},
      resourceUses: {},
      resourceRecoveries: {},
      deathSaves: { successes: 0, failures: 0 },
    },
    input.maxHp,
  );
}

export function toggleConditionInPlayState(
  state: CharacterBuildPlayState,
  condition: string,
): CharacterBuildPlayState {
  const conditions = state.conditions.includes(condition)
    ? state.conditions.filter((entry) => entry !== condition)
    : [...state.conditions, condition];

  return { ...state, conditions };
}

export function normalizePlayState(
  state: CharacterBuildPlayState,
  maxHp: number,
): CharacterBuildPlayState {
  const normalizedMax = Math.max(0, maxHp);
  const tempHp = Math.max(0, state.tempHp);

  return {
    ...state,
    campaignLog: [...(state.campaignLog ?? [])],
    currentHp: Math.min(normalizedMax, Math.max(0, state.currentHp)),
    tempHp,
    hitDiceSpent: Math.max(0, state.hitDiceSpent),
    deathSaves: {
      successes: clampDeathSave(state.deathSaves.successes),
      failures: clampDeathSave(state.deathSaves.failures),
    },
  };
}

function clampDeathSave(value: number): number {
  return Math.min(3, Math.max(0, Math.trunc(value)));
}

function recoverRestResources(
  state: CharacterBuildPlayState,
  recovery: "shortRest" | "longRest",
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(state.resourceUses).filter(
      ([resourceId]) => state.resourceRecoveries[resourceId] !== recovery,
    ),
  );
}
