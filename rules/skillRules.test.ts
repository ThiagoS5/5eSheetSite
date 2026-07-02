import { describe, expect, it } from "vitest";
import { computePassives, computeSkills } from "@/rules/skillRules";
import type { CharacterAttributes } from "@/types/dnd";

const attributes: CharacterAttributes = {
  forca: 16,
  destreza: 14,
  constituicao: 12,
  inteligencia: 10,
  sabedoria: 13,
  carisma: 8,
};

describe("skill rules", () => {
  it("derives skill modifiers from attributes, proficiency, expertise, half training, and overrides", () => {
    const skills = computeSkills({
      finalAttributes: attributes,
      classSkillProficiencies: ["Athletics"],
      skillTraining: {
        Stealth: "expertise",
        History: "half",
      },
      proficiencyBonus: 2,
      skillModifierOverrides: {
        Perception: 7,
      },
    });

    expect(skills.find((skill) => skill.name === "Athletics")).toMatchObject({
      attributeKey: "forca",
      modifier: 5,
      isProficient: true,
      isExpert: false,
      isOverridden: false,
    });
    expect(skills.find((skill) => skill.name === "Stealth")).toMatchObject({
      attributeKey: "destreza",
      modifier: 6,
      isProficient: true,
      isExpert: true,
      isOverridden: false,
    });
    expect(skills.find((skill) => skill.name === "History")).toMatchObject({
      attributeKey: "inteligencia",
      modifier: 1,
      isProficient: false,
      isExpert: false,
      isOverridden: false,
    });
    expect(skills.find((skill) => skill.name === "Perception")).toMatchObject({
      attributeKey: "sabedoria",
      modifier: 7,
      isOverridden: true,
    });
  });

  it("derives passive scores from computed skills", () => {
    const skills = computeSkills({
      finalAttributes: attributes,
      classSkillProficiencies: ["Perception", "Insight"],
      skillTraining: {},
      proficiencyBonus: 2,
    });

    expect(computePassives(skills)).toStrictEqual({
      perception: 13,
      investigation: 10,
      insight: 13,
    });
  });
});
