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
    });
    expect(options.find((option) => option.code === "EFA")).toMatchObject({
      bookTitle: "Eberron: Forge of the Artificer",
      label: "EFA (Eberron: Forge of the Artificer)",
      locked: false,
    });
  });

  it("has explicit book titles for every available source", () => {
    const fallbackOptions = getAvailableSourcePreferenceOptions().filter(
      (option) => option.bookTitle === `${option.code} source`,
    );

    expect(fallbackOptions).toEqual([]);
  });

  it("uses every available source as the default creation preference", () => {
    const defaultSources = getDefaultCreationPreferences().activeSources;
    const availableSources = getAvailableSourcePreferenceOptions().map(
      (option) => option.code,
    );

    expect(defaultSources).toEqual(availableSources);
  });

  it("normalizes source selections by deduping and forcing XPHB", () => {
    expect(normalizeActiveSourceSelection(["efa", "EFA", "PHB"])).toEqual([
      "XPHB",
      "EFA",
      "PHB",
    ]);
  });
});
