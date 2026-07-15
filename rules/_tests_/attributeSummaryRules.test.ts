import { describe, expect, it } from "vitest";
import { deriveSheetAttributes } from "@/rules/attributeSummaryRules";
import type { AttributeKey } from "@/src/types/dnd";

const finalAttributes: Record<AttributeKey, number> = {
  forca: 16,
  destreza: 14,
  constituicao: 13,
  inteligencia: 10,
  sabedoria: 8,
  carisma: 7,
};

describe("deriveSheetAttributes", () => {
  it("returns the six attributes in canonical sheet order", () => {
    const attributes = deriveSheetAttributes(finalAttributes);

    expect(attributes.map((attribute) => attribute.key)).toEqual([
      "forca",
      "destreza",
      "constituicao",
      "inteligencia",
      "sabedoria",
      "carisma",
    ]);
  });

  it("pairs each score with its 5e ability modifier", () => {
    const attributes = deriveSheetAttributes(finalAttributes);
    const byKey = new Map(attributes.map((attribute) => [attribute.key, attribute]));

    expect(byKey.get("forca")).toMatchObject({ score: 16, modifier: 3 });
    expect(byKey.get("destreza")).toMatchObject({ score: 14, modifier: 2 });
    expect(byKey.get("constituicao")).toMatchObject({ score: 13, modifier: 1 });
    expect(byKey.get("inteligencia")).toMatchObject({ score: 10, modifier: 0 });
    expect(byKey.get("sabedoria")).toMatchObject({ score: 8, modifier: -1 });
    expect(byKey.get("carisma")).toMatchObject({ score: 7, modifier: -2 });
  });

  it("exposes the English abbreviation alongside the label", () => {
    const attributes = deriveSheetAttributes(finalAttributes);

    expect(attributes.map((attribute) => attribute.abbr)).toEqual([
      "STR",
      "DEX",
      "CON",
      "INT",
      "WIS",
      "CHA",
    ]);
    for (const attribute of attributes) {
      expect(attribute.label).toBeTruthy();
    }
  });
});
