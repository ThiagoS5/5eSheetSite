import type { ReactNode } from "react";

export interface HeroChoiceBadge {
  label: string;
  title?: string;
}

export interface HeroChoiceTheme {
  /** Cor base do card (fundo do banner, gradiente e badges). */
  theme: string;
  /** Cor de destaque (borda das badges). */
  accent: string;
}

export interface HeroChoiceCardProps {
  title: string;
  badges: Array<string | HeroChoiceBadge>;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  /** background-size da arte no card (default "cover"). */
  imageSize?: string;
  /** background-position da arte no card (default "top"). */
  imagePosition?: string;
  icon?: ReactNode;
  theme?: HeroChoiceTheme;
  isActive: boolean;
  disabled?: boolean;
  onClickDetails: () => void;
  onClickSelect: () => void;
  detailsLabel?: string;
  selectLabel?: string;
  selectedLabel?: string;
  children?: ReactNode;
}
