import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderEquipmentOptions,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { validateBuilderStep } from "@/rules/builderValidation";
import {
  calculateArmorClass,
  calculateFinalAttributes,
  calculateInitialHitPoints,
  getProficiencyBonus,
} from "@/src/adapters/characterDerivedAdapter";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { BuilderStepSlug, CharacterSheetSummary } from "@/types/builder";

export function selectCharacterSheetSummary(
  state: CharacterBuilderState,
): CharacterSheetSummary {
  const species = getBuilderSpecies().find(
    (entry) => entry.id === state.selectedSpeciesId,
  );
  const characterClass = getBuilderClasses().find(
    (entry) => entry.id === state.selectedClassId,
  );
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );
  const classChoice = state.equipmentChoicesBySource.class;
  const classKitItemIds =
    classChoice?.mode === "items" && classChoice.selectedOptionId
      ? (characterClass?.startingEquipmentPackages.find(
          (entry) => entry.id === classChoice.selectedOptionId,
        )?.items ?? []).map((item) => item.id)
      : [];
  const inventoryItemIds = state.inventory.map((entry) => entry.itemId);
  const equipmentIds = new Set([...inventoryItemIds, ...classKitItemIds]);
  const selectedEquipment = getBuilderEquipmentOptions().filter((equipment) =>
    equipmentIds.has(equipment.id),
  );
  const finalAttributes = calculateFinalAttributes(
    state.baseAttributes,
    state.backgroundAbilityBonuses,
  );

  return {
    ruleset: state.ruleset,
    level: state.level,
    speciesId: state.selectedSpeciesId,
    classId: state.selectedClassId,
    backgroundId: state.selectedBackgroundId,
    originFeat: background?.originFeat ?? "",
    baseAttributes: state.baseAttributes,
    backgroundAbilityBonuses: state.backgroundAbilityBonuses,
    finalAttributes,
    proficiencyBonus: getProficiencyBonus(state.level),
    hitPoints: calculateInitialHitPoints(
      characterClass?.hitDie ?? 6,
      finalAttributes.constituicao,
    ),
    armorClass: calculateArmorClass(finalAttributes.destreza, selectedEquipment),
    selectedEquipment,
    selectedTraits: species?.traits ?? [],
    classFeatures: characterClass?.levelOneFeatures ?? [],
    classSkillProficiencies: state.classSkillProficiencies,
    skillTraining: state.skillTraining,
    classFeatureChoices: state.classFeatureChoices,
    speciesChoices: state.speciesChoices,
    speciesLanguages: state.speciesLanguages,
    validationMessages: getAllValidationMessages(state),
  };
}

function getAllValidationMessages(state: CharacterBuilderState): string[] {
  const steps: BuilderStepSlug[] = [
    "classe",
    "recursos-classe",
    "antecedente",
    "especie",
    "detalhes-especie",
    "atributos",
    "equipamento",
    "descricao",
  ];

  return steps.flatMap((step) => validateBuilderStep(step, state));
}
