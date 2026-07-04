"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalog,
  type CatalogFilterCriteria,
} from "@/rules/itemCatalogFilters";
import type { CatalogItem, ItemCategory } from "@/types/builder";
import type { InventoryEntry } from "@/src/types/characterBuild";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

const ALL_CATEGORIES: ItemCategory[] = [
  "Armor",
  "Potion",
  "Ring",
  "Rod",
  "Scroll",
  "Staff",
  "Wand",
  "Weapon",
  "Wondrous",
  "Other Gear",
];

interface InventoryManagerProps {
  catalog: CatalogItem[];
  inventory: readonly InventoryEntry[];
  onAddItem: (itemId: string) => void;
  onSetQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function InventoryManager({
  catalog,
  inventory,
  onAddItem,
  onSetQuantity,
  onRemoveItem,
}: InventoryManagerProps) {
  const [filters, setFilters] = useState<CatalogFilterCriteria>(DEFAULT_CATALOG_FILTERS);
  const [addingId, setAddingId] = useState<string | null>(null);

  const results = useMemo(() => filterCatalog(catalog, filters), [catalog, filters]);

  async function handleAddItem(item: CatalogItem) {
    if (addingId) return; // ignore clicks while an add is in flight
    setAddingId(item.id);
    try {
      onAddItem(item.id);
      toast.success(`${item.name} added to your current inventory`);
      // Brief hold so the disabled/spinner state is visible and rapid repeat
      // clicks are throttled (the store update itself is synchronous).
      await new Promise((resolve) => setTimeout(resolve, 400));
    } finally {
      setAddingId(null);
    }
  }

  const itemMap = useMemo(
    () => new Map(catalog.map((i) => [i.id, i])),
    [catalog],
  );

  function toggleCategory(cat: ItemCategory) {
    setFilters((prev) => {
      const has = prev.categories.includes(cat);
      return {
        ...prev,
        categories: has
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  }

  const visibleResults = results.slice(0, 100);

  return (
    <section className="bg-muted rounded-lg border border-border p-4">
      <Accordion type="multiple" defaultValue={[]}>
        {/* ── Inventário Atual ── */}
        <AccordionItem value="inventory">
          <AccordionTrigger>Current Inventory</AccordionTrigger>
          <AccordionContent>
            {inventory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No items in inventory.</p>
            ) : (
              <ul className="space-y-1">
                {inventory.map((entry) => {
                  const name =
                    itemMap.get(entry.itemId)?.name ?? entry.itemId;
                  return (
                    <li
                      key={entry.itemId}
                      className="flex items-center justify-between gap-2 rounded bg-card px-3 py-2"
                    >
                      <span translate="no" className="notranslate flex-1 text-sm text-subdued">{name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Decrease ${name}`}
                          onClick={() =>
                            onSetQuantity(entry.itemId, entry.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span translate="no" className="notranslate w-6 text-center text-sm font-medium text-foreground">
                          {entry.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Increase ${name}`}
                          onClick={() =>
                            onSetQuantity(entry.itemId, entry.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${name}`}
                          className="text-primary"
                          onClick={() => onRemoveItem(entry.itemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ── Adicionar Itens ── */}
        <AccordionItem value="add">
          <AccordionTrigger>Add Items</AccordionTrigger>
          <AccordionContent>
            {/* Search */}
            <div className="mb-3">
              <Input
                aria-label="Search item"
                placeholder="Search items..."
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Category pills */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const active = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "cursor-pointer rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] transition-colors",
                      active
                        ? "border-primary bg-primary text-foreground"
                        : "border-border bg-white/5 text-muted-foreground hover:border-border/80 hover:bg-surface-raised hover:text-foreground",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Property checkboxes */}
            <div className="mb-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  title="Coming soon"
                  className="accent-brand-crimson-alt"
                />
                Proficient
              </label>
              <label className="flex items-center gap-1.5 text-xs text-subdued cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-crimson-alt"
                  checked={filters.common}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, common: e.target.checked }))
                  }
                />
                Common
              </label>
              <label className="flex items-center gap-1.5 text-xs text-subdued cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-crimson-alt"
                  checked={filters.magical}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      magical: e.target.checked,
                    }))
                  }
                />
                Magical
              </label>
              <label className="flex items-center gap-1.5 text-xs text-subdued cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand-crimson-alt"
                  checked={filters.container}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      container: e.target.checked,
                    }))
                  }
                />
                Container
              </label>
            </div>

            {/* Results count */}
            <p className="mb-2 text-xs text-muted-foreground">
              {results.length > 100
                ? `Showing 100 of ${results.length} items`
                : `${results.length} items`}
            </p>

            {/* Results list */}
            <ul className="space-y-1">
              {visibleResults.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded bg-card px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <span translate="no" className="notranslate block text-sm text-foreground truncate">
                      {item.name}
                    </span>
                    <span translate="no" className="notranslate block text-xs text-muted-foreground">
                      {item.category} / {item.source}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItem(item)}
                    disabled={addingId === item.id}
                    className={cn(
                      "shrink-0 rounded px-2 py-1 text-xs font-bold transition-colors",
                      addingId === item.id
                        ? "cursor-progress bg-muted text-muted-foreground opacity-60"
                        : "cursor-pointer bg-primary text-foreground hover:bg-primary/90",
                    )}
                  >
                    {addingId === item.id ? (
                      <i aria-hidden="true" className="fa-solid fa-spinner fa-spin" />
                    ) : (
                      "ADD"
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
