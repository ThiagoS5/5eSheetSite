import { describe, expect, it } from "vitest";
import { validateBuilderStep } from "@/rules/builderValidation";
import { getBuilderClasses } from "@/src/services/ruleService";
import { initialCharacterState } from "@/src/store/createCharacterStore";

describe("builder validation", () => {
  it("requires class, class feature choices, species, background choices, description name, and equipment", () => {
    expect(validateBuilderStep("classe", initialCharacterState)).toHaveLength(1);
    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "fighter-xphb",
      }),
    ).toStrictEqual(["Escolha 2 pericias de classe para continuar."]);
    expect(
      validateBuilderStep("antecedente", {
        ...initialCharacterState,
        selectedBackgroundId: "acolyte-xphb",
      }),
    ).toStrictEqual(["Escolha os bonus de atributo do Antecedente 2024."]);
    expect(validateBuilderStep("especie", initialCharacterState)).toHaveLength(1);
    expect(
      validateBuilderStep("detalhes-especie", {
        ...initialCharacterState,
        selectedSpeciesId: "dragonborn-xphb",
      }),
    ).toStrictEqual([
      "Escolha o ancestral draconico.",
      "Escolha 2 idiomas de especie.",
    ]);
    expect(validateBuilderStep("equipamento", initialCharacterState)).toHaveLength(1);
  });

  it("clears the equipment error once the class source has a resolved choice", () => {
    expect(
      validateBuilderStep("equipamento", {
        ...initialCharacterState,
        equipmentChoicesBySource: {
          class: { mode: "items", selectedOptionId: "A" },
        },
      }),
    ).toHaveLength(0);
  });

  it("requires point buy to spend exactly 27 points within the 8 to 15 range", () => {
    expect(
      validateBuilderStep("atributos", {
        ...initialCharacterState,
        attributeGenerationMethod: "point-buy",
      }),
    ).toStrictEqual(["Gaste exatamente 27 pontos no Point Buy para continuar."]);

    expect(
      validateBuilderStep("atributos", {
        ...initialCharacterState,
        attributeGenerationMethod: "point-buy",
        baseAttributes: {
          ...initialCharacterState.baseAttributes,
          forca: 16,
        },
      }),
    ).toStrictEqual(["No Point Buy, atributos base devem estar entre 8 e 15."]);
  });

  it("accepts roll-4d6 attributes without the point-buy constraints", () => {
    expect(
      validateBuilderStep("atributos", {
        ...initialCharacterState,
        attributeGenerationMethod: "roll-4d6",
        baseAttributes: {
          forca: 15,
          destreza: 14,
          constituicao: 13,
          inteligencia: 12,
          sabedoria: 10,
          carisma: 8,
        },
      }),
    ).toStrictEqual([]);
  });

  it("requires Bard to choose three class skills", () => {
    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "bard-xphb",
        classSkillProficiencies: ["Arcana", "Performance"],
      }),
    ).toStrictEqual(["Escolha 3 pericias de classe para continuar."]);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "bard-xphb",
        classSkillProficiencies: ["Arcana", "Performance", "Stealth"],
      }),
    ).toStrictEqual([]);
  });

  it("requires Barbarian to choose exactly two Weapon Mastery weapons", () => {
    const barbarian = getBuilderClasses().find(
      (entry) => entry.id === "barbarian-xphb",
    );
    const masteryValues =
      barbarian?.featureChoiceGroups[0]?.options.slice(0, 2).map((option) => option.value) ??
      [];

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "barbarian-xphb",
        classSkillProficiencies: ["Athletics", "Perception"],
      }),
    ).toStrictEqual(["Escolha 2 opcoes para Weapon Mastery."]);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "barbarian-xphb",
        classSkillProficiencies: ["Athletics", "Perception"],
        classFeatureChoices: {
          "weapon-mastery": masteryValues,
        },
      }),
    ).toStrictEqual([]);
  });

  it("validates 2024 background ability bonus modes", () => {
    expect(
      validateBuilderStep("antecedente", {
        ...initialCharacterState,
        selectedBackgroundId: "acolyte-xphb",
        backgroundAbilityBonuses: {
          inteligencia: 2,
          sabedoria: 2,
        },
      }),
    ).toStrictEqual(["Escolha os bonus de atributo do Antecedente 2024."]);

    expect(
      validateBuilderStep("antecedente", {
        ...initialCharacterState,
        selectedBackgroundId: "acolyte-xphb",
        backgroundAbilityBonuses: {
          inteligencia: 1,
          sabedoria: 1,
          carisma: 1,
        },
      }),
    ).toStrictEqual([]);
  });
});
