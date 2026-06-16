import type { CatalogItem, ItemCategory } from "@/types/builder";

export interface CatalogFilterCriteria {
  query: string;
  categories: ItemCategory[];
  magical: boolean;
  common: boolean;
  container: boolean;
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilterCriteria = {
  query: "", categories: [], magical: false, common: false, container: false,
};

export function filterCatalog(
  items: CatalogItem[],
  criteria: CatalogFilterCriteria,
): CatalogItem[] {
  const query = criteria.query.trim().toLowerCase();

  return items.filter((item) => {
    if (query && !item.name.toLowerCase().includes(query)) {
      return false;
    }
    if (criteria.categories.length && !criteria.categories.includes(item.category)) {
      return false;
    }
    if (criteria.magical && !item.isMagical) {
      return false;
    }
    if (criteria.common && !item.isCommon) {
      return false;
    }
    if (criteria.container && !item.isContainer) {
      return false;
    }
    return true;
  });
}
