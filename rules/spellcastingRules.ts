import { getSpellById } from "@/src/services/spellService";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { BuilderClass } from "@/src/types/builder";
import { ATTRIBUTE_LABELS, type AttributeKey, type CharacterAttributes } from "@/src/types/dnd";
import type {
  BuilderSpell,
  CharacterSpellcastingChoices,
  CharacterSpellcastingSummary,
  SpellSlotSummary,
} from "@/src/types/spells";
import type { CharacterBuildAdditionalChoices } from "@/src/types/characterBuild";

const ATTRIBUTE_BY_LABEL: Record<string, AttributeKey> = {
  STR: "forca",
  Strength: "forca",
  DEX: "destreza",
  Dexterity: "destreza",
  CON: "constituicao",
  Constitution: "constituicao",
  INT: "inteligencia",
  Intelligence: "inteligencia",
  WIS: "sabedoria",
  Wisdom: "sabedoria",
  CHA: "carisma",
  Charisma: "carisma",
};

const EMPTY_CHOICES: CharacterSpellcastingChoices = {
  cantripIds: [],
  knownSpellIds: [],
  preparedSpellIds: [],
};

export function deriveSpellcastingSummary(input: {
  characterClass: BuilderClass | undefined;
  level: number;
  finalAttributes: CharacterAttributes;
  proficiencyBonus: number;
  choices?: CharacterSpellcastingChoices;
  additionalChoices?: Pick<
    CharacterBuildAdditionalChoices,
    "spellcasting" | "customSpells"
  >;
  usedSpellSlots?: Record<number, number>;
}): CharacterSpellcastingSummary | undefined {
  if (!input.characterClass?.spellcastingAbility) return undefined;

  const ability = resolveSpellcastingAbility(input.characterClass.spellcastingAbility);
  const abilityModifier = getAbilityModifier(input.finalAttributes[ability]);
  const choices = input.choices ?? EMPTY_CHOICES;
  const additionalChoices = input.additionalChoices?.spellcasting ?? EMPTY_CHOICES;
  const customSpells = new Map(
    (input.additionalChoices?.customSpells ?? []).map((spell) => [spell.id, spell]),
  );
  const progression = input.characterClass.spellcastingProgression;
  const levelIndex = Math.max(0, Math.min(19, input.level - 1));
  const slots = getSpellSlots(input.characterClass, input.level, input.usedSpellSlots ?? {});
  const resolveSpell = (id: string) => getSpellById(id) ?? customSpells.get(id);
  const cantrips = dedupeSpellsByName(
    [...choices.cantripIds, ...additionalChoices.cantripIds]
      .map(resolveSpell)
      .filter(isSpell),
  );
  const knownSpells = dedupeSpellsByName(
    [...choices.knownSpellIds, ...additionalChoices.knownSpellIds]
      .map(resolveSpell)
      .filter(isSpell),
  );
  const preparedSpells = dedupeSpellsByName(
    [...choices.preparedSpellIds, ...additionalChoices.preparedSpellIds]
      .map(resolveSpell)
      .filter(isSpell),
  );

  return {
    ability,
    abilityLabel: ATTRIBUTE_LABELS[ability],
    spellSaveDc: 8 + input.proficiencyBonus + abilityModifier,
    spellAttackBonus: input.proficiencyBonus + abilityModifier,
    cantripsKnownLimit: progression?.cantripsKnown[levelIndex] ?? 0,
    knownSpellLimit: progression?.knownSpells[levelIndex] ?? 0,
    preparedSpellLimit: progression?.preparedSpells[levelIndex] ?? 0,
    selectedCantripCount: cantrips.length,
    selectedKnownCount: knownSpells.length,
    selectedPreparedCount: preparedSpells.length,
    slots,
    cantrips,
    knownSpells,
    preparedSpells,
  };
}

function isSpell(spell: BuilderSpell | undefined): spell is BuilderSpell {
  return Boolean(spell);
}

function dedupeSpellsByName(spells: BuilderSpell[]): BuilderSpell[] {
  const byName = new Map<string, BuilderSpell>();

  for (const spell of spells) {
    const key = spell.name.toLowerCase();
    const current = byName.get(key);

    if (!current || (spell.source === "XPHB" && current.source !== "XPHB")) {
      byName.set(key, spell);
    }
  }

  return [...byName.values()];
}

export function getSpellSlots(
  characterClass: BuilderClass | undefined,
  level: number,
  usedSpellSlots: Record<number, number> = {},
): SpellSlotSummary[] {
  const progression = characterClass?.spellcastingProgression;
  const levelIndex = Math.max(0, Math.min(19, level - 1));

  if (progression?.casterProgression === "pact") {
    const slotLevel = progression.pactMagicSlotLevels?.[levelIndex] ?? 0;
    const total = progression.pactMagicSlots?.[levelIndex] ?? 0;
    if (slotLevel <= 0 || total <= 0) return [];
    const used = Math.min(total, Math.max(0, usedSpellSlots[slotLevel] ?? 0));
    return [{ level: slotLevel, total, used, remaining: total - used }];
  }

  const row = characterClass?.progressionRows[Math.max(0, Math.min(19, level - 1))];
  return (row?.spellSlots ?? [])
    .map((value, index) => ({
      level: index + 1,
      total: Number(value) || 0,
    }))
    .filter((slot) => slot.total > 0)
    .map((slot) => {
      const used = Math.min(slot.total, Math.max(0, usedSpellSlots[slot.level] ?? 0));
      return { ...slot, used, remaining: slot.total - used };
    });
}

export function getHighestSpellLevelAvailable(
  characterClass: BuilderClass | undefined,
  level: number,
): number {
  return getSpellSlots(characterClass, level).reduce(
    (highest, slot) => Math.max(highest, slot.level),
    0,
  );
}

export function isSpellcastingSelectionComplete(input: {
  cantripLimit: number;
  spellLimit: number;
  spellMode: "prepared" | "known";
  choices?: CharacterSpellcastingChoices;
}): boolean {
  const choices = input.choices ?? EMPTY_CHOICES;
  const selectedSpellCount =
    input.spellMode === "prepared"
      ? choices.preparedSpellIds.length
      : choices.knownSpellIds.length;

  return (
    choices.cantripIds.length >= input.cantripLimit &&
    selectedSpellCount >= input.spellLimit
  );
}

export function resolveSpellcastingAbility(label: string): AttributeKey {
  return ATTRIBUTE_BY_LABEL[label] ?? ATTRIBUTE_BY_LABEL[label.toUpperCase()] ?? "inteligencia";
}
