import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG_FILTERS, filterCatalog } from "@/rules/itemCatalogFilters";
import type { CatalogItem } from "@/types/builder";

const item = (over: Partial<CatalogItem>): CatalogItem => ({
  id: over.name ? over.name.toLowerCase() : "x", name: "X", source: "PHB",
  category: "Other Gear", isMagical: false, isCommon: false, isContainer: false, ...over,
});

const sword = item({ name: "Longsword", category: "Weapon" });
const ring = item({ name: "Ring of Protection", category: "Ring", isMagical: true });
const potion = item({ name: "Common Potion", category: "Potion", isMagical: true, isCommon: true });
const bag = item({ name: "Bag of Holding", category: "Wondrous", isMagical: true, isContainer: true });
const xphbShield = item({ name: "Shield", source: "XPHB", category: "Armor" });
const all = [sword, ring, potion, bag, xphbShield];

describe("filterCatalog", () => {
  it("returns all items with default filters", () => {
    expect(filterCatalog(all, DEFAULT_CATALOG_FILTERS)).toHaveLength(5);
  });
  it("matches the search query case-insensitively by name", () => {
    expect(filterCatalog(all, { ...DEFAULT_CATALOG_FILTERS, query: "ring" })).toEqual([ring]);
  });
  it("filters by selected categories (OR)", () => {
    expect(filterCatalog(all, { ...DEFAULT_CATALOG_FILTERS, categories: ["Weapon", "Ring"] }))
      .toEqual([sword, ring]);
  });
  it("filters by magical, common and container flags (AND)", () => {
    expect(filterCatalog(all, { ...DEFAULT_CATALOG_FILTERS, magical: true })).toEqual([ring, potion, bag]);
    expect(filterCatalog(all, { ...DEFAULT_CATALOG_FILTERS, common: true })).toEqual([potion]);
    expect(filterCatalog(all, { ...DEFAULT_CATALOG_FILTERS, container: true })).toEqual([bag]);
  });
  it("filters by source badges", () => {
    expect(filterCatalog(all, { ...DEFAULT_CATALOG_FILTERS, sources: ["XPHB"] }))
      .toEqual([xphbShield]);
  });
});
