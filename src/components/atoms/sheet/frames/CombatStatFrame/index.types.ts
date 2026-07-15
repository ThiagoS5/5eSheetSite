import type { ReactNode } from "react";

export type CombatFrameVariant = "shield" | "square";

export interface CombatStatFrameProps {
  children: ReactNode;
  variant: CombatFrameVariant;
  accentColor?: string;
}
