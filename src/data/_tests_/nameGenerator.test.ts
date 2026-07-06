import { describe, expect, it } from "vitest";
import { generateRandomName } from "@/src/data/nameGenerator";
import { getPersonalDetailsRecommendations } from "@/src/data/personalDetailsRecommendations";
import { getBuilderSpecies } from "@/src/services/ruleService";

describe("generateRandomName", () => {
  it("is deterministic given an injected rng and picks from the species pool", () => {
    const species = getBuilderSpecies()[0];
    const recommendations = getPersonalDetailsRecommendations({ species });

    const first = generateRandomName(recommendations, () => 0);
    const last = generateRandomName(recommendations, () => 0.999999);

    expect(first).toBe(recommendations.names[0]);
    expect(last).toBe(
      recommendations.names[recommendations.names.length - 1],
    );
    expect(recommendations.names).toContain(generateRandomName(recommendations));
  });

  it("returns empty string for an empty pool", () => {
    const recommendations = getPersonalDetailsRecommendations({});

    expect(
      generateRandomName({ ...recommendations, names: [] }, () => 0.5),
    ).toBe("");
  });
});
