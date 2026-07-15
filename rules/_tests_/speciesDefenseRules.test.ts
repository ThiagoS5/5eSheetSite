import { describe, expect, it } from "vitest";
import { deriveSpeciesResistances } from "@/rules/speciesDefenseRules";
import { getBuilderSpecies } from "@/src/services/ruleService";

function speciesById(id: string) {
  const species = getBuilderSpecies().find((entry) => entry.id === id);
  if (!species) throw new Error(`species fixture missing: ${id}`);
  return species;
}

describe("deriveSpeciesResistances", () => {
  it("derives fixed resistances from real 2024 data", () => {
    expect(deriveSpeciesResistances(speciesById("aasimar-xphb"), {})).toEqual([
      "Necrotic",
      "Radiant",
    ]);
    expect(deriveSpeciesResistances(speciesById("dwarf-xphb"), {})).toEqual(["Poison"]);
  });

  it("resolves choice-based resistances from the species choice", () => {
    const dragonborn = speciesById("dragonborn-xphb");

    expect(
      deriveSpeciesResistances(dragonborn, { "draconic-ancestry": "black" }),
    ).toEqual(["Acid"]);
    expect(
      deriveSpeciesResistances(dragonborn, { "draconic-ancestry": "silver" }),
    ).toEqual(["Cold"]);
  });

  it("returns no choice-based resistance while the choice is pending", () => {
    expect(deriveSpeciesResistances(speciesById("dragonborn-xphb"), {})).toEqual([]);
  });

  it("returns empty for species without resistances and for no species", () => {
    expect(deriveSpeciesResistances(speciesById("human-xphb"), {})).toEqual([]);
    expect(deriveSpeciesResistances(undefined, {})).toEqual([]);
  });
});
