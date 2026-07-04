/**
 * Curadoria de dificuldade das classes para o filtro do builder. A dificuldade
 * reflete o quão complexo é jogar a classe na mesa (número de recursos ativos,
 * gestão de magias/recursos, decisões por turno) — não o poder relativo.
 *
 * A chave é o slug `${nome}-${fonte}` (igual ao `toSlug` do adapter). O
 * Artificer (EFA) não estava na especificação original e foi classificado como
 * `medio` por ser um conjurador preparado de complexidade intermediária.
 */
export type ClassDifficulty = "facil" | "medio" | "dificil";

export const CLASS_DIFFICULTY_LABELS: Record<ClassDifficulty, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const CLASS_DIFFICULTY: Record<string, ClassDifficulty> = {
  "fighter-xphb": "facil",
  "rogue-xphb": "facil",

  "barbarian-xphb": "medio",
  "cleric-xphb": "medio",
  "paladin-xphb": "medio",
  "ranger-xphb": "medio",
  "wizard-xphb": "medio",
  "artificer-efa": "medio",

  "bard-xphb": "dificil",
  "druid-xphb": "dificil",
  "monk-xphb": "dificil",
  "sorcerer-xphb": "dificil",
  "warlock-xphb": "dificil",
};

/** Dificuldade curada da classe, ou `undefined` se não classificada. */
export function getClassDifficulty(classId: string): ClassDifficulty | undefined {
  return CLASS_DIFFICULTY[classId];
}
