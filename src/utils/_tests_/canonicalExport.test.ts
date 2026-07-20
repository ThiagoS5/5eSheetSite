import { describe, expect, it } from "vitest";
import v5FixtureRaw from "@/src/store/_tests_/fixtures/characterBuild.v5.json";
import { normalizeCharacterBuild } from "@/src/store/characterBuildModel";
import { CHARACTER_BUILD_SCHEMA_VERSION, type CharacterBuild } from "@/src/types/characterBuild";
import { exportCharacter, serializeCharacterExport, importCharacter } from "@/src/utils/canonicalExport";

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

describe("importCharacter", () => {
  it("round-trips a build without loss (except saveId/timestamps)", () => {
    const result = importCharacter(serializeCharacterExport(baseBuild));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.build.exportMetadata.saveId).not.toBe(
      baseBuild.exportMetadata.saveId,
    );
    expect({
      ...result.build,
      exportMetadata: baseBuild.exportMetadata,
    }).toEqual(baseBuild);
  });

  it("round-trips v17 additional choices and the sanitized Foundry snapshot", () => {
    const enriched = normalizeCharacterBuild({
      ...baseBuild,
      choices: {
        ...baseBuild.choices,
        creationPreferences: {
          activeSources: ["XPHB"],
          progressionMode: "milestone",
          choiceLimits: "flexible",
        },
        additionalChoices: {
          ...baseBuild.choices.additionalChoices,
          languages: ["Infernal"],
          toolProficiencies: ["Thieves' Tools"],
        },
      },
      exportMetadata: {
        ...baseBuild.exportMetadata,
        foundryOrigin: {
          profile: "dnd5e-5.3",
          systemVersion: "5.3.3",
          actor: {
            name: "Snapshot Hero",
            type: "character",
            flags: { homebrew: { keep: true } },
          },
        },
      },
    });

    const result = importCharacter(serializeCharacterExport(enriched));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.build.choices.additionalChoices).toMatchObject({
      languages: ["Infernal"],
      toolProficiencies: ["Thieves' Tools"],
    });
    expect(result.build.exportMetadata.foundryOrigin).toMatchObject({
      profile: "dnd5e-5.3",
      actor: { flags: { homebrew: { keep: true } } },
    });
  });

  it("migrates a legacy-schema build inside the envelope", () => {
    const legacyEnvelope = {
      format: "forge-fate-character",
      formatVersion: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      app: { name: "Forge & Fate", schemaVersion: 5 },
      build: v5FixtureRaw,
    };

    const result = importCharacter(JSON.stringify(legacyEnvelope));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.build.exportMetadata.schemaVersion).toBe(
      CHARACTER_BUILD_SCHEMA_VERSION,
    );
    expect(result.build.draft.equippedItemIds).toEqual([]);
  });

  it("rejects invalid JSON with a readable message", () => {
    expect(importCharacter("{not json")).toEqual({
      ok: false,
      error: "The file is not valid JSON.",
    });
  });

  it("rejects canonical envelopes larger than 5 MiB before parsing", () => {
    expect(importCharacter("x".repeat(5 * 1024 * 1024 + 1))).toEqual({
      ok: false,
      error: "The character export exceeds the 5 MiB limit.",
    });
  });

  it("rejects JSON that is not a Forge & Fate export", () => {
    expect(importCharacter(JSON.stringify({ hello: "world" }))).toEqual({
      ok: false,
      error: "The file is not a Forge & Fate character export.",
    });
  });

  it("rejects envelopes from a newer app version", () => {
    const future = {
      ...exportCharacter(baseBuild),
      formatVersion: 2,
    };

    const result = importCharacter(JSON.stringify(future));

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("newer version");
  });

  it("strips prototype-pollution keys and leaves Object.prototype intact", () => {
    // Build the raw JSON string by hand: a `__proto__` key written in an object
    // literal would set the prototype (and be dropped by JSON.stringify), so it
    // has to reach the parser as a literal string key to test the reviver.
    const buildWithDangerousKeys =
      "{" +
      '"__proto__":{"polluted":"yes"},' +
      '"constructor":{"evil":true},' +
      JSON.stringify(baseBuild).slice(1);
    const malicious =
      "{" +
      '"format":"forge-fate-character",' +
      '"formatVersion":1,' +
      '"exportedAt":"2026-07-06T12:00:00.000Z",' +
      '"app":{"name":"Forge & Fate","schemaVersion":' +
      CHARACTER_BUILD_SCHEMA_VERSION +
      "}," +
      '"build":' +
      buildWithDangerousKeys +
      "}";

    const result = importCharacter(malicious);

    expect(result.ok).toBe(true);
    expect(
      (Object.prototype as Record<string, unknown>).polluted,
    ).toBeUndefined();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
