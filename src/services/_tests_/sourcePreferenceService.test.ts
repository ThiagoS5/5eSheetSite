import { describe, expect, it } from "vitest";
import {
  BASE_SOURCE_CODE,
  getAvailableSourcePreferenceOptions,
  getDefaultCreationPreferences,
  normalizeActiveSourceSelection,
} from "@/src/services/sourcePreferenceService";

describe("sourcePreferenceService", () => {
  it("builds source options from every local catalog with XPHB first", () => {
    const options = getAvailableSourcePreferenceOptions();
    const codes = options.map((option) => option.code);

    expect(codes[0]).toBe(BASE_SOURCE_CODE);
    expect(codes).toContain("EFA");
    expect(codes).toContain("XDMG");
    expect(codes).toContain("PHB");
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("formats source labels with full book names", () => {
    const options = getAvailableSourcePreferenceOptions();

    expect(options.find((option) => option.code === "XPHB")).toMatchObject({
      bookTitle: "Player's Handbook 2024",
      label: "XPHB (Player's Handbook 2024)",
      locked: true,
      inactive: false,
    });
    expect(options.find((option) => option.code === "EFA")).toMatchObject({
      bookTitle: "Eberron: Forge of the Artificer",
      label: "EFA (Eberron: Forge of the Artificer)",
      locked: false,
      inactive: false,
    });
    expect(options.find((option) => option.code === "PHB")).toMatchObject({
      bookTitle: "Player's Handbook",
      label: "PHB (Player's Handbook)",
      locked: false,
      inactive: true,
      disabledReason: "Legacy D&D 2014 source is inactive in Forge & Fate.",
    });
  });

  it("has explicit book titles for every available source", () => {
    const fallbackOptions = getAvailableSourcePreferenceOptions().filter(
      (option) => option.bookTitle === `${option.code} source`,
    );

    expect(fallbackOptions).toEqual([]);
  });

  it("uses every active source as the default creation preference", () => {
    const defaultSources = getDefaultCreationPreferences().activeSources;
    const availableSources = getAvailableSourcePreferenceOptions()
      .filter((option) => !option.inactive)
      .map((option) => option.code);

    expect(defaultSources).toEqual(availableSources);
    expect(defaultSources).not.toContain("PHB");
  });

  it("normalizes source selections by deduping, forcing XPHB, and dropping inactive PHB", () => {
    expect(normalizeActiveSourceSelection(["efa", "EFA", "PHB"])).toEqual([
      "XPHB",
      "EFA",
    ]);
  });
});
