"use client";

import { useMemo } from "react";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

export function useCharacterBuilderState(): CharacterBuilderState {
  const ruleset = useCharacterStore((s) => s.ruleset);
  const level = useCharacterStore((s) => s.level);
  const selectedSpeciesId = useCharacterStore((s) => s.selectedSpeciesId);
  const selectedClassId = useCharacterStore((s) => s.selectedClassId);
  const selectedSubclassId = useCharacterStore((s) => s.selectedSubclassId);
  const selectedBackgroundId = useCharacterStore((s) => s.selectedBackgroundId);
  const inventory = useCharacterStore((s) => s.inventory);
  const equippedItemIds = useCharacterStore((s) => s.equippedItemIds);
  const equipmentChoicesBySource = useCharacterStore((s) => s.equipmentChoicesBySource);
  const maxUnlockedStepIndex = useCharacterStore((s) => s.maxUnlockedStepIndex);
  const pendingChoiceIds = useCharacterStore((s) => s.pendingChoiceIds);
  const classSkillProficiencies = useCharacterStore((s) => s.classSkillProficiencies);
  const skillTraining = useCharacterStore((s) => s.skillTraining);
  const classFeatureChoices = useCharacterStore((s) => s.classFeatureChoices);
  const asiOrFeatByLevel = useCharacterStore((s) => s.asiOrFeatByLevel);
  const speciesChoices = useCharacterStore((s) => s.speciesChoices);
  const speciesLanguages = useCharacterStore((s) => s.speciesLanguages);
  const attributeGenerationMethod = useCharacterStore((s) => s.attributeGenerationMethod);
  const baseAttributes = useCharacterStore((s) => s.baseAttributes);
  const backgroundAbilityBonuses = useCharacterStore((s) => s.backgroundAbilityBonuses);
  const description = useCharacterStore((s) => s.description);
  const money = useCharacterStore((s) => s.money);
  const moneyTouched = useCharacterStore((s) => s.moneyTouched);
  const carriedLoadKg = useCharacterStore((s) => s.carriedLoadKg);
  const skillModifierOverrides = useCharacterStore((s) => s.skillModifierOverrides);
  const hpRollByLevel = useCharacterStore((s) => s.hpRollByLevel);
  const spellcasting = useCharacterStore((s) => s.spellcasting);
  const playState = useCharacterStore((s) => s.playState);
  const creationPreferences = useCharacterStore((s) => s.creationPreferences);
  const beginnerMode = useCharacterStore((s) => s.beginnerMode);

  return useMemo(
    () => ({
      ruleset,
      level,
      selectedSpeciesId,
      selectedClassId,
      selectedSubclassId,
      selectedBackgroundId,
      inventory,
      equippedItemIds,
      equipmentChoicesBySource,
      maxUnlockedStepIndex,
      pendingChoiceIds,
      classSkillProficiencies,
      skillTraining,
      classFeatureChoices,
      asiOrFeatByLevel,
      speciesChoices,
      speciesLanguages,
      attributeGenerationMethod,
      baseAttributes,
      backgroundAbilityBonuses,
      description,
      money,
      moneyTouched,
      carriedLoadKg,
      skillModifierOverrides,
      hpRollByLevel,
      spellcasting,
      playState,
      creationPreferences,
      beginnerMode,
    }),
    [
      ruleset,
      level,
      selectedSpeciesId,
      selectedClassId,
      selectedSubclassId,
      selectedBackgroundId,
      inventory,
      equippedItemIds,
      equipmentChoicesBySource,
      maxUnlockedStepIndex,
      pendingChoiceIds,
      classSkillProficiencies,
      skillTraining,
      classFeatureChoices,
      asiOrFeatByLevel,
      speciesChoices,
      speciesLanguages,
      attributeGenerationMethod,
      baseAttributes,
      backgroundAbilityBonuses,
      description,
      money,
      moneyTouched,
      carriedLoadKg,
      skillModifierOverrides,
      hpRollByLevel,
      spellcasting,
      playState,
      creationPreferences,
      beginnerMode,
    ],
  );
}
