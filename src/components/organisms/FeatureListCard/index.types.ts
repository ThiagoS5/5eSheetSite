import type { BuilderFeature } from "@/src/types/builder";

export interface FeatureListCardProps {
  title: string;
  features: BuilderFeature[];
  emptyLabel: string;
}
