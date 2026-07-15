import type { CatalogItem } from "@/src/types/builder";
import type { InventoryEntry } from "@/src/types/characterBuild";

export interface InventoryManagerProps {
  catalog: CatalogItem[];
  inventory: readonly InventoryEntry[];
  equippedItemIds: readonly string[];
  isCatalogLoading?: boolean;
  onAddItem: (itemId: string) => void;
  onSetQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onToggleEquipped: (itemId: string) => void;
}
