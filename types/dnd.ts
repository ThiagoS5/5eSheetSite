export type Ruleset = "2014" | "2024";

export type AttributeKey =
  | "forca"
  | "destreza"
  | "constituicao"
  | "inteligencia"
  | "sabedoria"
  | "carisma";

export type AttributeBonuses = Partial<Record<AttributeKey, number>>;

export type CharacterAttributes = Record<AttributeKey, number>;

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  forca: "Forca",
  destreza: "Destreza",
  constituicao: "Constituicao",
  inteligencia: "Inteligencia",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

export const ATTRIBUTE_ABBREVIATION_MAP: Record<string, AttributeKey> = {
  str: "forca",
  dex: "destreza",
  con: "constituicao",
  int: "inteligencia",
  wis: "sabedoria",
  cha: "carisma",
};
