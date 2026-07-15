import { validateBuilderStep } from "@/rules/builderValidation";
import { deriveArmorEquipmentPendencies } from "@/rules/armorClassRules";
import {
  deriveCarriedEquipment,
  deriveSelectedEquipment,
} from "@/rules/inventoryRules";
import { getUnresolvedLevelChoices } from "@/src/store/levelChoiceResolver";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { BuilderClass, BuilderStepSlug, Pendency } from "@/src/types/builder";

const VALIDATED_STEPS: BuilderStepSlug[] = [
  "classe",
  "recursos-classe",
  "subclasse",
  "antecedente",
  "especie",
  "detalhes-especie",
  "atributos",
  "equipamento",
  "descricao",
];

const LEVEL_CHOICE_STEP: BuilderStepSlug = "recursos-classe";

export function deriveBuilderPendencies(input: {
  state: CharacterBuilderState;
  characterClass?: BuilderClass;
}): Pendency[] {
  const { state, characterClass } = input;
  const stepPendencies = VALIDATED_STEPS.flatMap((stepSlug) =>
    validateBuilderStep(stepSlug, state).map((label, index) => ({
      id: `${stepSlug}-${index}`,
      stepSlug,
      label,
      severity: "blocking" as const,
    })),
  );

  const levelPendencies =
    characterClass === undefined
      ? []
      : getUnresolvedLevelChoices(state, characterClass)
          // A pendência de subclasse é reportada pela validação do step
          // "subclasse"; duplicá-la aqui geraria duas entradas para a mesma escolha.
          .filter((choice) => choice.kind !== "subclass")
          .map((choice) => ({
          id: `level-${choice.level}-${choice.kind}`,
          stepSlug: LEVEL_CHOICE_STEP,
          label: normalizeLevelChoiceLabel(choice.label),
          severity: "blocking" as const,
        }));

  const equipmentPendencies = deriveArmorEquipmentPendencies(
    deriveSelectedEquipment({
      state,
      carriedEquipment: deriveCarriedEquipment({ state, characterClass }),
    }),
  );

  return [...stepPendencies, ...levelPendencies, ...equipmentPendencies];
}

function normalizeLevelChoiceLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/^Level/, "Level");
}
