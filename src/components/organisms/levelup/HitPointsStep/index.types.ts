import type { HpRollChoice } from "@/src/types/characterBuild";

export interface HitPointsStepProps {
  hitDie: number;
  targetLevel: number;
  conModifier: number;
  onChoose: (roll: HpRollChoice) => void;
  rollFn?: () => number;
}
