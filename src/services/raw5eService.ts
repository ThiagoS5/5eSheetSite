export type Raw5eDataPath = `${string}.json`;

export interface Raw5eNamedEntry {
  type?: "entries";
  name: string;
  entries?: Raw5eEntry[];
  [key: string]: unknown;
}

export interface Raw5eListEntry {
  type?: "list";
  items?: Raw5eEntry[];
  [key: string]: unknown;
}

export interface Raw5eTableEntry {
  type?: "table";
  caption?: string;
  colLabels?: string[];
  rows?: unknown[];
  [key: string]: unknown;
}

export interface Raw5eItemEntry {
  type?: "item";
  name?: string;
  entry?: string;
  entries?: Raw5eEntry[];
  [key: string]: unknown;
}

export type Raw5eEntry =
  | string
  | Raw5eNamedEntry
  | Raw5eListEntry
  | Raw5eTableEntry
  | Raw5eItemEntry;

export interface Raw5eWeightedAbilityChoice {
  choose?: {
    weighted?: {
      from?: string[];
      weights?: number[];
    };
  };
}

export interface Raw5eFeature {
  name: string;
  source: string;
  page?: number;
  entries?: Raw5eEntry[];
  className?: string;
  classSource?: string;
  level?: number;
  edition?: string;
  [key: string]: unknown;
}

export interface Raw5eClass {
  name: string;
  source: string;
  page?: number;
  edition?: string;
  hd?: {
    number: number;
    faces: number;
  };
  proficiency?: string[];
  startingProficiencies?: {
    armor?: string[];
    weapons?: string[];
    skills?: Array<{
      choose?: {
        from?: string[];
        count?: number;
      };
    }>;
  };
  startingEquipment?: {
    default?: string[];
    defaultData?: Array<Record<string, unknown[]>>;
    goldAlternative?: string;
    entries?: string[];
  };
  classFeatures?: Array<string | { classFeature: string; gainSubclassFeature?: boolean }>;
  [key: string]: unknown;
}

export interface Raw5eClassFile {
  _meta?: Record<string, unknown>;
  class: Raw5eClass[];
  subclass?: unknown[];
  classFeature?: Raw5eFeature[];
  subclassFeature?: Raw5eFeature[];
}

export interface Raw5eRace {
  name: string;
  source: string;
  page?: number;
  edition?: string;
  size?: string[];
  speed?: number | Record<string, number>;
  ability?: unknown;
  traitTags?: string[];
  languageProficiencies?: unknown[];
  entries?: Raw5eEntry[];
  [key: string]: unknown;
}

export interface Raw5eRaceFile {
  _meta?: Record<string, unknown>;
  race: Raw5eRace[];
  subrace?: unknown[];
}

export interface Raw5eBackground {
  name: string;
  source: string;
  page?: number;
  edition?: string;
  ability?: Raw5eWeightedAbilityChoice[];
  feats?: Record<string, true>[];
  skillProficiencies?: Record<string, boolean>[];
  toolProficiencies?: Record<string, boolean>[];
  startingEquipment?: unknown[];
  entries?: Raw5eEntry[];
  [key: string]: unknown;
}

export interface Raw5eBackgroundFile {
  _meta?: Record<string, unknown>;
  background: Raw5eBackground[];
}

export interface Raw5eFeat {
  name: string;
  source: string;
  page?: number;
  edition?: string;
  category?: string;
  entries?: Raw5eEntry[];
  [key: string]: unknown;
}

export interface Raw5eFeatFile {
  _meta?: Record<string, unknown>;
  feat: Raw5eFeat[];
}

export interface Raw5eItem {
  name: string;
  source: string;
  page?: number;
  edition?: string;
  type?: string;
  rarity?: string;
  ac?: number;
  value?: number;
  entries?: Raw5eEntry[];
  builderSourceType?: "class" | "background" | "manual";
  [key: string]: unknown;
}

export interface Raw5eItemFile {
  _meta?: Record<string, unknown>;
  item: Raw5eItem[];
  itemGroup?: unknown[];
}

export async function fetchRaw5eJson<T>(path: Raw5eDataPath): Promise<T> {
  const url = toRaw5eUrl(path);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch 5etools data: ${url}`);
  }

  return (await response.json()) as T;
}

function toRaw5eUrl(path: Raw5eDataPath): string {
  if (
    path.startsWith("/") ||
    path.includes("..") ||
    path.includes("\\") ||
    !path.endsWith(".json")
  ) {
    throw new Error("Invalid 5etools data path");
  }

  return `/data/${path}`;
}
