import { describe, expect, it } from "vitest";
import { getFeats } from "@/src/services/ruleService";

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
