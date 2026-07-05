import { getSpellById } from "@/src/services/spellService";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { BuilderClass } from "@/types/builder";
import { ATTRIBUTE_LABELS, type AttributeKey, type CharacterAttributes } from "@/types/dnd";
import type {
  BuilderSpell,
  CharacterSpellcastingChoices,
  CharacterSpellcastingSummary,
  SpellSlotSummary,
} from "@/types/spells";

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
  usedSpellSlots?: Record<number, number>;
}): CharacterSpellcastingSummary | undefined {
  if (!input.characterClass?.spellcastingAbility) return undefined;

  const ability = resolveSpellcastingAbility(input.characterClass.spellcastingAbility);
  const abilityModifier = getAbilityModifier(input.finalAttributes[ability]);
  const choices = input.choices ?? EMPTY_CHOICES;
  const progression = input.characterClass.spellcastingProgression;
  const levelIndex = Math.max(0, Math.min(19, input.level - 1));
  const slots = getSpellSlots(input.characterClass, input.level, input.usedSpellSlots ?? {});

  return {
    ability,
    abilityLabel: ATTRIBUTE_LABELS[ability],
    spellSaveDc: 8 + input.proficiencyBonus + abilityModifier,
    spellAttackBonus: input.proficiencyBonus + abilityModifier,
    cantripsKnownLimit: progression?.cantripsKnown[levelIndex] ?? 0,
    knownSpellLimit: progression?.knownSpells[levelIndex] ?? 0,
    preparedSpellLimit: progression?.preparedSpells[levelIndex] ?? 0,
    selectedCantripCount: choices.cantripIds.length,
    selectedKnownCount: choices.knownSpellIds.length,
    selectedPreparedCount: choices.preparedSpellIds.length,
    slots,
    cantrips: choices.cantripIds.map(getSpellById).filter(isSpell),
    knownSpells: choices.knownSpellIds.map(getSpellById).filter(isSpell),
    preparedSpells: choices.preparedSpellIds.map(getSpellById).filter(isSpell),
  };
}

function isSpell(spell: BuilderSpell | undefined): spell is BuilderSpell {
  return Boolean(spell);
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
