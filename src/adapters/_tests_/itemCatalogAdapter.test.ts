import { describe, expect, it } from "vitest";
import { normalizeCatalogItem } from "@/src/adapters/itemCatalogAdapter";
import type { Raw5eItem } from "@/src/types/fiveETools";

const raw = (over: Partial<Raw5eItem>): Raw5eItem => ({ name: "X", source: "PHB", ...over });

describe("normalizeCatalogItem", () => {
  it("maps weapon type codes (with source suffix) to Weapon", () => {
    const longsword = normalizeCatalogItem(raw({
      type: "M|XPHB",
      weaponCategory: "martial",
      property: ["V"],
      dmg1: "1d8",
      dmgType: "S",
    }));
    expect(longsword.category).toBe("Weapon");
    expect(longsword.weaponCategory).toBe("martial");
    expect(longsword.weaponRangeType).toBe("melee");
    expect(longsword.weaponProperties).toEqual(["V"]);
    expect(longsword.damageDice).toBe("1d8");
    expect(longsword.damageType).toBe("S");
    expect(normalizeCatalogItem(raw({ type: "R" })).weaponRangeType).toBe("ranged");
  });
  it("maps armor codes to Armor and keeps armorClass", () => {
    const item = normalizeCatalogItem(raw({ type: "HA", ac: 18, weight: 55, strength: "Str 13", stealth: true }));
    expect(item.category).toBe("Armor");
    expect(item.armorClass).toBe(18);
    expect(item.armorType).toBe("heavy");
    expect(item.type).toBe("armor");
    expect(item.weightKg).toBeCloseTo(24.95, 2);
    expect(item.armor).toEqual({
      baseAC: 18,
      category: "heavy",
      strengthMin: 13,
      stealthDisadvantage: true,
    });
    expect(normalizeCatalogItem(raw({ type: "S|XPHB", ac: 2 })).armorType).toBe("shield");
    expect(normalizeCatalogItem(raw({ type: "S|XPHB", ac: 2 })).shieldBonus).toBe(2);
  });
  it("maps RG/RD/SC/WD/P codes to Ring/Rod/Scroll/Wand/Potion", () => {
    expect(normalizeCatalogItem(raw({ type: "RG" })).category).toBe("Ring");
    expect(normalizeCatalogItem(raw({ type: "RD" })).category).toBe("Rod");
    expect(normalizeCatalogItem(raw({ type: "SC" })).category).toBe("Scroll");
    expect(normalizeCatalogItem(raw({ type: "WD" })).category).toBe("Wand");
    expect(normalizeCatalogItem(raw({ type: "P" })).category).toBe("Potion");
  });
  it("treats the staff flag as Staff and wondrous flag as Wondrous", () => {
    expect(normalizeCatalogItem(raw({ staff: true })).category).toBe("Staff");
    expect(normalizeCatalogItem(raw({ wondrous: true, type: "SCF" })).category).toBe("Wondrous");
  });
  it("falls back to Other Gear", () => {
    expect(normalizeCatalogItem(raw({ type: "G" })).category).toBe("Other Gear");
    expect(normalizeCatalogItem(raw({ type: "G" })).type).toBe("gear");
    expect(normalizeCatalogItem(raw({})).category).toBe("Other Gear");
    expect(normalizeCatalogItem(raw({})).type).toBe("gear");
  });
  it("derives magical/common/container flags", () => {
    expect(normalizeCatalogItem(raw({ rarity: "rare" })).isMagical).toBe(true);
    expect(normalizeCatalogItem(raw({ rarity: "none" })).isMagical).toBe(false);
    expect(normalizeCatalogItem(raw({ rarity: "common" })).isCommon).toBe(true);
    expect(normalizeCatalogItem(raw({ containerCapacity: { weight: [60] } })).isContainer).toBe(true);
  });
});
