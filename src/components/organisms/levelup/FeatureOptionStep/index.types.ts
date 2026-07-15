import type { BuilderChoiceOption } from "@/src/types/builder";

export interface FeatureOptionStepProps {
  level: number;
  featureName: string;
  count: number;
  options: BuilderChoiceOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}
