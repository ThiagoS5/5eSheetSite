import { describe, expect, it } from "vitest";
import { groupSpellsByLevel } from "@/src/utils/spellGrouping";
import type { BuilderSpell } from "@/src/types/spells";

function spell(id: string, name: string, level: number, source = "XPHB"): BuilderSpell {
  return {
    id,
    name,
    level,
    source,
    school: "Evocation",
    schoolCode: "V",
    classNames: ["Wizard"],
    castingTime: "1 action",
    range: "60 feet",
    duration: "Instantaneous",
    components: "V, S",
    description: "",
  };
}

describe("groupSpellsByLevel", () => {
  it("deduplicates known and prepared spells and emits only present levels", () => {
    const groups = groupSpellsByLevel([
      spell("light", "Light", 0),
      spell("shield-known", "Shield", 1, "PHB"),
      spell("shield-prepared", "Shield", 1, "XPHB"),
      spell("fly", "Fly", 3),
    ]);

    expect(groups.map((group) => group.title)).toEqual([
      "Cantrips",
      "Level 1 Spells",
      "Level 3 Spells",
    ]);
    expect(groups[1]?.spells).toEqual([
      expect.objectContaining({ id: "shield-prepared", source: "XPHB" }),
    ]);
  });
});
