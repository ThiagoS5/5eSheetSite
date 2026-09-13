import type { BuilderBackground, BuilderClass } from "@/src/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/src/types/dnd";
import type { BuilderSpell, CharacterSpellcastingChoices } from "@/src/types/spells";
import { quickBuildSpellPriorities } from "@/src/data/quickBuildProfiles";

/** Deterministic starter choices; players can replace them in Class Features. */
export function deriveQuickBuildSpells(characterClass: BuilderClass, catalog: BuilderSpell[]): CharacterSpellcastingChoices {
  const progression = characterClass.spellcastingProgression;
  const priority = (spell: BuilderSpell) => {
    const index = quickBuildSpellPriorities.indexOf(spell.name);
    return index < 0 ? quickBuildSpellPriorities.length : index;
  };
  const byName = new Map<string, BuilderSpell>();
  for (const spell of catalog) {
    const key = spell.name.toLowerCase();
    if (!byName.has(key) || spell.source === "XPHB") byName.set(key, spell);
  }
  const spells = [...byName.values()].sort((a, b) => priority(a) - priority(b) || a.name.localeCompare(b.name));
  const leveled = spells.filter((spell) => spell.level === 1);
  return {
    cantripIds: spells.filter((spell) => spell.level === 0).slice(0, progression?.cantripsKnown[0] ?? 0).map((spell) => spell.id),
    knownSpellIds: leveled.slice(0, progression?.knownSpells[0] ?? 0).map((spell) => spell.id),
    preparedSpellIds: leveled.slice(0, progression?.preparedSpells[0] ?? 0).map((spell) => spell.id),
  };
}

export function deriveQuickBuildBackgroundBonuses(background: BuilderBackground | undefined): AttributeBonuses {
  const option = background?.abilityOptions[0];
  if (!option) return {};
  if (option.mode === "+2/+1") {
    const [major, minor] = option.attributes;
    return { ...(major ? { [major]: 2 } : {}), ...(minor ? { [minor]: 1 } : {}) } as AttributeBonuses;
  }
  return option.attributes.reduce<AttributeBonuses>((bonuses, attribute) => ({ ...bonuses, [attribute as AttributeKey]: 1 }), {});
}
