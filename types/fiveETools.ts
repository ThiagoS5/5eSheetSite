export interface Raw5eWeightedAbilityChoice {
  choose?: {
    weighted?: {
      from?: string[];
      weights?: number[];
    };
  };
}

export interface Raw5eRace {
  name: string;
  source: string;
  edition?: string;
  size?: string[];
  speed?: number | Record<string, number>;
  ability?: unknown;
  entries?: unknown[];
  darkvision?: number;
}

export interface Raw5eRaceFile {
  race: Raw5eRace[];
}

export interface Raw5eBackground {
  name: string;
  source: string;
  edition?: string;
  ability?: Raw5eWeightedAbilityChoice[];
  feats?: Record<string, true>[];
  skillProficiencies?: Record<string, boolean>[];
  toolProficiencies?: Record<string, boolean>[];
  languageProficiencies?: Array<Record<string, boolean> | { any?: number }>;
  startingEquipment?: unknown[];
  entries?: unknown[];
}

export interface Raw5eBackgroundFile {
  background: Raw5eBackground[];
}

export interface Raw5eClass {
  name: string;
  source: string;
  edition?: string;
  hd?: {
    number: number;
    faces: number;
  };
  primaryAbility?: Array<Record<string, boolean>>;
  spellcastingAbility?: string;
  casterProgression?: string;
  cantripProgression?: number[];
  spellsKnownProgression?: number[];
  spellsKnownProgressionFixed?: number[];
  preparedSpells?: string;
  proficiency?: string[];
  startingProficiencies?: {
    armor?: string[];
    weapons?: Array<string | { proficiency?: string; optional?: boolean }>;
    tools?: string[];
    languages?: Array<Record<string, boolean> | { any?: number }>;
    skills?: Array<{
      choose?: {
        from?: string[];
        count?: number;
      };
      any?: number;
    }>;
  };
  startingEquipment?: {
    defaultData?: Array<Record<string, Raw5eStartingEquipmentItem[]>>;
    goldAlternative?: string;
    entries?: string[];
  };
  classFeatures?: Array<string | { classFeature: string; gainSubclassFeature?: boolean }>;
  classTableGroups?: Raw5eClassTableGroup[];
}

export interface Raw5eClassFile {
  class: Raw5eClass[];
  classFeature?: Raw5eFeature[];
  subclass?: Raw5eSubclass[];
  subclassFeature?: Raw5eFeature[];
}

export interface Raw5eSubclass {
  name: string;
  shortName?: string;
  source: string;
  className: string;
  classSource: string;
  subclassFeatures?: string[];
}

export interface Raw5eClassTableGroup {
  title?: string;
  colLabels?: string[];
  rows?: unknown[][];
  rowsSpellProgression?: unknown[][];
}

export interface Raw5eClassFluffFile {
  classFluff?: Raw5eClassFluff[];
}

export interface Raw5eClassFluff {
  name: string;
  source: string;
  entries?: unknown[];
  images?: Raw5eFluffImage[];
}

export interface Raw5eFluffImage {
  href?: {
    type: string;
    path?: string;
  };
  credit?: string;
  width?: number;
  height?: number;
}

export interface Raw5eFeature {
  name: string;
  source: string;
  className?: string;
  classSource?: string;
  subclassShortName?: string;
  level?: number;
  entries?: unknown[];
}

export interface Raw5eStartingEquipmentItem {
  item?: string;
  displayName?: string;
  quantity?: number;
  value?: number;
  equipmentType?: string;
}

export interface Raw5eItem {
  name: string;
  source: string;
  edition?: string;
  type?: string;
  weaponCategory?: string;
  property?: string[];
  mastery?: string | string[];
  ac?: number;
  dmg1?: string;
  dmgType?: string;
  range?: string;
  weight?: number;
  strength?: string | number;
  stealth?: boolean;
  value?: number;
  entries?: unknown[];
  builderSourceType?: "class" | "background" | "manual";
  rarity?: string;
  wondrous?: boolean;
  staff?: boolean;
  containerCapacity?: unknown;
  reqAttune?: boolean | string;
  reprintedAs?: string[];
}

export interface Raw5eItemFile {
  item: Raw5eItem[];
}

export interface Raw5eCharCreationOption {
  name: string;
  source: string;
  edition?: string;
  entries?: unknown[];
}

export interface Raw5eCharCreationOptionFile {
  charoption: Raw5eCharCreationOption[];
}

export interface Raw5eLanguage {
  name: string;
  source: string;
  type?: string;
}

export interface Raw5eLanguageFile {
  language: Raw5eLanguage[];
}

export interface RawPlayerLoreEntry {
  summary: string;
  entries: unknown[];
  image?: {
    src: string;
    alt: string;
    credit?: string;
  };
  placeholder?: boolean;
}

export interface RawPlayerLoreFile {
  class?: Record<string, RawPlayerLoreEntry>;
  species?: Record<string, RawPlayerLoreEntry>;
  background?: Record<string, RawPlayerLoreEntry>;
  missing?: string[];
  generatedAt?: string;
}
