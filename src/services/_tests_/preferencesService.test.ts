/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  readGlobalPreferences,
  writeGlobalPreferences,
} from "@/src/services/preferencesService";
import { DEFAULT_CREATION_PREFERENCES } from "@/src/types/characterBuild";

describe("preferencesService", () => {
  beforeEach(() => localStorage.clear());

  it("returns defaults when nothing is stored", () => {
    expect(readGlobalPreferences()).toEqual({
      creationDefaults: DEFAULT_CREATION_PREFERENCES,
    });
  });

  it("round-trips preferences", () => {
    writeGlobalPreferences({
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
    });
    expect(readGlobalPreferences().creationDefaults.progressionMode).toBe("milestone");
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("forge-fate-preferences:v1", "{not json");
    expect(readGlobalPreferences().creationDefaults).toEqual(DEFAULT_CREATION_PREFERENCES);
  });
});
