import { describe, expect, it } from "vitest";
import { getPersonalDetailsRecommendations } from "@/src/data/personalDetailsRecommendations";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderSpecies,
} from "@/src/services/ruleService";

describe("personalDetailsRecommendations", () => {
  it("creates distinct name and roleplay patterns for an Elf Acolyte", () => {
    const species = getBuilderSpecies().find((entry) => entry.id === "elf-xphb");
    const background = getBuilderBackgrounds().find(
      (entry) => entry.id === "acolyte-xphb",
    );
    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === "cleric-xphb",
    );

    const recommendations = getPersonalDetailsRecommendations({
      species,
      background,
      characterClass,
    });

    expect(recommendations.title).toBe("Elf / Acolyte / Cleric");
    expect(recommendations.names).toContain("Aelar Dawn-Votary");
    expect(recommendations.names).toContain("Sister Lethariel");
    expect(recommendations.alignments).toContain("Lawful Good");
    expect(recommendations.age).toContain("100-750");
    expect(recommendations.personality).toContain("sacred duty");
  });

  it("creates a different pattern for a Reborn Charlatan", () => {
    const species = getBuilderSpecies().find((entry) => entry.id === "reborn-rhw");
    const background = getBuilderBackgrounds().find(
      (entry) => entry.id === "charlatan-xphb",
    );
    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === "rogue-xphb",
    );

    const recommendations = getPersonalDetailsRecommendations({
      species,
      background,
      characterClass,
    });

    expect(recommendations.title).toBe("Reborn / Charlatan / Rogue");
    expect(recommendations.names).toContain("Vesper Vale");
    expect(recommendations.names).toContain("Morrow the Gilded");
    expect(recommendations.alignments).toContain("Chaotic Neutral");
    expect(recommendations.age).toContain("Any apparent age");
    expect(recommendations.personality).toContain("edge and timing");
  });

  it("generates complete suggestions for every catalog combination input", () => {
    const species = getBuilderSpecies();
    const backgrounds = getBuilderBackgrounds();
    const classes = getBuilderClasses();

    for (const speciesEntry of species) {
      const recommendations = getPersonalDetailsRecommendations({
        species: speciesEntry,
        background: backgrounds[0],
        characterClass: classes[0],
      });

      expect(recommendations.names).toHaveLength(6);
      expect(recommendations.age).toBeTruthy();
      expect(recommendations.appearance).toBeTruthy();
    }

    for (const backgroundEntry of backgrounds) {
      const recommendations = getPersonalDetailsRecommendations({
        species: species[0],
        background: backgroundEntry,
        characterClass: classes[0],
      });

      expect(recommendations.names).toHaveLength(6);
      expect(recommendations.alignments.length).toBeGreaterThan(0);
      expect(recommendations.backstory).toBeTruthy();
    }

    for (const classEntry of classes) {
      const recommendations = getPersonalDetailsRecommendations({
        species: species[0],
        background: backgrounds[0],
        characterClass: classEntry,
      });

      expect(recommendations.personality).toBeTruthy();
      expect(recommendations.notes).toBeTruthy();
    }
  });
});
