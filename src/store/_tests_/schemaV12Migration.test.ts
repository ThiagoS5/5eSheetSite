import { describe, expect, it } from "vitest";
import v5FixtureRaw from "./fixtures/characterBuild.v5.json";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import {
  CHARACTER_BUILD_SCHEMA_VERSION,
  type CharacterBuild,
} from "@/src/types/characterBuild";

const legacyFixture = v5FixtureRaw as unknown as CharacterBuild;

describe("schema v12 migration", () => {
  it("bumps the schema version to 13", () => {
    expect(CHARACTER_BUILD_SCHEMA_VERSION).toBe(13);
  });

  it("defaults portraitId to empty string for older builds", () => {
    const build = normalizeCharacterBuild(legacyFixture);

    expect(build.exportMetadata.schemaVersion).toBe(13);
    expect(build.draft.description.portraitId).toBe("");
  });

  it("preserves a chosen portraitId through normalization", () => {
    const build = normalizeCharacterBuild({
      ...legacyFixture,
      draft: {
        ...legacyFixture.draft,
        description: {
          ...legacyFixture.draft.description,
          portraitId: "portrait-ember-knight",
        },
      },
    });

    expect(build.draft.description.portraitId).toBe("portrait-ember-knight");
  });
});
