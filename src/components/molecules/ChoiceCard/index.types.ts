import type { ReactNode } from "react";

export interface ChoiceCardProps {
  title: string;
  eyebrow?: string;
  selected: boolean;
  disabled?: boolean;
  actionLabel?: string;
  showDefaultAction?: boolean;
  footer?: ReactNode;
  onSelect: () => void;
  children: ReactNode;
}
