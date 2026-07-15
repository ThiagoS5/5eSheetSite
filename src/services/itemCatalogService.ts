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

