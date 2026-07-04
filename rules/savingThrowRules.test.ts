import { describe, expect, it } from "vitest";
import { computeSavingThrows } from "@/rules/savingThrowRules";
import type { CharacterAttributes } from "@/types/dnd";

const attributes: CharacterAttributes = {
  forca: 16,
  destreza: 14,
  constituicao: 12,
  inteligencia: 10,
  sabedoria: 13,
  carisma: 8,
};

describe("saving throw rules", () => {
  it("uses canonical attribute keys instead of display labels for proficiency", () => {
    const savingThrows = computeSavingThrows({
      finalAttributes: attributes,
      proficientSaveAttributes: ["forca", "constituicao"],
      proficiencyBonus: 2,
    });

    expect(savingThrows.find((save) => save.attributeKey === "forca")).toMatchObject({
      label: "Strength",
      abbr: "STR",
      modifier: 5,
      isProficient: true,
    });
    expect(
      savingThrows.find((save) => save.attributeKey === "constituicao"),
    ).toMatchObject({
      label: "Constitution",
      abbr: "CON",
      modifier: 3,
      isProficient: true,
    });
    expect(
      savingThrows.find((save) => save.attributeKey === "destreza"),
    ).toMatchObject({
      modifier: 2,
      isProficient: false,
    });
  });
});
