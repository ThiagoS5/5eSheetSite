import { describe, expect, it } from "vitest";
import v5FixtureRaw from "@/src/store/_tests_/fixtures/characterBuild.v5.json";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION, type CharacterBuild } from "@/src/types/characterBuild";
import { exportCharacter, serializeCharacterExport } from "@/src/utils/canonicalExport";

const baseBuild = normalizeCharacterBuild(v5FixtureRaw as unknown as CharacterBuild);

describe("exportCharacter", () => {
  it("wraps the full build in the ForgeFateExportV1 envelope", () => {
    const envelope = exportCharacter(baseBuild, "2026-07-06T12:00:00.000Z");

    expect(envelope.format).toBe("forge-fate-character");
    expect(envelope.formatVersion).toBe(1);
    expect(envelope.exportedAt).toBe("2026-07-06T12:00:00.000Z");
    expect(envelope.app).toEqual({
      name: "Forge & Fate",
      schemaVersion: CHARACTER_BUILD_SCHEMA_VERSION,
    });
    expect(envelope.build).toEqual(baseBuild);
  });

  it("serializes to pretty-printed JSON that parses back to the envelope", () => {
    const json = serializeCharacterExport(baseBuild);

    expect(JSON.parse(json)).toEqual(
      JSON.parse(JSON.stringify(exportCharacter(baseBuild, JSON.parse(json).exportedAt))),
    );
    expect(json).toContain("\n  ");
  });
});
