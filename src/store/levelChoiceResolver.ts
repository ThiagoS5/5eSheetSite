import { getLevelRequirements } from "@/rules/levelProgression";
import { getSubclassesForClass } from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderClass, BuilderFeature } from "@/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/types/dnd";

export interface UnresolvedChoice {
  level: number;
  kind: "subclass" | "asi-or-feat" | "feature-option";
  label: string;
}

function addBonuses(target: AttributeBonuses, source: AttributeBonuses | undefined): void {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "number") {
      target[key as AttributeKey] = (target[key as AttributeKey] ?? 0) + value;
    }
  }
}

/** Sum of ASI + half-feat ability bonuses for all levels <= current level. */
export function collectAsiBonuses(state: CharacterBuilderState): AttributeBonuses {
  const bonuses: AttributeBonuses = {};
  for (const [level, choice] of Object.entries(state.asiOrFeatByLevel)) {
    if (Number(level) > state.level) continue;
    if (choice.mode === "asi") {
      addBonuses(bonuses, choice.increases);
    } else {
      addBonuses(bonuses, choice.asi);
    }
  }
  return bonuses;
}

function isValidAsi(choice: AsiOrFeatChoice): boolean {
  if (choice.mode !== "asi") return false;
  const values = Object.values(choice.increases);
  return (
    values.length > 0 &&
    values.every((v) => v === 1 || v === 2) &&
    values.reduce((sum, v) => sum + v, 0) === 2
  );
}

/** Subclass features unlocked up to the current level for the selected subclass. */
export function getActiveSubclassFeatures(
  state: CharacterBuilderState,
  characterClass: BuilderClass,
): BuilderFeature[] {
  if (!state.selectedSubclassId) return [];
  const subclass = characterClass.subclasses.find(
    (s) => s.id === state.selectedSubclassId,
  );
  if (!subclass) return [];
  return subclass.features.filter((f) => (f.level ?? 1) <= state.level);
}

/** Which level choices (1..currentLevel) are still missing or invalid. */
export function getUnresolvedLevelChoices(
  state: CharacterBuilderState,
  characterClass: BuilderClass,
): UnresolvedChoice[] {
  const requirements = getLevelRequirements(characterClass, 0, state.level);
  const validSubclassIds = new Set(
    getSubclassesForClass(characterClass.id).map((s) => s.id),
  );
  const unresolved: UnresolvedChoice[] = [];

  for (const req of requirements) {
    if (req.kind === "subclass") {
      const ok =
        state.selectedSubclassId !== "" &&
        validSubclassIds.has(state.selectedSubclassId);
      if (!ok) {
        unresolved.push({
          level: req.level,
          kind: "subclass",
          label: `Nível ${req.level}: escolha uma subclasse`,
        });
      }
    } else if (req.kind === "asi-or-feat") {
      const choice = state.asiOrFeatByLevel[String(req.level)];
      const ok =
        choice !== undefined &&
        (choice.mode === "feat" ? choice.featId !== "" : isValidAsi(choice));
      if (!ok) {
        unresolved.push({
          level: req.level,
          kind: "asi-or-feat",
          label: `Nível ${req.level}: escolha ASI ou talento`,
        });
      }
    } else {
      const chosen = state.classFeatureChoices[req.id] ?? [];
      if (chosen.length !== req.count) {
        unresolved.push({
          level: req.level,
          kind: "feature-option",
          label: `Nível ${req.level}: ${req.featureName}`,
        });
      }
    }
  }

  return unresolved;
}
