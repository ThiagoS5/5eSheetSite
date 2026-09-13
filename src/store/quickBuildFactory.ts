import { deriveQuickBuildBackgroundBonuses, deriveQuickBuildSpells } from "@/rules/quickBuildRules";
import { quickBuildProfiles, type QuickBuildProfile } from "@/src/data/quickBuildProfiles";
import { getBuilderBackgrounds, getBuilderClasses, getBuilderLanguages, getBuilderSpecies } from "@/src/services/ruleService";
import { getSpellCatalogForClass } from "@/src/services/spellService";
import { createCharacterBuildFromLegacyState } from "@/src/store/characterBuildModel";
import type { CharacterBuild, CreationPreferences } from "@/src/types/characterBuild";
import { filterByActiveSources } from "@/src/utils/sourceFiltering";

export function getAvailableQuickBuildProfiles(preferences: CreationPreferences): QuickBuildProfile[] {
  const classes = filterByActiveSources(getBuilderClasses(), preferences.activeSources);
  return quickBuildProfiles.filter((profile) => classes.some((entry) => entry.id === profile.classId));
}

export function createQuickBuild(profile: QuickBuildProfile, creationPreferences: CreationPreferences): CharacterBuild {
  const selectedClass = filterByActiveSources(getBuilderClasses(), creationPreferences.activeSources)
    .find((entry) => entry.id === profile.classId);
  if (!selectedClass) throw new Error("The quick-build class is unavailable in the active sources.");
  const selectedSpecies = getBuilderSpecies().find((entry) => entry.id === "human-xphb");
  const selectedBackground = getBuilderBackgrounds().find((entry) => entry.id === "guard-xphb");
  const requiredLanguageCount = 2 + selectedClass.languageChoiceCount + (selectedBackground?.languageChoiceCount ?? 0);
  const speciesLanguages = getBuilderLanguages().slice(0, requiredLanguageCount).map((language) => language.name);

  // A new build has no previous play state: the canonical factory initializes full HP.
  return createCharacterBuildFromLegacyState({
    beginnerMode: false,
    creationPreferences,
    selectedClassId: selectedClass.id,
    selectedSpeciesId: selectedSpecies?.id ?? "",
    selectedBackgroundId: selectedBackground?.id ?? "",
    maxUnlockedStepIndex: 9,
    classSkillProficiencies: profile.skillProficiencies.slice(0, selectedClass.skillChoices.count),
    skillTraining: Object.fromEntries(profile.skillProficiencies.map((skill) => [skill, "proficient"])),
    classFeatureChoices: Object.fromEntries(selectedClass.featureChoiceGroups.map((group) => [
      group.id, group.options.slice(0, group.count).map((option) => option.value),
    ])),
    speciesLanguages,
    attributeGenerationMethod: "standard-array",
    baseAttributes: profile.baseAttributes,
    backgroundAbilityBonuses: deriveQuickBuildBackgroundBonuses(selectedBackground),
    spellcasting: deriveQuickBuildSpells(selectedClass, getSpellCatalogForClass({
      className: selectedClass.name, activeSources: creationPreferences.activeSources,
    })),
    equipmentChoicesBySource: selectedClass.startingEquipmentPackages[0] ? {
      class: { mode: "items", selectedOptionId: selectedClass.startingEquipmentPackages[0].id },
    } : {},
  }, { currentStepSlug: "descricao" });
}
