import type {
  BuilderChoiceOption,
  BuilderClass,
  BuilderFeat,
  SheetFeature,
} from "@/src/types/builder";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";


export const ASI_FEATURE_NAME = "Ability Score Improvement";

export type LevelChoiceRequirement =
  | { id: string; kind: "subclass"; level: number }
  | { id: string; kind: "asi-or-feat"; level: number }
  | {
      id: string;
      kind: "feature-option";
      level: number;
      featureName: string;
      count: number;
      options: BuilderChoiceOption[];
    };


export function getLevelRequirements(
  characterClass: BuilderClass,
  fromLevel: number,
  toLevel: number,
): LevelChoiceRequirement[] {
  const inRange = (level: number) => level > fromLevel && level <= toLevel;
  const requirements: LevelChoiceRequirement[] = [];


  const subclassLevels = characterClass.allFeatures
    .filter((f) => f.grantsSubclass)
    .map((f) => f.level ?? 0)
    .filter((level) => level > 0);
  if (subclassLevels.length > 0) {
    const selectionLevel = Math.min(...subclassLevels);
    if (inRange(selectionLevel)) {
      requirements.push({
        id: `subclass-${selectionLevel}`,
        kind: "subclass",
        level: selectionLevel,
      });
    }
  }

  // ASI / feat: one per ASI feature occurrence within range.
  for (const feature of characterClass.allFeatures) {
    if (feature.name === ASI_FEATURE_NAME && inRange(feature.level ?? 0)) {
      requirements.push({
        id: `asi-${feature.level}`,
        kind: "asi-or-feat",
        level: feature.level ?? 0,
      });
    }
  }

  // Feature-options: existing class choice groups, placed at their feature level.
  for (const group of characterClass.featureChoiceGroups ?? []) {
    const level =
      characterClass.allFeatures.find((f) => f.name === group.featureName)
        ?.level ?? 1;
    if (inRange(level)) {
      requirements.push({
        id: group.id,
        kind: "feature-option",
        level,
        featureName: group.featureName,
        count: group.count,
        options: group.options,
      });
    }
  }

  return requirements.sort((a, b) => a.level - b.level);
}

/** Feats picked on ASI-or-feat levels, as sheet features (mechanics apply elsewhere). */
export function deriveChosenFeatSummaries(
  asiOrFeatByLevel: Record<number, AsiOrFeatChoice>,
  characterLevel: number,
  feats: readonly BuilderFeat[],
): SheetFeature[] {
  return Object.entries(asiOrFeatByLevel)
    .filter(([level, choice]) => Number(level) <= characterLevel && choice.mode === "feat")
    .sort(([a], [b]) => Number(a) - Number(b))
    .flatMap(([, choice]) => {
      if (choice.mode !== "feat") return [];
      const feat = feats.find((entry) => entry.id === choice.featId);
      if (!feat) return [];
      return [{ name: feat.name, description: feat.description, source: "feat" as const }];
    });
}
