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
    ).toStrictEqual(["Choose 2 class skills to continue."]);
    expect(
      validateBuilderStep("antecedente", {
        ...initialCharacterState,
        selectedBackgroundId: "acolyte-xphb",
      }),
    ).toStrictEqual(["Choose the 2024 Background ability bonuses."]);
    expect(validateBuilderStep("especie", initialCharacterState)).toHaveLength(1);
    expect(
      validateBuilderStep("detalhes-especie", {
        ...initialCharacterState,
        selectedSpeciesId: "dragonborn-xphb",
      }),
    ).toStrictEqual([
      "Choose your Draconic Ancestry.",
      "Choose 2 species languages.",
    ]);
    expect(validateBuilderStep("equipamento", initialCharacterState)).toHaveLength(1);
  });

  it("accepts bonus languages beyond the standard required count", () => {
    expect(
      validateBuilderStep("detalhes-especie", {
        ...initialCharacterState,
        selectedSpeciesId: "dragonborn-xphb",
        speciesChoices: { "draconic-ancestry": "Black" },
        speciesLanguages: ["Common", "Draconic", "Infernal", "Primordial"],
      }),
    ).toStrictEqual([]);
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
    ).toStrictEqual(["Spend exactly 27 points in Point Buy to continue."]);

    expect(
      validateBuilderStep("atributos", {
        ...initialCharacterState,
        attributeGenerationMethod: "point-buy",
        baseAttributes: {
          ...initialCharacterState.baseAttributes,
          forca: 16,
        },
      }),
    ).toStrictEqual(["In Point Buy, base ability scores must be between 8 and 15."]);
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
    ).toStrictEqual(["Choose 3 class skills to continue."]);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "bard-xphb",
        classSkillProficiencies: ["Arcana", "Performance", "Stealth"],
      }),
    ).toStrictEqual([]);
  });

  function validFeatureChoices(cls: ReturnType<typeof getBuilderClasses>[number]) {
    return Object.fromEntries(
      cls.featureChoiceGroups.map((group) => [
        group.id,
        group.options.slice(0, group.count).map((option) => option.value),
      ]),
    );
  }

  it("requires Rogue to choose four class skills, matching skillChoices.count", () => {
    const rogue = getBuilderClasses().find((entry) => entry.id === "rogue-xphb");
    expect(rogue?.skillChoices.count).toBe(4);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "rogue-xphb",
        classSkillProficiencies: ["Acrobatics", "Athletics"],
        classFeatureChoices: rogue ? validFeatureChoices(rogue) : {},
      }),
    ).toStrictEqual(["Choose 4 class skills to continue."]);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "rogue-xphb",
        classSkillProficiencies: ["Acrobatics", "Athletics", "Deception", "Insight"],
        classFeatureChoices: rogue ? validFeatureChoices(rogue) : {},
      }),
    ).toStrictEqual([]);
  });

  it("requires Ranger to choose three class skills, matching skillChoices.count", () => {
    const ranger = getBuilderClasses().find((entry) => entry.id === "ranger-xphb");
    expect(ranger?.skillChoices.count).toBe(3);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "ranger-xphb",
        classSkillProficiencies: ["Athletics", "Insight"],
        classFeatureChoices: ranger ? validFeatureChoices(ranger) : {},
      }),
    ).toStrictEqual(["Choose 3 class skills to continue."]);

    expect(
      validateBuilderStep("recursos-classe", {
        ...initialCharacterState,
        selectedClassId: "ranger-xphb",
        classSkillProficiencies: ["Athletics", "Insight", "Perception"],
        classFeatureChoices: ranger ? validFeatureChoices(ranger) : {},
      }),
    ).toStrictEqual([]);
  });

  it("derives the required class skill count from skillChoices.count for every class", () => {
    for (const cls of getBuilderClasses()) {
      const validSkills = cls.skillChoices.chooseFrom.slice(0, cls.skillChoices.count);
      const featureChoices = validFeatureChoices(cls);

      expect(
        validateBuilderStep("recursos-classe", {
          ...initialCharacterState,
          selectedClassId: cls.id,
          classSkillProficiencies: validSkills,
          classFeatureChoices: featureChoices,
        }),
      ).toStrictEqual([]);

      if (cls.skillChoices.count > 0) {
        expect(
          validateBuilderStep("recursos-classe", {
            ...initialCharacterState,
            selectedClassId: cls.id,
            classSkillProficiencies: validSkills.slice(0, cls.skillChoices.count - 1),
            classFeatureChoices: featureChoices,
          }),
        ).toStrictEqual([
          `Choose ${cls.skillChoices.count} class skills to continue.`,
        ]);
      }
    }
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
    ).toStrictEqual(["Choose 2 options for Weapon Mastery."]);

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
    ).toStrictEqual(["Choose the 2024 Background ability bonuses."]);

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
