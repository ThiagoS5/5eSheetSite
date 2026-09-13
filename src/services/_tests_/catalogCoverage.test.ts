import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { is2024Source, toSlug } from "@/src/adapters/fiveEToolsAdapter";
import { getBuilderBackgrounds, getBuilderClasses, getBuilderSpecies, getFeats } from "@/src/services/ruleService";
import { getSpellCatalog } from "@/src/services/spellService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import type { Raw5eItem } from "@/src/types/fiveETools";

function readData(file: string) {
  return JSON.parse(readFileSync(path.join(process.cwd(), "public/data", file), "utf8"));
}

describe("local 5etools catalog coverage", () => {
  it("does not discard items whose reprint is absent from the local data", () => {
    const items = [...readData("items.json").item, ...readData("items-base.json").baseitem] as Raw5eItem[];
    const availableIds = new Set(items.map((item) => toSlug(item.name, item.source)));
    const catalogIds = new Set(getItemCatalog().map((item) => item.id));
    for (const item of items) {
      const replaced = item.reprintedAs?.some((reference) => {
        if (typeof reference !== "string" && reference.tag && reference.tag !== "item") return false;
        const [name, source] = (typeof reference === "string" ? reference : reference.uid).split("|");
        return availableIds.has(toSlug(name, source || "DMG"));
      });
      if (!replaced) expect(catalogIds.has(toSlug(item.name, item.source)), item.name).toBe(true);
    }
  });
  it("retains every eligible 2024 class, species, background, and feat", () => {
    const classRecords = readdirSync("public/data/class").flatMap((file) => readData(`class/${file}`).class);
    const collections = [
      { raw: classRecords, normalized: getBuilderClasses() },
      { raw: readData("races.json").race, normalized: getBuilderSpecies() },
      { raw: readData("backgrounds.json").background, normalized: getBuilderBackgrounds() },
      { raw: readData("feats.json").feat, normalized: getFeats() },
    ];
    for (const { raw, normalized } of collections) {
      const eligible = (raw as { name: string; source: string; edition?: string }[])
        .filter((entry) => is2024Source(entry.source, entry.edition))
        .map((entry) => toSlug(entry.name, entry.source)).sort();
      expect(normalized.map((entry) => entry.id).sort()).toEqual(eligible);
    }
  });

  it("resolves text for every available class and subclass feature", () => {
    const missing: string[] = [];
    for (const characterClass of getBuilderClasses()) {
      for (const feature of characterClass.allFeatures) {
        if (!feature.description || feature.description === "Class feature details.") {
          missing.push(`${characterClass.id}: ${feature.name} (${feature.level})`);
        }
      }
      for (const subclass of characterClass.subclasses) {
        if (!subclass.features.length) missing.push(`${characterClass.id}/${subclass.id}: no features`);
        for (const feature of subclass.features) {
          if (!feature.description || feature.description === "Subclass feature details.") {
            missing.push(`${characterClass.id}/${subclass.id}: ${feature.name} (${feature.level})`);
          }
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("normalizes every spell file and joins the supplied class lists", () => {
    const spells = getSpellCatalog();
    const ids = new Set(spells.map((spell) => spell.id));
    const lookup = readData("spells/sources.json");
    for (const file of readdirSync("public/data/spells").filter((file) => file.startsWith("spells-"))) {
      for (const raw of readData(`spells/${file}`).spell) {
        expect(ids.has(toSlug(raw.name, raw.source)), `${file}: ${raw.name}`).toBe(true);
        const normalized = spells.find((spell) => spell.id === toSlug(raw.name, raw.source))!;
        for (const reference of lookup[raw.source]?.[raw.name]?.class ?? []) {
          expect(normalized.classNames, raw.name).toContain(reference.name);
        }
      }
    }
  });
});
