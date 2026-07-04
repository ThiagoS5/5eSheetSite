import {
  POINT_BUY_BUDGET,
  getPointBuySpent,
  isPointBuyComplete,
  isValidPointBuyScore,
} from "@/rules/pointBuyRules";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
} from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { BuilderStepSlug } from "@/types/builder";

export function validateBuilderStep(
  step: BuilderStepSlug,
  state: CharacterBuilderState,
): string[] {
  if (step === "classe" && !state.selectedClassId) {
    return ["Choose a Class to continue."];
  }

  if (step === "recursos-classe") {
    if (!state.selectedClassId) {
      return ["Choose a Class before configuring its features."];
    }

    const requiredSkills = getRequiredClassSkillCount(state.selectedClassId);

    if (state.classSkillProficiencies.length < requiredSkills) {
      return [`Choose ${requiredSkills} class skills to continue.`];
    }

    if (new Set(state.classSkillProficiencies).size !== state.classSkillProficiencies.length) {
      return ["Class skills cannot be selected more than once."];
    }

    const selectedClass = getBuilderClasses().find(
      (entry) => entry.id === state.selectedClassId,
    );
    const featureMessages =
      selectedClass?.featureChoiceGroups.flatMap((group) => {
        const selectedValues = state.classFeatureChoices[group.id] ?? [];
        const validValues = new Set(group.options.map((option) => option.value));
        const hasInvalidValue = selectedValues.some((value) => !validValues.has(value));

        if (
          selectedValues.length !== group.count ||
          new Set(selectedValues).size !== selectedValues.length ||
          hasInvalidValue
        ) {
          return [`Choose ${group.count} options for ${group.label}.`];
        }

        return [];
      }) ?? [];

    if (featureMessages.length) {
      return featureMessages;
    }
  }

  if (step === "antecedente" && !state.selectedBackgroundId) {
    return ["Choose a Background to apply ability bonuses and an Origin Feat."];
  }

  if (step === "antecedente" && !isValidBackgroundAbilitySelection(state)) {
    return ["Choose the 2024 Background ability bonuses."];
  }

  if (step === "especie" && !state.selectedSpeciesId) {
    return ["Choose a Species to continue."];
  }

  if (step === "detalhes-especie") {
    if (!state.selectedSpeciesId) {
      return ["Choose a Species before configuring its details."];
    }

    if (state.selectedSpeciesId === "dragonborn-xphb") {
      const messages: string[] = [];

      if (!state.speciesChoices["draconic-ancestry"]) {
        messages.push("Choose your Draconic Ancestry.");
      }

      const requiredLanguages = getRequiredLanguageCount(state);

      if (state.speciesLanguages.length !== requiredLanguages) {
        messages.push(`Choose ${requiredLanguages} species languages.`);
      }

      return messages;
    }

    const requiredLanguages = getRequiredLanguageCount(state);

    if (state.speciesLanguages.length !== requiredLanguages) {
      return [`Choose ${requiredLanguages} species languages.`];
    }
  }

  if (step === "atributos") {
    const invalidAttributes = Object.values(state.baseAttributes).some(
      (attribute) => attribute < 3 || attribute > 20,
    );

    if (invalidAttributes) {
      return ["All base ability scores must be between 3 and 20."];
    }

    if (state.attributeGenerationMethod === "point-buy") {
      const invalidPointBuyAttributes = Object.values(state.baseAttributes).some(
        (attribute) => !isValidPointBuyScore(attribute),
      );

      if (invalidPointBuyAttributes) {
        return ["In Point Buy, base ability scores must be between 8 and 15."];
      }

      if (getPointBuySpent(state.baseAttributes) > POINT_BUY_BUDGET) {
        return ["Point Buy cannot exceed 27 points."];
      }

      if (!isPointBuyComplete(state.baseAttributes)) {
        return ["Spend exactly 27 points in Point Buy to continue."];
      }
    }
  }

  if (step === "equipamento") {
    const classChoice = state.equipmentChoicesBySource.class;

    if (!classChoice || (classChoice.mode === "items" && !classChoice.selectedOptionId)) {
      return ["Select your class starting equipment."];
    }
  }

  if (step === "conclusao") {
    const previousSteps: BuilderStepSlug[] = [
      "classe",
      "recursos-classe",
      "antecedente",
      "especie",
      "detalhes-especie",
      "atributos",
      "equipamento",
      "descricao",
    ];

    return previousSteps.flatMap((previousStep) =>
      validateBuilderStep(previousStep, state),
    );
  }

  return [];
}

function getRequiredClassSkillCount(classId: string): number {
  const selectedClass = getBuilderClasses().find((entry) => entry.id === classId);

  return selectedClass?.skillChoices.count ?? 2;
}

function isValidBackgroundAbilitySelection(state: CharacterBuilderState): boolean {
  const background = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );

  if (!background) {
    return false;
  }

  return background.abilityOptions.some((option) => {
    const entries = Object.entries(state.backgroundAbilityBonuses);
    const allowed = new Set<string>(option.attributes);

    if (entries.some(([attribute]) => !allowed.has(attribute))) {
      return false;
    }

    if (option.mode === "+2/+1") {
      const values = entries.map(([, bonus]) => bonus).sort();
      return entries.length === 2 && values[0] === 1 && values[1] === 2;
    }

    return (
      entries.length === option.attributes.length &&
      entries.every(([, bonus]) => bonus === 1)
    );
  });
}

export function getRequiredLanguageCount(state: CharacterBuilderState): number {
  const selectedClass = getBuilderClasses().find(
    (entry) => entry.id === state.selectedClassId,
  );
  const selectedBackground = getBuilderBackgrounds().find(
    (entry) => entry.id === state.selectedBackgroundId,
  );

  return (
    2 +
    (selectedClass?.languageChoiceCount ?? 0) +
    (selectedBackground?.languageChoiceCount ?? 0)
  );
}
