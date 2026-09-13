import { describe, expect, it } from "vitest";
import { resolve5eInheritance } from "@/src/adapters/fiveEToolsInheritance";

describe("5etools class inheritance", () => {
  it("resolves multi-hop copies with exact class identity and child overrides", () => {
    const records = [
      { name: "Feature", source: "XGE", classSource: "PHB", level: 1, entries: ["Original rules."] },
      { name: "Feature", source: "XGE", classSource: "XPHB", level: 3, _copy: { name: "Feature", source: "XGE", classSource: "PHB", level: 1 } },
      { name: "Renamed feature", source: "XGE", classSource: "XPHB", level: 6, _copy: { name: "Feature", source: "XGE", classSource: "XPHB", level: 3 } },
    ];
    const before = JSON.stringify(records);
    const resolved = resolve5eInheritance(records);
    expect(resolved[1]).toEqual({ name: "Feature", source: "XGE", classSource: "XPHB", level: 3, entries: ["Original rules."] });
    expect(resolved[2]).toEqual({ name: "Renamed feature", source: "XGE", classSource: "XPHB", level: 6, entries: ["Original rules."] });
    expect(JSON.stringify(records)).toBe(before);
  });

  it("rejects missing, circular, and unsupported copies instead of fabricating rules", () => {
    expect(() => resolve5eInheritance([{ name: "A", source: "XPHB", _copy: { name: "Missing" } }])).toThrow(/Missing/);
    expect(() => resolve5eInheritance([{ name: "A", source: "XPHB", _copy: { name: "B" } }, { name: "B", source: "XPHB", _copy: { name: "A" } }])).toThrow(/Circular/);
    expect(() => resolve5eInheritance([{ name: "A", source: "XPHB", _copy: { name: "B", _mod: {} } }])).toThrow(/Unsupported/);
  });
});
