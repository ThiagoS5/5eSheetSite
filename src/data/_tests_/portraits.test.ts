import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PORTRAIT_OPTIONS, getPortraitById } from "@/src/data/portraits";

describe("portraits manifest", () => {
  it("has at least 8 options with unique ids and alt text", () => {
    expect(PORTRAIT_OPTIONS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(PORTRAIT_OPTIONS.map((p) => p.id)).size).toBe(
      PORTRAIT_OPTIONS.length,
    );
    for (const portrait of PORTRAIT_OPTIONS) {
      expect(portrait.alt.length).toBeGreaterThan(0);
      expect(portrait.src).toMatch(/^\/portraits\/.+\.svg$/);
    }
  });

  it("every manifest entry points to a real file in public/portraits", () => {
    for (const portrait of PORTRAIT_OPTIONS) {
      const filePath = join(process.cwd(), "public", portrait.src);
      expect(readFileSync(filePath, "utf-8")).toContain("<svg");
    }
  });

  it("getPortraitById resolves known ids and returns null otherwise", () => {
    expect(getPortraitById("portrait-ember-knight")?.src).toBe(
      "/portraits/portrait-ember-knight.svg",
    );
    expect(getPortraitById("nope")).toBeNull();
    expect(getPortraitById(undefined)).toBeNull();
    expect(getPortraitById("")).toBeNull();
  });
});
