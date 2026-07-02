import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { SheetSkill } from "@/types/builder";
import type { AttributeKey, CharacterAttributes } from "@/types/dnd";

const SKILL_DISPLAY: Record<string, string> = {
  Acrobatics: "Acrobacia",
  "Animal Handling": "Trato c/ Animais",
  Arcana: "Arcanismo",
  Athletics: "Atletismo",
  Deception: "Enganacao",
  History: "Historia",
  Insight: "Intuicao",
  Intimidation: "Intimidacao",
  Investigation: "Investigacao",
  Medicine: "Medicina",
  Nature: "Natureza",
  Perception: "Percepcao",
  Performance: "Atuacao",
  Persuasion: "Persuasao",
  Religion: "Religiao",
  "Sleight of Hand": "Prestidigitacao",
  Stealth: "Furtividade",
  Survival: "Sobrevivencia",
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

const ALL_SKILLS = Object.keys(SKILL_DISPLAY);

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

  return ALL_SKILLS.map((name) => {
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
