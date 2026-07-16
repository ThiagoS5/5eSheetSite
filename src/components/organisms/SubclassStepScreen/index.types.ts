import type { BuilderClass } from "@/src/types/builder";

export interface SubclassStepScreenProps {
  characterClass?: BuilderClass;
  level: number;
  selectedSubclassId: string;
  activeSources?: readonly string[];
  disabled: boolean;
  onSelect: (subclassId: string) => void;
}
