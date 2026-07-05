import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";
import type { SheetAttribute } from "@/types/builder";

const ATTRIBUTE_KEYS: AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "STR",
  destreza: "DEX",
  constituicao: "CON",
  inteligencia: "INT",
  sabedoria: "WIS",
  carisma: "CHA",
};

export function deriveSheetAttributes(
  finalAttributes: Record<AttributeKey, number>,
): SheetAttribute[] {
  return ATTRIBUTE_KEYS.map((key) => ({
    key,
    label: ATTRIBUTE_LABELS[key],
    abbr: ATTRIBUTE_ABBR[key],
    score: finalAttributes[key],
    modifier: getAbilityModifier(finalAttributes[key]),
  }));
}
