export interface AbilityRoll {
  dice: [number, number, number, number];
  dropped: number;
  total: number;
}

/** PRNG mulberry32 — determinístico por seed, suficiente para rolagem de dados (decisão §26.2: sem seedrandom). */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rollDie(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

export function rollAbilityScore(rng: () => number): AbilityRoll {
  const dice: [number, number, number, number] = [
    rollDie(rng), rollDie(rng), rollDie(rng), rollDie(rng),
  ];
  const dropped = Math.min(...dice);
  const total = dice.reduce((sum, die) => sum + die, 0) - dropped;
  return { dice, dropped, total };
}

export function rollAbilityScoreSet(
  rng: () => number = Math.random,
): AbilityRoll[] {
  return Array.from({ length: 6 }, () => rollAbilityScore(rng));
}
