import { describe, expect, it } from "vitest";
import { getLevelRequirements } from "@/rules/levelProgression";
import { getBuilderClasses } from "@/src/services/ruleService";

function fighter() {
  const c = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");
  if (!c) throw new Error("fighter-xphb missing");
  return c;
}

describe("getLevelRequirements", () => {
  it("emits a single subclass requirement at level 3 (deduped)", () => {
    const reqs = getLevelRequirements(fighter(), 0, 20);
    const subclassReqs = reqs.filter((r) => r.kind === "subclass");
    expect(subclassReqs).toHaveLength(1);
    expect(subclassReqs[0].level).toBe(3);
  });

  it("emits asi-or-feat at each ASI level", () => {
    const reqs = getLevelRequirements(fighter(), 0, 8);
    const asiLevels = reqs
      .filter((r) => r.kind === "asi-or-feat")
      .map((r) => r.level);
    expect(asiLevels).toContain(4);
    expect(asiLevels).toContain(6);
  });

  it("emits nothing for an out-of-range interval", () => {
    const reqs = getLevelRequirements(fighter(), 4, 5);
    expect(reqs.every((r) => r.level > 4 && r.level <= 5)).toBe(true);
    expect(reqs.some((r) => r.kind === "subclass")).toBe(false);
  });

  it("emits a feature-option for Weapon Mastery at level 1", () => {
    const reqs = getLevelRequirements(fighter(), 0, 1);
    const wm = reqs.find(
      (r) => r.kind === "feature-option" && r.featureName === "Weapon Mastery",
    );
    expect(wm).toBeDefined();
  });
});
