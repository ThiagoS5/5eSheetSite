import { describe, expect, it } from "vitest";
import { getFeats } from "@/src/services/ruleService";
import { getSelectableFeats, meetsPrerequisite } from "@/src/adapters/featCatalog";
import type { BuilderFeat } from "@/types/builder";

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
});
