import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import type { SheetSavingThrow } from "@/types/builder";
import { ATTRIBUTE_LABELS } from "@/types/dnd";
import type { AttributeKey, CharacterAttributes } from "@/types/dnd";

const ATTRIBUTE_KEYS: AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR",
  destreza: "DES",
  constituicao: "CON",
  inteligencia: "INT",
  sabedoria: "SAB",
  carisma: "CAR",
};

const ATTRIBUTE_ALIASES: Record<string, AttributeKey> = {
  forca: "forca",
  strength: "forca",
  str: "forca",
  destreza: "destreza",
  dexterity: "destreza",
  dex: "destreza",
  constituicao: "constituicao",
  constitution: "constituicao",
  con: "constituicao",
  inteligencia: "inteligencia",
  intelligence: "inteligencia",
  int: "inteligencia",
  sabedoria: "sabedoria",
  wisdom: "sabedoria",
  wis: "sabedoria",
  carisma: "carisma",
  charisma: "carisma",
  cha: "carisma",
};

export function normalizeSavingThrowAttributes(
  saves: readonly string[] = [],
): AttributeKey[] {
  const attributes = new Set<AttributeKey>();

  for (const save of saves) {
    const key = save
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    const attribute = ATTRIBUTE_ALIASES[key];
    if (attribute) {
      attributes.add(attribute);
    }
  }

  return [...attributes];
}

export function computeSavingThrows(input: {
  finalAttributes: CharacterAttributes;
  proficientSaveAttributes: AttributeKey[];
  proficiencyBonus: number;
}): SheetSavingThrow[] {
  const {
    finalAttributes,
    proficientSaveAttributes,
    proficiencyBonus,
  } = input;
  const proficientSaves = new Set(proficientSaveAttributes);

  return ATTRIBUTE_KEYS.map((key) => {
    const isProficient = proficientSaves.has(key);
    const baseMod = getAbilityModifier(finalAttributes[key]);

    return {
      attributeKey: key,
      label: ATTRIBUTE_LABELS[key],
      abbr: ATTRIBUTE_ABBR[key],
      modifier: baseMod + (isProficient ? proficiencyBonus : 0),
      isProficient,
    };
  });
}
