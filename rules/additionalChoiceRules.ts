import type { BuilderFeat, CharacterSheetSummary, SheetFeature } from "@/src/types/builder";
import type { CharacterBuildAdditionalChoices } from "@/src/types/characterBuild";

export function mergeAdditionalSenses(
  base: CharacterSheetSummary["senses"],
  additional: CharacterSheetSummary["senses"],
): CharacterSheetSummary["senses"] {
  const senses = new Map<string, CharacterSheetSummary["senses"][number]>();

  for (const sense of [...base, ...additional]) {
    const key = sense.name.trim().toLowerCase();
    const current = senses.get(key);
    if (!current || (sense.rangeFeet ?? 0) > (current.rangeFeet ?? 0)) {
      senses.set(key, sense);
    }
  }

  return [...senses.values()];
}

export function deriveAdditionalFeatureSummaries(
  additional: CharacterBuildAdditionalChoices,
  feats: BuilderFeat[],
): SheetFeature[] {
  const featById = new Map(feats.map((feat) => [feat.id, feat]));
  const featSummaries = additional.featIds.flatMap((featId) => {
    const feat = featById.get(featId);
    return feat
      ? [{ name: feat.name, description: feat.description ?? "", source: "feat" as const }]
      : [];
  });

  return [
    ...featSummaries,
    ...additional.customFeatures.map((feature) => ({
      name: feature.name,
      description: feature.description,
      source: "custom" as const,
    })),
  ];
}
