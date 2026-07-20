import { groupSpellsByLevel } from "@/src/utils/spellGrouping";
import type { CharacterDescription, CharacterSheetSummary } from "@/src/types/builder";
import type { CharacterBuildPlayState } from "@/src/types/characterBuild";

export interface CharacterExportProjection {
  identity: {
    name: string;
    level: number;
    className: string;
    speciesName: string;
    backgroundName: string;
  };
  narrative: Array<{ id: string; title: string; value: string }>;
  proficiencies: {
    skills: string[];
    languages: string[];
    tools: string[];
  };
  defenses: {
    senses: CharacterSheetSummary["senses"];
    resistances: string[];
    immunities: string[];
    vulnerabilities: string[];
  };
  spellGroups: ReturnType<typeof groupSpellsByLevel>;
  playState?: CharacterBuildPlayState;
}

export function createCharacterExportProjection(
  summary: CharacterSheetSummary,
  description: CharacterDescription,
  playState?: CharacterBuildPlayState,
): CharacterExportProjection {
  return {
    identity: {
      name: summary.name || description.nome || "Unnamed Character",
      level: summary.level,
      className: summary.className,
      speciesName: summary.speciesName,
      backgroundName: summary.backgroundName,
    },
    narrative: [
      { id: "appearance", title: "Appearance", value: description.aparencia },
      { id: "personality", title: "Personality", value: description.personalidade },
      { id: "traits", title: "Personality Traits", value: description.tracos },
      { id: "backstory", title: "Backstory", value: description.historia },
      { id: "notes", title: "Notes", value: description.notas },
    ],
    proficiencies: {
      skills: summary.skills
        .filter((skill) => skill.isProficient || skill.isExpert)
        .map((skill) => skill.label),
      languages: [...summary.languages],
      tools: [...summary.toolProficiencies],
    },
    defenses: {
      senses: [...summary.senses],
      resistances: [...summary.resistances],
      immunities: [...summary.immunities],
      vulnerabilities: [...summary.vulnerabilities],
    },
    spellGroups: groupSpellsByLevel([
      ...(summary.spellcasting?.cantrips ?? []),
      ...(summary.spellcasting?.knownSpells ?? []),
      ...(summary.spellcasting?.preparedSpells ?? []),
    ]),
    playState,
  };
}
