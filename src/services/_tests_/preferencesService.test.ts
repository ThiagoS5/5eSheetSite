/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  CURRENT_GLOBAL_PREFERENCES_VERSION,
  readGlobalPreferences,
  writeGlobalPreferences,
} from "@/src/services/preferencesService";
import { getDefaultCreationPreferences } from "@/src/services/sourcePreferenceService";

describe("preferencesService", () => {
  beforeEach(() => localStorage.clear());

  it("returns defaults when nothing is stored", () => {
    expect(readGlobalPreferences()).toEqual({
      preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
      creationDefaults: getDefaultCreationPreferences(),
    });
  });

  it("round-trips preferences", () => {
    writeGlobalPreferences({
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
    });
    expect(readGlobalPreferences().creationDefaults.progressionMode).toBe("milestone");
    expect(readGlobalPreferences().preferencesVersion).toBe(
      CURRENT_GLOBAL_PREFERENCES_VERSION,
    );
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("forge-fate-preferences:v1", "{not json");
    expect(readGlobalPreferences().creationDefaults).toEqual(
      getDefaultCreationPreferences(),
    );
  });

  it("upgrades legacy XPHB-only defaults to every active source", () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
      }),
    );

    expect(readGlobalPreferences().creationDefaults).toEqual(
      getDefaultCreationPreferences("milestone"),
    );
    expect(readGlobalPreferences().creationDefaults.activeSources).not.toContain("PHB");
  });

  it("preserves unversioned custom source preferences while forcing XPHB", () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        creationDefaults: { activeSources: ["EFA"], progressionMode: "xp" },
      }),
    );

    expect(readGlobalPreferences().creationDefaults).toEqual({
      activeSources: ["XPHB", "EFA"],
      progressionMode: "xp",
    });
  });

  it("preserves versioned XPHB-only custom preferences", () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
        creationDefaults: { activeSources: ["XPHB"], progressionMode: "xp" },
      }),
    );

    expect(readGlobalPreferences().creationDefaults).toEqual({
      activeSources: ["XPHB"],
      progressionMode: "xp",
    });
  });

  it("forces XPHB into custom saved source preferences", () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
        creationDefaults: { activeSources: ["EFA"], progressionMode: "xp" },
      }),
    );

    expect(readGlobalPreferences().creationDefaults.activeSources).toEqual([
      "XPHB",
      "EFA",
    ]);
  });

  it("removes inactive PHB from saved source preferences", () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
        creationDefaults: { activeSources: ["PHB", "XPHB", "EFA"], progressionMode: "xp" },
      }),
    );

    expect(readGlobalPreferences().creationDefaults.activeSources).toEqual([
      "XPHB",
      "EFA",
    ]);
  });

  it("persists beginner mode beside creation defaults", () => {
    writeGlobalPreferences({
      beginnerMode: true,
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
    });

    expect(readGlobalPreferences()).toEqual({
      preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
      beginnerMode: true,
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
    });
  });
});
