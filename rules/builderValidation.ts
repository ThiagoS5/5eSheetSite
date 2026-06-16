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
    return ["Escolha uma Classe para continuar."];
  }

  if (step === "recursos-classe") {
    if (!state.selectedClassId) {
      return ["Escolha uma Classe antes de configurar seus recursos."];
    }

    const requiredSkills = getRequiredClassSkillCount(state.selectedClassId);

    if (state.classSkillProficiencies.length < requiredSkills) {
      return [`Escolha ${requiredSkills} pericias de classe para continuar.`];
    }

    if (new Set(state.classSkillProficiencies).size !== state.classSkillProficiencies.length) {
      return ["Pericias de classe nao podem se repetir."];
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
          return [`Escolha ${group.count} opcoes para ${group.label}.`];
        }

        return [];
      }) ?? [];

    if (featureMessages.length) {
      return featureMessages;
    }
  }

  if (step === "antecedente" && !state.selectedBackgroundId) {
    return ["Escolha um Antecedente para aplicar bonus de atributo e Talento de Origem."];
  }

  if (step === "antecedente" && !isValidBackgroundAbilitySelection(state)) {
    return ["Escolha os bonus de atributo do Antecedente 2024."];
  }

  if (step === "especie" && !state.selectedSpeciesId) {
    return ["Escolha uma Raca/Especie para continuar."];
  }

  if (step === "detalhes-especie") {
    if (!state.selectedSpeciesId) {
      return ["Escolha uma Raca/Especie antes de configurar seus detalhes."];
    }

    if (state.selectedSpeciesId === "dragonborn-xphb") {
      const messages: string[] = [];

      if (!state.speciesChoices["draconic-ancestry"]) {
        messages.push("Escolha o ancestral draconico.");
      }

      const requiredLanguages = getRequiredLanguageCount(state);

      if (state.speciesLanguages.length !== requiredLanguages) {
        messages.push(`Escolha ${requiredLanguages} idiomas de especie.`);
      }

      return messages;
    }

    const requiredLanguages = getRequiredLanguageCount(state);

    if (state.speciesLanguages.length !== requiredLanguages) {
      return [`Escolha ${requiredLanguages} idiomas de especie.`];
    }
  }

  if (step === "atributos") {
    const invalidAttributes = Object.values(state.baseAttributes).some(
      (attribute) => attribute < 3 || attribute > 20,
    );

    if (invalidAttributes) {
      return ["Todos os atributos base devem estar entre 3 e 20."];
    }

    if (state.attributeGenerationMethod === "point-buy") {
      const invalidPointBuyAttributes = Object.values(state.baseAttributes).some(
        (attribute) => !isValidPointBuyScore(attribute),
      );

      if (invalidPointBuyAttributes) {
        return ["No Point Buy, atributos base devem estar entre 8 e 15."];
      }

      if (getPointBuySpent(state.baseAttributes) > POINT_BUY_BUDGET) {
        return ["Point Buy nao pode ultrapassar 27 pontos."];
      }

      if (!isPointBuyComplete(state.baseAttributes)) {
        return ["Gaste exatamente 27 pontos no Point Buy para continuar."];
      }
    }
  }

  if (step === "equipamento") {
    const classChoice = state.equipmentChoicesBySource.class;

    if (!classChoice || (classChoice.mode === "items" && !classChoice.selectedOptionId)) {
      return ["Selecione o equipamento inicial da classe."];
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
  return classId === "bard-xphb" ? 3 : 2;
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
