import { describe, expect, it } from "vitest";
import { deriveClassResources, recoverClassResources } from "@/rules/classResourceRules";

const finalAttributes = { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 16 };
const resources = (classId: string, level: number) => deriveClassResources({ classId, level, finalAttributes });
describe("2024 class resources", () => {
  it("scales fighter uses and restores only one Second Wind on short rests", () => {
    const pools = resources("fighter-xphb", 17);
    expect(pools.map((pool) => pool.maxUses)).toEqual([4, 2, 3]);
    expect(recoverClassResources({ "second-wind": 4, "action-surge": 2, indomitable: 3 }, pools)).toEqual({ "second-wind": 3, indomitable: 3 });
  });
  it("keeps Arcane Recovery spent through a short rest", () => {
    expect(recoverClassResources({ "arcane-recovery": 1 }, resources("wizard-xphb", 5))).toEqual({ "arcane-recovery": 1 });
  });
  it("uses full-level point pools and changes Bard recovery at level 5", () => {
    expect(resources("monk-xphb", 1)).toEqual([]);
    expect(resources("monk-xphb", 20)[0]).toMatchObject({ maxUses: 20, shortRestRecovery: "all" });
    expect(resources("sorcerer-xphb", 8)[0].maxUses).toBe(8);
    expect(resources("bard-xphb", 4)[0]).toMatchObject({ maxUses: 3, shortRestRecovery: 0 });
    expect(resources("bard-xphb", 5)[0].shortRestRecovery).toBe("all");
  });
  it("does not invent resource pools for unknown classes", () => { expect(resources("homebrew", 20)).toEqual([]); });
});
