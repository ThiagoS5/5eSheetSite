import { describe, expect, it } from "vitest";
import { getBuilderClasses } from "@/src/services/ruleService";
import { deriveSpellcastingSummary, getSpellSlots } from "@/rules/spellcastingRules";

const attributes = { forca: 10, destreza: 10, constituicao: 10, inteligencia: 16, sabedoria: 16, carisma: 16 };
const derive = (classId: string, level: number, selectedSubclassId?: string) => deriveSpellcastingSummary({ characterClass: getBuilderClasses().find((c) => c.id === classId), level, selectedSubclassId, finalAttributes: attributes, proficiencyBonus: 2 });
describe("automatic class and subclass spells", () => {
  it("grants Hunter's Mark without consuming Ranger preparation choices", () => {
    const summary = derive("ranger-xphb", 1)!;
    expect(summary.preparedSpells.map((spell) => spell.name)).toContain("Hunter's Mark");
    expect(summary.selectedPreparedCount).toBe(0);
    expect(summary.preparedSpellLimit).toBe(2);
  });
  it("unlocks oath spells at the correct levels without duplicating spells", () => {
    expect(derive("paladin-xphb", 2, "oath-of-devotion-xphb")!.grantedSpells!.map((spell) => spell.name)).toEqual(["Divine Smite"]);
    const spells = derive("paladin-xphb", 5, "oath-of-devotion-xphb")!.grantedSpells!;
    expect(spells.map((spell) => spell.name)).toEqual(expect.arrayContaining(["Divine Smite", "Find Steed", "Aid", "Zone of Truth"]));
    expect(new Set(spells.map((spell) => spell.id)).size).toBe(spells.length);
  });
  it("keeps domain grants isolated when switching subclasses", () => {
    expect(derive("cleric-xphb", 5, "light-domain-xphb")!.preparedSpells.map((s) => s.name)).toContain("Fireball");
    expect(derive("cleric-xphb", 5, "life-domain-xphb")!.preparedSpells.map((s) => s.name)).not.toContain("Fireball");
  });
  it("does not grant the entire expanded Wizard list to a Fighter", () => {
    const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb")!;
    expect(fighter.subclasses.find((s) => s.id === "eldritch-knight-xphb")?.grantedSpells).toEqual([]);
  });
  it("keeps 2024 full, half, and pact slot progressions distinct through level 20", () => {
    const get = (id: string) => getBuilderClasses().find((c) => c.id === id)!;
    expect(getSpellSlots(get("wizard-xphb"), 20).map((s) => s.total)).toEqual([4,3,3,3,3,2,2,1,1]);
    expect(getSpellSlots(get("paladin-xphb"), 1).map((s) => s.total)).toEqual([2]);
    expect(getSpellSlots(get("warlock-xphb"), 20)).toEqual([{ level: 5, total: 4, used: 0, remaining: 4 }]);
  });
});
