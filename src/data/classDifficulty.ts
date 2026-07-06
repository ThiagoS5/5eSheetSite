
export type ClassDifficulty = "facil" | "medio" | "dificil";

export const CLASS_DIFFICULTY_LABELS: Record<ClassDifficulty, string> = {
  facil: "Easy",
  medio: "Moderate",
  dificil: "Advanced",
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


export function getClassDifficulty(classId: string): ClassDifficulty | undefined {
  return CLASS_DIFFICULTY[classId];
}
