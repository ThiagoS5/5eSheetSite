import baseItemsData from "@/public/data/items-base.json";
import itemsData from "@/public/data/items.json";
import { normalizeCatalogItem } from "@/src/adapters/itemCatalogAdapter";
import type { CatalogItem } from "@/src/types/builder";
import type { Raw5eItem } from "@/src/types/fiveETools";

const rawItems = (itemsData as { item: Raw5eItem[] }).item;
const rawBaseItems = (baseItemsData as { baseitem: Raw5eItem[] }).baseitem;

let cachedCatalog: CatalogItem[] | null = null;

export function getItemCatalog(): CatalogItem[] {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const byId = new Map<string, CatalogItem>();
  for (const rawItem of [...rawItems, ...rawBaseItems]) {
    if (rawItem.reprintedAs?.length) {
      continue;
    }
    const item = normalizeCatalogItem(rawItem);
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }

  cachedCatalog = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  return cachedCatalog;
}

export interface ToolProficiencyOption {
  id: string;
  name: string;
  source: string;
}

/** Normalized 2024 tool catalog used by flexible proficiency choices. */
export function getStandardToolProficiencies(): ToolProficiencyOption[] {
  const byName = new Map<string, ToolProficiencyOption>();

  for (const item of getItemCatalog()) {
    if (item.type !== "tool" || item.source !== "XPHB") continue;
    const key = item.name.trim().toLowerCase();
    if (!key || byName.has(key)) continue;
    byName.set(key, { id: item.id, name: item.name.trim(), source: item.source });
  }

  return [...byName.values()].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

