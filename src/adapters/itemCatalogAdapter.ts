import { toSlug } from "@/src/adapters/fiveEToolsAdapter";
import type { CatalogItem, ItemCategory } from "@/types/builder";
import type { Raw5eItem } from "@/types/fiveETools";

const TYPE_TO_CATEGORY: Record<string, ItemCategory> = {
  M: "Weapon", R: "Weapon",
  LA: "Armor", MA: "Armor", HA: "Armor", S: "Armor",
  P: "Potion", RG: "Ring", RD: "Rod", SC: "Scroll", WD: "Wand", ST: "Staff",
};

function resolveCategory(rawItem: Raw5eItem): ItemCategory {
  const code = (rawItem.type ?? "").split("|")[0];
  if (TYPE_TO_CATEGORY[code]) {
    return TYPE_TO_CATEGORY[code];
  }
  if (rawItem.staff) {
    return "Staff";
  }
  if (rawItem.wondrous) {
    return "Wondrous";
  }
  return "Other Gear";
}

export function normalizeCatalogItem(rawItem: Raw5eItem): CatalogItem {
  const rarity = rawItem.rarity;

  return {
    id: toSlug(rawItem.name, rawItem.source),
    name: rawItem.name,
    source: rawItem.source,
    category: resolveCategory(rawItem),
    isMagical: Boolean(rarity) && rarity !== "none",
    isCommon: rarity === "common",
    isContainer: rawItem.containerCapacity != null,
    armorClass: rawItem.ac,
    value: rawItem.value,
  };
}
