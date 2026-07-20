import { describe, expect, it } from "vitest";
import v5FixtureRaw from "./fixtures/characterBuild.v5.json";
import {
  normalizeCharacterBuild,
  flattenCharacterBuild,
  createCharacterBuildFromFlatState,
} from "@/src/store/characterBuildModel";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
} from "@/src/types/characterBuild";
import type { CharacterBuild } from "@/src/types/characterBuild";

const v5Fixture = v5FixtureRaw as unknown as CharacterBuild;

describe("schema v6 migration", () => {
  it("normalizes a real v5 build to v6 without losing data", () => {
    const build = normalizeCharacterBuild(v5Fixture);
    expect(build.exportMetadata.schemaVersion).toBe(CHARACTER_BUILD_SCHEMA_VERSION);
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBeGreaterThanOrEqual(13);

    expect(build.choices.selectedClassId).toBe(v5Fixture.choices.selectedClassId);
    expect(build.choices.money).toEqual(v5Fixture.choices.money);

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
      choiceLimits: "rules",
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

  it("drops invalid hpRoll values inherited from levelChoices during normalization", () => {
    const buildWithInvalidHpRoll: CharacterBuild = {
      ...v5Fixture,
      progression: {
        ...v5Fixture.progression,
        levelChoices: {
          ...v5Fixture.progression.levelChoices,
          "3": { classFeatureChoices: {}, hpRoll: 0 },
          "4": { classFeatureChoices: {}, hpRoll: Number.NaN },
          "5": { classFeatureChoices: {}, hpRoll: 7 },
        },
      },
    };

    const build = normalizeCharacterBuild(buildWithInvalidHpRoll);

    expect(build.progression.levelChoices["3"]?.hpRoll).toBeUndefined();
    expect(build.progression.levelChoices["3"]?.classFeatureChoices).toEqual({});
    expect(build.progression.levelChoices["4"]?.hpRoll).toBeUndefined();
    expect(build.progression.levelChoices["4"]?.classFeatureChoices).toEqual({});
    expect(build.progression.levelChoices["5"]?.hpRoll).toBe(7);
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

});
