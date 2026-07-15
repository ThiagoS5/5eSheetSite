import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { SheetSkill } from "@/src/types/builder";
import type { AttributeKey, CharacterAttributes } from "@/src/types/dnd";

const SKILL_DISPLAY: Record<string, string> = {
  Acrobatics: "Acrobatics",
  "Animal Handling": "Animal Handling",
  Arcana: "Arcana",
  Athletics: "Athletics",
  Deception: "Deception",
  History: "History",
  Insight: "Insight",
  Intimidation: "Intimidation",
  Investigation: "Investigation",
  Medicine: "Medicine",
  Nature: "Nature",
  Perception: "Perception",
  Performance: "Performance",
  Persuasion: "Persuasion",
  Religion: "Religion",
  "Sleight of Hand": "Sleight of Hand",
  Stealth: "Stealth",
  Survival: "Survival",
};

const SKILL_ATTRIBUTE: Record<string, AttributeKey> = {
  Athletics: "forca",
  Acrobatics: "destreza",
  "Sleight of Hand": "destreza",
  Stealth: "destreza",
  Arcana: "inteligencia",
  History: "inteligencia",
  Investigation: "inteligencia",
  Nature: "inteligencia",
  Religion: "inteligencia",
  "Animal Handling": "sabedoria",
  Insight: "sabedoria",
  Medicine: "sabedoria",
  Perception: "sabedoria",
  Survival: "sabedoria",
  Deception: "carisma",
  Intimidation: "carisma",
  Performance: "carisma",
  Persuasion: "carisma",
};

export const SKILL_NAMES = Object.keys(SKILL_DISPLAY);

export function computeSkills(input: {
  finalAttributes: CharacterAttributes;
  classSkillProficiencies: string[];
  skillTraining: Record<string, string>;
  proficiencyBonus: number;
  skillModifierOverrides?: Record<string, number>;
}): SheetSkill[] {
  const {
    finalAttributes,
    classSkillProficiencies,
    skillTraining,
    proficiencyBonus,
    skillModifierOverrides = {},
  } = input;
  const profSet = new Set(classSkillProficiencies);

  return SKILL_NAMES.map((name) => {
    const attrKey = SKILL_ATTRIBUTE[name] ?? "inteligencia";
    const baseMod = getAbilityModifier(finalAttributes[attrKey]);
    const training =
      skillTraining[name] ?? (profSet.has(name) ? "proficient" : "none");
    const isProficient = training === "proficient" || training === "expertise";
    const isExpert = training === "expertise";
    const profMod = isExpert ? proficiencyBonus * 2 : isProficient ? proficiencyBonus : 0;
    const halfMod = training === "half" ? Math.floor(proficiencyBonus / 2) : 0;
    let modifier = baseMod + profMod + halfMod;
    let isOverridden = false;
    const override = skillModifierOverrides[name];

    if (typeof override === "number" && Number.isFinite(override)) {
      modifier = override;
      isOverridden = true;
    }

    return {
      name,
      label: SKILL_DISPLAY[name] ?? name,
      attributeKey: attrKey,
      modifier,
      isProficient,
      isExpert,
      isOverridden,
    };
  });
}

export function computePassives(
  skills: SheetSkill[],
): { perception: number; investigation: number; insight: number } {
  const findSkillMod = (name: string) =>
    skills.find((skill) => skill.name === name)?.modifier ?? 0;

  return {
    perception: 10 + findSkillMod("Perception"),
    investigation: 10 + findSkillMod("Investigation"),
    insight: 10 + findSkillMod("Insight"),
  };
}
