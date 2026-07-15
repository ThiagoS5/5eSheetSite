import type { BuilderSubclass } from "@/src/types/builder";

export interface SubclassStepProps {
  level: number;
  className: string;
  subclasses: BuilderSubclass[];
  selectedSubclassId: string;
  /** Closes the modal before navigating to the Class > Subclass screen. */
  onNavigateToSubclassScreen: () => void;
}
