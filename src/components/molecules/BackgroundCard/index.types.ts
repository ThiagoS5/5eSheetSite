import type { BuilderBackground } from "@/src/types/builder";
import type { AttributeBonuses } from "@/src/types/dnd";

export interface BackgroundCardProps {
  background: BuilderBackground;
  selected: boolean;
  selectedBonuses: AttributeBonuses;
  disabled: boolean;
  onSelect: () => void;
  onBonusesChange: (bonuses: AttributeBonuses) => void;
  onCommit: () => void;
}
