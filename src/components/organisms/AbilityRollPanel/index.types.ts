import type { AbilityRoll } from "@/rules/abilityRollRules";
import type { CharacterAttributes } from "@/src/types/dnd";

export interface AbilityRollPanelProps {
  onApply: (scores: CharacterAttributes) => void;
  rollFn?: () => AbilityRoll[];
}
