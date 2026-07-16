import { describe, expect, it } from "vitest";
import { getPersonalDetailsRecommendations } from "@/src/data/personalDetailsRecommendations";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderSpecies,
} from "@/src/services/ruleService";

function uniqueOpeningCount(entries: string[]): number {
  return new Set(entries.map((entry) => entry.split(/\s+/).slice(0, 2).join(" "))).size;
}

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
    expect(recommendations.suggestions.personalidade).toHaveLength(50);
    expect(recommendations.suggestions.historia).toHaveLength(50);
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
      expect(recommendations.suggestions.aparencia).toHaveLength(50);
      expect(recommendations.suggestions.personalidade).toHaveLength(50);
      expect(recommendations.suggestions.historia).toHaveLength(50);
      expect(recommendations.suggestions.notas).toHaveLength(50);
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
      expect(recommendations.suggestions.historia).toHaveLength(50);
    }

    for (const classEntry of classes) {
      const recommendations = getPersonalDetailsRecommendations({
        species: species[0],
        background: backgrounds[0],
        characterClass: classEntry,
      });

      expect(recommendations.personality).toBeTruthy();
      expect(recommendations.notes).toBeTruthy();
      expect(recommendations.suggestions.notas).toHaveLength(50);
    }
  });

  it("avoids sleep-based mannerisms for elves", () => {
    const species = getBuilderSpecies().find((entry) => entry.id === "elf-xphb");
    const recommendations = getPersonalDetailsRecommendations({
      species,
      alignment: "Chaotic Good",
    });

    const joined = recommendations.suggestions.personalidade.join(" ").toLowerCase();
    expect(joined).not.toMatch(/sleep|slept|sleepwalk|sleepwalking|dreamless sleep/);
    expect(recommendations.suggestions.historia.join(" ")).toContain("Chaotic Good");
  });

  it("creates varied, lore-aware narrative suggestions", () => {
    const species = getBuilderSpecies().find((entry) => entry.id === "hexblood-rhw");
    const background = getBuilderBackgrounds().find(
      (entry) => entry.id === "charlatan-xphb",
    );
    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === "artificer-efa",
    );

    const recommendations = getPersonalDetailsRecommendations({
      species,
      background,
      characterClass,
      alignment: "Chaotic Neutral",
    });
    const joinedHistory = recommendations.suggestions.historia.join(" ");

    expect(uniqueOpeningCount(recommendations.suggestions.historia)).toBeGreaterThanOrEqual(20);
    expect(joinedHistory).toMatch(/fey|bargain|living crown|omen/i);
    expect(joinedHistory).toMatch(/false identity|alias|con|mark|debt/i);
    expect(joinedHistory).toMatch(/prototype|invention|repair|tool|maker/i);
    expect(joinedHistory).toContain("Chaotic Neutral");
  });
});
