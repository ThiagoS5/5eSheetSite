import { describe, expect, it } from "vitest";
import v5FixtureRaw from "./fixtures/characterBuild.v5.json";
import {
  normalizeCharacterBuild,
  flattenCharacterBuild,
  createCharacterBuildFromFlatState,
} from "@/src/store/characterBuildModel";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
  DEFAULT_CREATION_PREFERENCES,
} from "@/src/types/characterBuild";
import type { CharacterBuild } from "@/src/types/characterBuild";

const v5Fixture = v5FixtureRaw as unknown as CharacterBuild;

describe("schema v6 migration", () => {
  it("normalizes a real v5 build to v6 without losing data", () => {
    const build = normalizeCharacterBuild(v5Fixture);
    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(6);
    // v5 data preserved
    expect(build.choices.selectedClassId).toBe(v5Fixture.choices.selectedClassId);
    expect(build.choices.money).toEqual(v5Fixture.choices.money);
    // v6 fields defaulted, not invented
    expect(build.choices.creationPreferences).toBeUndefined();
    for (const choice of Object.values(build.progression.levelChoices)) {
      expect(choice.hpRoll).toBeUndefined();
    }
  });

  it("round-trips hpRoll and creationPreferences through flat state", () => {
    const build = normalizeCharacterBuild(v5Fixture);
    build.progression.levelChoices["3"] = {
      classFeatureChoices: {},
      hpRoll: 7,
    };
    build.choices.creationPreferences = {
      activeSources: ["XPHB"],
      progressionMode: "milestone",
    };
    const flat = flattenCharacterBuild(build);
    expect(flat.hpRollByLevel?.["3"]).toBe(7);
    expect(flat.creationPreferences?.progressionMode).toBe("milestone");
    const rebuilt = createCharacterBuildFromFlatState(
      { ...flat } as never,
      build,
    );
    expect(rebuilt.progression.levelChoices["3"]?.hpRoll).toBe(7);
    expect(rebuilt.choices.creationPreferences?.progressionMode).toBe("milestone");
  });

  it("accepts 'roll-4d6' as a generation method after normalization", () => {
    const build = normalizeCharacterBuild({
      ...v5Fixture,
      choices: {
        ...v5Fixture.choices,
        attributeGenerationMethod: "roll-4d6",
      },
    });
    expect(build.choices.attributeGenerationMethod).toBe("roll-4d6");
  });

  it("exposes DEFAULT_CREATION_PREFERENCES with XPHB + xp", () => {
    expect(DEFAULT_CREATION_PREFERENCES).toEqual({
      activeSources: ["XPHB"],
      progressionMode: "xp",
    });
  });
});
