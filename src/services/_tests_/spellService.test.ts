import { describe, expect, it } from "vitest";
import {
  filterSpellCatalog,
  getSpellCatalogForClass,
} from "@/src/services/spellService";

describe("spellService", () => {
  it("loads XPHB spells for a class and keeps source badges available", () => {
    const spells = getSpellCatalogForClass({
      className: "Wizard",
      activeSources: ["XPHB"],
    });

    expect(spells.length).toBeGreaterThan(100);
    expect(spells.find((spell) => spell.name === "Arcane Gate")).toMatchObject({
      id: "arcane-gate-xphb",
      source: "XPHB",
      level: 6,
      school: "Conjuration",
      classNames: expect.arrayContaining(["Wizard"]),
    });
    expect(spells.every((spell) => spell.source === "XPHB")).toBe(true);
  });

  it("filters the spell catalog by name, level, school, and source", () => {
    const spells = getSpellCatalogForClass({
      className: "Wizard",
      activeSources: ["XPHB", "PHB"],
    });
    const filtered = filterSpellCatalog(spells, {
      query: "arcane gate",
      levels: [6],
      schools: ["Conjuration"],
      sources: ["XPHB"],
    });

    expect(filtered.map((spell) => spell.id)).toEqual(["arcane-gate-xphb"]);
  });

  it("preserves selected spells from disabled sources", () => {
    const legacySpell = getSpellCatalogForClass({
      className: "Wizard",
      activeSources: ["PHB"],
    }).find((spell) => spell.source === "PHB");

    expect(legacySpell).toBeDefined();

    const spells = getSpellCatalogForClass({
      className: "Wizard",
      activeSources: ["XPHB"],
      preservedSpellIds: [legacySpell!.id],
    });

    expect(spells.map((spell) => spell.id)).toContain(legacySpell!.id);
    expect(
      spells.every((spell) => spell.source === "XPHB" || spell.id === legacySpell!.id),
    ).toBe(true);
  });
});
