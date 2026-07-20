import { describe, expect, it } from "vitest";
import {
  deriveAdditionalFeatureSummaries,
  mergeAdditionalSenses,
} from "@/rules/additionalChoiceRules";
import { createEmptyAdditionalChoices } from "@/src/store/characterBuildModel";

describe("additional choice rules", () => {
  it("deduplicates senses by name and keeps the longest range", () => {
    expect(
      mergeAdditionalSenses(
        [{ name: "Darkvision", rangeFeet: 60 }],
        [{ name: "darkvision", rangeFeet: 120 }, { name: "Blindsight", rangeFeet: 10 }],
      ),
    ).toEqual([
      { name: "darkvision", rangeFeet: 120 },
      { name: "Blindsight", rangeFeet: 10 },
    ]);
  });

  it("maps catalog feats and custom features without inventing unknown feats", () => {
    const additional = createEmptyAdditionalChoices();
    additional.featIds = ["alert", "unknown"];
    additional.customFeatures = [{ name: "Gift of the Moon", description: "Homebrew feature." }];

    expect(
      deriveAdditionalFeatureSummaries(additional, [
        {
          id: "alert",
          name: "Alert",
          source: "XPHB",
          category: "origin",
          prerequisites: [],
          repeatable: false,
          description: "Act quickly.",
        },
      ]),
    ).toEqual([
      { name: "Alert", description: "Act quickly.", source: "feat" },
      { name: "Gift of the Moon", description: "Homebrew feature.", source: "custom" },
    ]);
  });
});
