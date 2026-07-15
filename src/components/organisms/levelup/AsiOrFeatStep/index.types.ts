import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderFeat } from "@/src/types/builder";
import type { AsiAttribute } from "@/src/components/organisms/levelup/types";

export interface AsiOrFeatStepProps {
  level: number;
  attributes: AsiAttribute[];
  selectableFeats: BuilderFeat[];
  blockedFeats?: Array<{ feat: BuilderFeat; reason: string }>;
  value: AsiOrFeatChoice | undefined;
  onChange: (choice: AsiOrFeatChoice | undefined) => void;
}
