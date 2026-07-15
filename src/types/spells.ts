import type { AttributeKey } from "@/src/types/dnd";

export type SpellSchool =
  | "Abjuration"
  | "Conjuration"
  | "Divination"
  | "Enchantment"
  | "Evocation"
  | "Illusion"
  | "Necromancy"
  | "Transmutation"
  | "Unknown";

export interface BuilderSpell {
  id: string;
  name: string;
  source: string;
  level: number;
  school: SpellSchool;
  schoolCode: string;
  classNames: string[];
  castingTime: string;
  range: string;
  duration: string;
  components: string;
  description: string;
}

export interface SpellCatalogFilter {
  query?: string;
  levels?: number[];
  schools?: SpellSchool[];
  sources?: string[];
}

export interface CharacterSpellcastingChoices {
  cantripIds: string[];
  knownSpellIds: string[];
  preparedSpellIds: string[];
}

export interface SpellSlotSummary {
  level: number;
  total: number;
  used: number;
  remaining: number;
}

export interface CharacterSpellcastingSummary {
  ability: AttributeKey;
  abilityLabel: string;
  spellSaveDc: number;
  spellAttackBonus: number;
  cantripsKnownLimit: number;
  knownSpellLimit: number;
  preparedSpellLimit: number;
  selectedCantripCount: number;
  selectedKnownCount: number;
  selectedPreparedCount: number;
  slots: SpellSlotSummary[];
  cantrips: BuilderSpell[];
  knownSpells: BuilderSpell[];
  preparedSpells: BuilderSpell[];
}
