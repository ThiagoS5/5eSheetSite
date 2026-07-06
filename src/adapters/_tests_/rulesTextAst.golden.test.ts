import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { astToPlainText, parseRulesText } from "@/src/adapters/rulesTextAst";



const DATA_DIR = join(process.cwd(), "public", "data");

interface RawClassFeature {
  name: string;
  source: string;
  level: number;
  entries: unknown[];
}

function readClassFile(file: string): { classFeature?: RawClassFeature[] } {
  return JSON.parse(readFileSync(join(DATA_DIR, "class", file), "utf-8"));
}

describe("parseRulesText golden tests (real 5eTools data)", () => {
  it("parses Barbarian Rage (XPHB) into paragraphs, list and typed refs", () => {
    const rage = readClassFile("class-barbarian.json").classFeature?.find(
      (feature) =>
        feature.name === "Rage" && feature.source === "XPHB" && feature.level === 1,
    );

    expect(rage).toBeDefined();

    const nodes = parseRulesText(rage?.entries);

    expect(nodes.some((node) => node.type === "paragraph")).toBe(true);
    expect(nodes.some((node) => node.type === "list")).toBe(true);

    const plain = astToPlainText(nodes);
    expect(plain).toContain("primal power called Rage");
    expect(plain).toContain("Bonus Action");
    expect(plain).not.toContain("{@");
  });

  it("parses Druid Wild Shape (XPHB) table into a table node", () => {
    const wildShape = readClassFile("class-druid.json").classFeature?.find(
      (feature) =>
        feature.name === "Wild Shape" &&
        feature.source === "XPHB" &&
        feature.level === 2,
    );

    expect(wildShape).toBeDefined();

    const nodes = parseRulesText(wildShape?.entries);
    const table = nodes.find((node) => node.type === "table");

    expect(table).toBeDefined();
    expect(table?.type === "table" && table.rows.length).toBeGreaterThan(0);
  });

  it("parses the Fireball spell with damage dice and higher-level scaling", () => {
    const spells = JSON.parse(
      readFileSync(join(DATA_DIR, "spells", "spells-xphb.json"), "utf-8"),
    ) as { spell: { name: string; entries: unknown[]; entriesHigherLevel?: unknown[] }[] };

    const fireball = spells.spell.find((spell) => spell.name === "Fireball");
    expect(fireball).toBeDefined();

    const nodes = parseRulesText(fireball?.entries);
    const inline = nodes.flatMap((node) =>
      node.type === "paragraph" ? node.children : [],
    );

    expect(inline.some((node) => node.type === "dice" && node.label === "8d6")).toBe(
      true,
    );

    const higher = parseRulesText(fireball?.entriesHigherLevel);
    expect(astToPlainText(higher)).toContain("Using a Higher-Level Spell Slot");
  });

  it("never throws and never leaks raw tags for any XPHB class feature", () => {
    const classFiles = readdirSync(join(DATA_DIR, "class")).filter(
      (file) => file.startsWith("class-") && file.endsWith(".json"),
    );

    let parsedFeatures = 0;

    for (const file of classFiles) {
      const features = (readClassFile(file).classFeature ?? []).filter(
        (feature) => feature.source === "XPHB",
      );

      for (const feature of features) {
        const nodes = parseRulesText(feature.entries);
        const plain = astToPlainText(nodes);

        expect(plain, `${file} → ${feature.name}`).not.toContain("{@");
        parsedFeatures += 1;
      }
    }

    expect(parsedFeatures).toBeGreaterThan(100);
  });
});
