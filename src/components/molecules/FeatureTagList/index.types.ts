import type { BuilderFeature } from "@/src/types/builder";

export interface FeatureTagListProps {
  features: readonly BuilderFeature[];
  emptyLabel: string;
  ariaLabel?: string;
}
