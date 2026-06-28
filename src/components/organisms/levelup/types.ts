import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderChoiceOption, BuilderFeat, BuilderSubclass } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";

export interface SubclassStepProps {
  level: number;
  subclasses: BuilderSubclass[];
  selectedSubclassId: string;
  onSelect: (subclassId: string) => void;
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
  value: AsiOrFeatChoice | undefined;
  onChange: (choice: AsiOrFeatChoice | undefined) => void;
}
