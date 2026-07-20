import type { BuilderSpell } from "@/src/types/spells";

export interface SpellLevelGroup {
  level: number;
  title: string;
  spells: BuilderSpell[];
}

export function getSpellLevelTitle(level: number): string {
  return level === 0 ? "Cantrips" : `Level ${level} Spells`;
}

export function dedupeSpells(spells: readonly BuilderSpell[]): BuilderSpell[] {
  const byName = new Map<string, BuilderSpell>();

  for (const spell of spells) {
    const key = `${spell.level}:${spell.name.trim().toLocaleLowerCase("en-US")}`;
    const current = byName.get(key);
    if (!current || (spell.source === "XPHB" && current.source !== "XPHB")) {
      byName.set(key, spell);
    }
  }

  return [...byName.values()];
}

export function groupSpellsByLevel(
  spells: readonly BuilderSpell[],
): SpellLevelGroup[] {
  const groups = new Map<number, BuilderSpell[]>();

  for (const spell of dedupeSpells(spells)) {
    if (!Number.isInteger(spell.level) || spell.level < 0 || spell.level > 9) continue;
    groups.set(spell.level, [...(groups.get(spell.level) ?? []), spell]);
  }

  return [...groups.entries()]
    .sort(([first], [second]) => first - second)
    .map(([level, levelSpells]) => ({
      level,
      title: getSpellLevelTitle(level),
      spells: [...levelSpells].sort((first, second) =>
        first.name.localeCompare(second.name),
      ),
    }));
}
