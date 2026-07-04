import { describe, expect, it } from "vitest";
import { SKILL_DESCRIPTIONS } from "@/src/data/skillDescriptions";

const VALID_ABILITIES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];

const EXPECTED_SKILLS = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception",
  "History", "Insight", "Intimidation", "Investigation", "Medicine",
  "Nature", "Perception", "Performance", "Persuasion", "Religion",
  "Sleight of Hand", "Stealth", "Survival",
];

describe("SKILL_DESCRIPTIONS", () => {
  it("has all 18 skills", () => {
    expect(Object.keys(SKILL_DESCRIPTIONS)).toHaveLength(18);
  });

  it("has all expected skill keys", () => {
    for (const skill of EXPECTED_SKILLS) {
      expect(SKILL_DESCRIPTIONS).toHaveProperty(skill);
    }
  });

  it("each skill has a non-empty ability string", () => {
    for (const skill of EXPECTED_SKILLS) {
      const entry = SKILL_DESCRIPTIONS[skill];
      expect(entry.ability).toBeDefined();
      expect(typeof entry.ability).toBe("string");
      expect(entry.ability.length).toBeGreaterThan(0);
    }
  });

  it("each skill has a non-empty text description", () => {
    for (const skill of EXPECTED_SKILLS) {
      const entry = SKILL_DESCRIPTIONS[skill];
      expect(entry.text).toBeDefined();
      expect(typeof entry.text).toBe("string");
      expect(entry.text.length).toBeGreaterThan(0);
    }
  });

  it("each ability is one of the six valid English ability names", () => {
    for (const skill of EXPECTED_SKILLS) {
      const entry = SKILL_DESCRIPTIONS[skill];
      expect(VALID_ABILITIES).toContain(entry.ability);
    }
  });

  it("has the correct ability mapping per D&D 5e rules", () => {
    const expectedMapping: Record<string, string> = {
      "Athletics": "Strength",
      "Acrobatics": "Dexterity",
      "Sleight of Hand": "Dexterity",
      "Stealth": "Dexterity",
      "Arcana": "Intelligence",
      "History": "Intelligence",
      "Investigation": "Intelligence",
      "Nature": "Intelligence",
      "Religion": "Intelligence",
      "Animal Handling": "Wisdom",
      "Insight": "Wisdom",
      "Medicine": "Wisdom",
      "Perception": "Wisdom",
      "Survival": "Wisdom",
      "Deception": "Charisma",
      "Intimidation": "Charisma",
      "Performance": "Charisma",
      "Persuasion": "Charisma",
    };

    for (const [skill, expectedAbility] of Object.entries(expectedMapping)) {
      expect(SKILL_DESCRIPTIONS[skill].ability).toBe(expectedAbility);
    }
  });
});
