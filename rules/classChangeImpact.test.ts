import { describe, expect, it } from "vitest";
import { getClassChangeImpact } from "@/rules/classChangeImpact";
import { getBuilderClasses } from "@/src/services/ruleService";
import { initialCharacterState } from "@/src/store/createCharacterStore";

describe("getClassChangeImpact", () => {
  it("lists item a item what a fighter class change would reset", () => {
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");

    expect(fighter).toBeDefined();

    const impact = getClassChangeImpact({
      state: {
        ...initialCharacterState,
        selectedClassId: "fighter-xphb",
        classSkillProficiencies: ["Athletics", "Perception"],
        classFeatureChoices: {
          "weapon-mastery": ["Greatsword", "Longbow"],
        },
        equipmentChoicesBySource: {
          class: { mode: "items", selectedOptionId: "A" },
        },
        selectedSubclassId: "champion-xphb",
      },
      currentClass: fighter,
    });

    expect(impact.items).toStrictEqual([
      "2 pericias de classe",
      "Weapon Mastery",
      "Kit de equipamento da classe",
      "Subclasse: Champion",
    ]);
  });

  it("returns no items for a virgin state", () => {
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");

    const impact = getClassChangeImpact({
      state: initialCharacterState,
      currentClass: fighter,
    });

    expect(impact.items).toStrictEqual([]);
  });

  it("returns no items when there is no current class", () => {
    const impact = getClassChangeImpact({
      state: initialCharacterState,
      currentClass: undefined,
    });

    expect(impact.items).toStrictEqual([]);
  });
});
