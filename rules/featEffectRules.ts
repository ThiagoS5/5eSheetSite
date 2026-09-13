import { getFeats } from "@/src/services/ruleService";
import { applyFeatEffects, createEmptyAppliedFeatEffects, type AppliedFeatEffects } from "@/src/adapters/featCatalog";
import type { BuilderBackground } from "@/src/types/builder";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { AttributeKey } from "@/src/types/dnd";

export function resolveOriginFeat(background: BuilderBackground | undefined) {
  if (!background?.originFeat) return undefined;
  const feats = getFeats();
  const originName = background.originFeat;
  const baseName = originName.replace(/\s*\(.+\)\s*$/, "");
  return feats.find((feat) => feat.name === originName && feat.source === "XPHB") ??
    feats.find((feat) => feat.name === baseName && feat.source === "XPHB") ??
    feats.find((feat) => feat.name === originName) ?? feats.find((feat) => feat.name === baseName);
}

export function deriveFeatEffects(state: CharacterBuilderState, background: BuilderBackground | undefined): AppliedFeatEffects {
  const feats = getFeats();
  let effects = createEmptyAppliedFeatEffects();
  const appliedIds = new Set<string>();
  const originFeat = resolveOriginFeat(background);
  if (originFeat) {
    effects = applyFeatEffects(effects, originFeat);
    appliedIds.add(originFeat.id);
  }
  for (const [level, choice] of Object.entries(state.asiOrFeatByLevel)) {
    if (Number(level) > state.level || choice.mode !== "feat") continue;
    const feat = feats.find((entry) => entry.id === choice.featId);
    if (!feat || (!feat.repeatable && appliedIds.has(feat.id))) continue;
    appliedIds.add(feat.id);
    // General half-feat increases are already collected by collectAsiBonuses.
    effects = applyFeatEffects(effects, feat, feat.category === "epic-boon" ? choice : { ...choice, asi: undefined });
  }
  for (const featId of state.additionalChoices.featIds) {
    const feat = feats.find((entry) => entry.id === featId);
    if (!feat || (!feat.repeatable && appliedIds.has(feat.id))) continue;
    appliedIds.add(feat.id);
    effects = applyFeatEffects(effects, feat);
  }
  return effects;
}

export function deriveFeatSavingThrows(state: CharacterBuilderState): AttributeKey[] {
  return Object.entries(state.asiOrFeatByLevel).flatMap(([level, choice]) => {
    if (Number(level) > state.level || choice.mode !== "feat" || choice.featId !== "resilient-xphb") return [];
    return (Object.entries(choice.asi ?? {}) as [AttributeKey, number][]).filter(([, amount]) => amount === 1).map(([key]) => key);
  });
}
