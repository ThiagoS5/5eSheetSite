import type { PersonalDetailsRecommendations } from "@/src/data/personalDetailsRecommendations";

/**
 * Nome aleatório por espécie (master plan §28.2 nº 7). Reusa o pool de
 * `personalDetailsRecommendations` (nomes por espécie emoldurados pelo
 * antecedente); rng injetável para teste determinístico — padrão de
 * `rules/abilityRollRules.ts`.
 */
export function generateRandomName(
  recommendations: PersonalDetailsRecommendations,
  random: () => number = Math.random,
): string {
  const pool = recommendations.names;

  if (pool.length === 0) {
    return "";
  }

  const index = Math.min(
    pool.length - 1,
    Math.floor(random() * pool.length),
  );

  return pool[index] ?? "";
}
