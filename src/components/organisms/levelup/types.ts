import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderChoiceOption, BuilderFeat, BuilderSubclass } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";

export interface SubclassStepProps {
  level: number;
  className: string;
  subclasses: BuilderSubclass[];
  selectedSubclassId: string;
  /** Fecha o modal antes de navegar para a tela Class › Subclass. */
  onNavigateToSubclassScreen: () => void;
}

export interface FeatureOptionStepProps {
  level: number;
  featureName: string;
  count: number;
  options: BuilderChoiceOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export interface AsiAttribute {
  key: AttributeKey;
  label: string;
  current: number;
}

export interface AsiOrFeatStepProps {
  level: number;
  attributes: AsiAttribute[];
  selectableFeats: BuilderFeat[];
  blockedFeats?: Array<{ feat: BuilderFeat; reason: string }>;
  value: AsiOrFeatChoice | undefined;
  onChange: (choice: AsiOrFeatChoice | undefined) => void;
}
