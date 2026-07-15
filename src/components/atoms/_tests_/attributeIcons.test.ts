import { describe, expect, it } from "vitest";
import { ATTRIBUTE_ICON_CLASS } from "@/src/components/atoms/attributeIcons";

describe("ATTRIBUTE_ICON_CLASS", () => {
  it("provides a Font Awesome class for every attribute key", () => {
    const keys = Object.keys(ATTRIBUTE_ICON_CLASS);

    expect(keys.sort()).toEqual(
      ["carisma", "constituicao", "destreza", "forca", "inteligencia", "sabedoria"].sort(),
    );
    for (const iconClass of Object.values(ATTRIBUTE_ICON_CLASS)) {
      expect(iconClass).toMatch(/^fa-solid fa-[\w-]+$/);
    }
  });
});
