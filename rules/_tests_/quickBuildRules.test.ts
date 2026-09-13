import { describe, expect, it } from "vitest";
import { deriveQuickBuildSpells } from "@/rules/quickBuildRules";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getSpellCatalogForClass } from "@/src/services/spellService";

describe("quick-build spell choices", () => {
  it("deduplicates reprints, prefers 2024, and never chooses a higher-level spell", () => {
    const wizard = getBuilderClasses().find((entry) => entry.id === "wizard-xphb")!;
    const catalog = getSpellCatalogForClass({ className: "Wizard" });
    const choices = deriveQuickBuildSpells(wizard, catalog);
    expect(choices.cantripIds).toHaveLength(3);
    expect(choices.preparedSpellIds).toHaveLength(4);
    const chosen = [...choices.cantripIds, ...choices.preparedSpellIds].map((id) => catalog.find((spell) => spell.id === id)!);
    expect(new Set(chosen.map((spell) => spell.name)).size).toBe(7);
    expect(chosen.every((spell) => spell.source === "XPHB" && spell.level <= 1)).toBe(true);
    expect(deriveQuickBuildSpells(wizard, [...catalog].reverse())).toEqual(choices);
  });

  it("does not invent missing catalog entries", () => {
    const wizard = getBuilderClasses().find((entry) => entry.id === "wizard-xphb")!;
    expect(deriveQuickBuildSpells(wizard, [])).toEqual({ cantripIds: [], knownSpellIds: [], preparedSpellIds: [] });
  });
});
