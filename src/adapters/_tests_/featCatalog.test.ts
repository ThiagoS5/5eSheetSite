import { describe, expect, it } from "vitest";
import { getFeats } from "@/src/services/ruleService";
import {
  applyFeatEffects,
  getFeatPrerequisiteStatus,
  getSelectableFeats,
  meetsPrerequisite,
} from "@/src/adapters/featCatalog";
import type { BuilderFeat } from "@/types/builder";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";

describe("getFeats", () => {
  it("normalizes 2024 feat categories", () => {
    const feats = getFeats();
    const grappler = feats.find((f) => f.name === "Grappler" && f.source === "XPHB");
    expect(grappler?.category).toBe("general");
  });

  it("captures level + ability prerequisites (mapped to PT keys)", () => {
    const grappler = getFeats().find(
      (f) => f.name === "Grappler" && f.source === "XPHB",
    );
    expect(grappler?.prerequisites.length).toBeGreaterThanOrEqual(2);
    const hasStr = grappler?.prerequisites.some(
      (p) => p.level === 4 && p.abilities?.forca === 13,
    );
    const hasDex = grappler?.prerequisites.some(
      (p) => p.level === 4 && p.abilities?.destreza === 13,
    );
    expect(hasStr).toBe(true);
    expect(hasDex).toBe(true);
  });

  it("captures half-feat ability bonus", () => {
    const grappler = getFeats().find(
      (f) => f.name === "Grappler" && f.source === "XPHB",
    );
    expect(grappler?.abilityBonus?.choose?.from).toEqual(
      expect.arrayContaining(["forca", "destreza"]),
    );
  });

  it("includes full benefit text in the description", () => {
    const grappler = getFeats().find((f) => f.name === "Grappler" && f.source === "XPHB");
    expect(grappler).toBeDefined();
    expect((grappler?.description.length ?? 0)).toBeGreaterThan(60);
  });
});

describe("meetsPrerequisite", () => {
  const grappler = () => {
    const f = getFeats().find((x) => x.name === "Grappler" && x.source === "XPHB");
    if (!f) throw new Error("Grappler missing");
    return f;
  };
  const ctx = (over = {}) => ({
    level: 4,
    finalAttributes: {
      forca: 15, destreza: 8, constituicao: 10,
      inteligencia: 10, sabedoria: 10, carisma: 10,
    },
    chosenFeatIds: [] as string[],
    ...over,
  });

  it("passes when one OR-branch is satisfied", () => {
    expect(meetsPrerequisite(grappler(), ctx())).toBe(true);
  });

  it("fails when level is too low", () => {
    expect(meetsPrerequisite(grappler(), ctx({ level: 1 }))).toBe(false);
  });

  it("fails when no ability threshold is met", () => {
    expect(
      meetsPrerequisite(
        grappler(),
        ctx({
          finalAttributes: {
            forca: 8, destreza: 8, constituicao: 10,
            inteligencia: 10, sabedoria: 10, carisma: 10,
          },
        }),
      ),
    ).toBe(false);
  });

  it("passes a feat with no prerequisites", () => {
    const noPrereq = getFeats().find((f) => f.prerequisites.length === 0);
    expect(noPrereq && meetsPrerequisite(noPrereq, ctx())).toBe(true);
  });

  it("requires all prerequisite feats to be owned (feat chain)", () => {
    const chained: BuilderFeat = {
      id: "x", name: "X", source: "XPHB", category: "general" as const,
      prerequisites: [{ feat: ["grappler-xphb"] }],
      repeatable: false, description: "",
    };
    const base = {
      level: 4,
      finalAttributes: {
        forca: 10, destreza: 10, constituicao: 10,
        inteligencia: 10, sabedoria: 10, carisma: 10,
      },
    };
    expect(meetsPrerequisite(chained, { ...base, chosenFeatIds: [] })).toBe(false);
    expect(
      meetsPrerequisite(chained, { ...base, chosenFeatIds: ["grappler-xphb"] }),
    ).toBe(true);
  });
});

describe("getSelectableFeats", () => {
  it("excludes chosen non-repeatable feats but keeps repeatable ones", () => {
    const feats = getFeats();
    const ctx = {
      level: 19,
      finalAttributes: {
        forca: 20, destreza: 20, constituicao: 20,
        inteligencia: 20, sabedoria: 20, carisma: 20,
      },
      chosenFeatIds: [] as string[],
    };

    const selectable = getSelectableFeats("general", feats, ctx);
    expect(selectable.every((f) => f.category === "general")).toBe(true);

    const nonRepeatable = selectable.find((f) => !f.repeatable);
    const repeatable = selectable.find((f) => f.repeatable);
    if (!nonRepeatable || !repeatable) {
      throw new Error("expected both a repeatable and a non-repeatable general feat in the catalog");
    }

    const afterNonRep = getSelectableFeats("general", feats, {
      ...ctx, chosenFeatIds: [nonRepeatable.id],
    });
    expect(afterNonRep.some((f) => f.id === nonRepeatable.id)).toBe(false);

    const afterRep = getSelectableFeats("general", feats, {
      ...ctx, chosenFeatIds: [repeatable.id],
    });
    expect(afterRep.some((f) => f.id === repeatable.id)).toBe(true);
  });

  it("does not offer epic boons before level 19", () => {
    const feats = getFeats();
    const ctx = {
      level: 18,
      finalAttributes: {
        forca: 20, destreza: 20, constituicao: 20,
        inteligencia: 20, sabedoria: 20, carisma: 20,
      },
      chosenFeatIds: [] as string[],
    };

    expect(getSelectableFeats("epic-boon", feats, ctx)).toEqual([]);
    expect(getSelectableFeats("epic-boon", feats, { ...ctx, level: 19 }).length).toBeGreaterThan(0);
  });

  it("does not offer the ASI pseudo-feat in the feat list", () => {
    const feats = getFeats();
    const ctx = {
      level: 4,
      finalAttributes: {
        forca: 20, destreza: 20, constituicao: 20,
        inteligencia: 20, sabedoria: 20, carisma: 20,
      },
      chosenFeatIds: [] as string[],
    };

    const selectable = getSelectableFeats("general", feats, ctx);

    expect(selectable.some((feat) => feat.id === "ability-score-improvement-xphb")).toBe(false);
    expect(selectable.some((feat) => feat.name === "Ability Score Improvement")).toBe(false);
  });

  it("returns a visible reason when prerequisites block a feat", () => {
    const grappler = getFeats().find((f) => f.name === "Grappler" && f.source === "XPHB");
    if (!grappler) throw new Error("Grappler missing");

    const status = getFeatPrerequisiteStatus(grappler, {
      level: 3,
      finalAttributes: {
        forca: 8, destreza: 8, constituicao: 10,
        inteligencia: 10, sabedoria: 10, carisma: 10,
      },
      chosenFeatIds: [],
    });

    expect(status.met).toBe(false);
    expect(status.reason).toMatch(/nivel 4/i);
    expect(status.reason).toMatch(/forca 13|destreza 13/i);
  });
});

describe("applyFeatEffects", () => {
  const baseChoice = (
    overrides: Partial<Extract<AsiOrFeatChoice, { mode: "feat" }>> = {},
  ): AsiOrFeatChoice => ({
    mode: "feat",
    featId: "test",
    ...overrides,
  });

  it("applies curated initiative bonuses from Alert (2024: adds proficiency bonus)", () => {
    const alert = getFeats().find((f) => f.name === "Alert" && f.source === "XPHB");
    if (!alert) throw new Error("Alert missing");

    const effects = applyFeatEffects(undefined, alert, baseChoice());
    expect(effects.initiativeAddsProficiencyBonus).toBe(true);
    expect(effects.initiativeBonus).toBe(0);
  });

  it("applies curated speed bonuses from Boon of Speed", () => {
    const boon = getFeats().find((f) => f.name === "Boon of Speed" && f.source === "XPHB");
    if (!boon) throw new Error("Boon of Speed missing");

    expect(applyFeatEffects(undefined, boon, baseChoice()).speedBonusFeet).toBe(30);
  });

  it("routes epic boon ability bonuses separately (cap 30)", () => {
    const boon = getFeats().find((f) => f.name === "Boon of Speed" && f.source === "XPHB");
    if (!boon) throw new Error("Boon of Speed missing");

    const effects = applyFeatEffects(undefined, boon, baseChoice({ asi: { destreza: 1 } }));
    expect(effects.epicBoonAbilityBonuses).toEqual({ destreza: 1 });
    expect(effects.abilityBonuses).toEqual({});
  });

  it("applies curated speed bonuses from Speedy", () => {
    const speedy = getFeats().find((f) => f.name === "Speedy" && f.source === "XPHB");
    if (!speedy) throw new Error("Speedy missing");

    expect(applyFeatEffects(undefined, speedy, baseChoice()).speedBonusFeet).toBe(10);
  });

  it("applies the chosen ability from a half-feat", () => {
    const grappler = getFeats().find((f) => f.name === "Grappler" && f.source === "XPHB");
    if (!grappler) throw new Error("Grappler missing");

    expect(
      applyFeatEffects(undefined, grappler, baseChoice({ asi: { forca: 1 } })).abilityBonuses,
    ).toEqual({ forca: 1 });
  });

  it("applies selected proficiencies from a half-feat", () => {
    const skillExpert = getFeats().find((f) => f.name === "Skill Expert" && f.source === "XPHB");
    if (!skillExpert) throw new Error("Skill Expert missing");

    expect(skillExpert.effects?.choiceRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "ability", count: 1 }),
        expect.objectContaining({ kind: "skill", count: 1 }),
      ]),
    );
    expect(
      applyFeatEffects(
        undefined,
        skillExpert,
        baseChoice({
          asi: { sabedoria: 1 },
          skillProficiencies: ["Perception"],
        }),
      ),
    ).toMatchObject({
      abilityBonuses: { sabedoria: 1 },
      skillProficiencies: ["Perception"],
    });
  });
});
