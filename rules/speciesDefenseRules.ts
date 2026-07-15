import type { BuilderSpecies } from "@/src/types/builder";

export function deriveSpeciesResistances(
  species: BuilderSpecies | undefined,
  speciesChoices: Record<string, string>,
): string[] {
  if (!species) return [];

  const resolved: string[] = [];
  for (const entry of species.resistances) {
    if (typeof entry === "string") {
      resolved.push(entry);
      continue;
    }
    const chosen = resolveChosenDamageType(species, speciesChoices, entry.chooseFrom);
    if (chosen) resolved.push(chosen);
  }

  return [...new Set(resolved.map(capitalizeDamageType))];
}

export function deriveSpeciesImmunities(species: BuilderSpecies | undefined): string[] {
  return (species?.immunities ?? []).map(capitalizeDamageType);
}

export function deriveSpeciesVulnerabilities(species: BuilderSpecies | undefined): string[] {
  return (species?.vulnerabilities ?? []).map(capitalizeDamageType);
}

// Choice-based resistances (e.g. Draconic Ancestry) store the damage type in the
// selected option's description column.
function resolveChosenDamageType(
  species: BuilderSpecies,
  speciesChoices: Record<string, string>,
  chooseFrom: string[],
): string | undefined {
  for (const group of species.choiceGroups) {
    const selectedValue = speciesChoices[group.id];
    if (!selectedValue) continue;
    const option = group.options.find((entry) => entry.value === selectedValue);
    const candidate = option?.description?.trim().toLowerCase();
    if (candidate && chooseFrom.includes(candidate)) return candidate;
  }
  return undefined;
}

function capitalizeDamageType(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
