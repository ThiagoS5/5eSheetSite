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
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  DEFAULT_CATALOG_FILTERS,
  filterCatalog,
  type CatalogFilterCriteria,
} from "@/rules/itemCatalogFilters";
import type { CatalogItem, ItemCategory } from "@/types/builder";
import type { InventoryEntry } from "@/src/types/characterBuild";
import { Cog, Minus, Plus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
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

const SOURCE_FILTERS = [
  "AAG", "AI", "AZfyT", "AitFR-AVT", "AitFR-THP", "BAM", "BGDIA", "BGG",
  "BMT", "CM", "CRCotN", "CoA", "CoS", "DC", "DMG", "DSotDQ", "DitLCoT",
  "EET", "EFA", "EGW", "ERLW", "FRAiF", "FRHoF", "FTD", "GGR", "GoS",
  "HAT-LMI", "HftT", "HotB", "HotDQ", "IDRotF", "IMR", "JttRC", "KftGV",
  "LFL", "LLK", "LoX", "MCV2DC", "MM", "MOT", "MTF", "NF", "NRH-AT",
  "NRH-TLT", "OGA", "OotA", "PHB", "PSX", "PaBTSO", "PotA", "QftIS",
  "RHW", "RMBRE", "RoT", "RoTOS", "SCAG", "SCC", "SDW", "SKT", "SatO",
  "TCE", "TTP", "TftYP", "ToA", "UtHftLH", "VEoR", "VGM", "VRGR",
  "WBtW", "WDH", "WDMM", "WttHC", "XDMG", "XGE", "XMM", "XMtS", "XPHB",
] as const;

interface InventoryManagerProps {
  catalog: CatalogItem[];
  inventory: readonly InventoryEntry[];
  equippedItemIds: readonly string[];
  isCatalogLoading?: boolean;
  onAddItem: (itemId: string) => void;
  onSetQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onToggleEquipped: (itemId: string) => void;
}

export function InventoryManager({
  catalog,
  inventory,
  equippedItemIds,
  isCatalogLoading = false,
  onAddItem,
  onSetQuantity,
  onRemoveItem,
  onToggleEquipped,
}: InventoryManagerProps) {
  const [filters, setFilters] = useState<CatalogFilterCriteria>(DEFAULT_CATALOG_FILTERS);
  const [sourceFiltersOpen, setSourceFiltersOpen] = useState(false);

  const results = useMemo(() => filterCatalog(catalog, filters), [catalog, filters]);
  const availableSources = useMemo(
    () => new Set(catalog.map((item) => item.source)),
    [catalog],
  );

  function handleAddItem(item: CatalogItem) {
    onAddItem(item.id);
    toast.success(`${item.name} added to your current inventory`);
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

  function toggleSource(source: string) {
    setFilters((prev) => {
      const has = prev.sources.includes(source);
      return {
        ...prev,
        sources: has
          ? prev.sources.filter((entry) => entry !== source)
          : [...prev.sources, source],
      };
    });
  }

  function clearSources() {
    setFilters((prev) => ({ ...prev, sources: [] }));
  }

  const visibleResults = results.slice(0, 100);

  return (
    <section className="bg-muted rounded-lg border border-border p-4">
      <Accordion type="multiple" defaultValue={[]}>
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
                  const isEquipped = equippedItemIds.includes(entry.itemId);
                  return (
                    <li
                      key={entry.itemId}
                      className="flex items-center justify-between gap-2 rounded bg-card px-3 py-2"
                    >
                      <span translate="no" className="notranslate flex-1 text-sm text-subdued">{name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={isEquipped ? "secondary" : "ghost"}
                          size="icon"
                          aria-label={`${isEquipped ? "Unequip" : "Equip"} ${name}`}
                          onClick={() => onToggleEquipped(entry.itemId)}
                        >
                          {isEquipped ? (
                            <ShieldOff className="h-3 w-3" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                        </Button>
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

        <AccordionItem value="add">
          <AccordionTrigger>Add Items</AccordionTrigger>
          <AccordionContent>
            <div className="mb-3 flex items-center gap-2">
              <Input
                aria-label="Search item"
                placeholder="Search items..."
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                variant={sourceFiltersOpen ? "secondary" : "ghost"}
                size="icon"
                aria-label="Filter item sources"
                aria-controls="item-source-filters"
                aria-expanded={sourceFiltersOpen}
                onClick={() => setSourceFiltersOpen((open) => !open)}
              >
                <Cog className="h-4 w-4" />
              </Button>
            </div>

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

            {sourceFiltersOpen ? (
              <div
                id="item-source-filters"
                className="mb-3 rounded-md border border-border bg-card p-3"
                aria-label="Filter by source"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-subdued">Item sources</p>
                  <button
                    type="button"
                    onClick={clearSources}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                  >
                    Clear sources
                  </button>
                </div>
                <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  {SOURCE_FILTERS.map((source) => {
                    const active = filters.sources.includes(source);
                    const hasItems = availableSources.has(source);
                    return (
                      <button
                        key={source}
                        type="button"
                        aria-label={`Source ${source}`}
                        aria-pressed={active}
                        disabled={!hasItems}
                        title={hasItems ? undefined : "No catalog items loaded for this source"}
                        onClick={() => toggleSource(source)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] transition-colors",
                          active
                            ? "border-accent bg-accent text-background"
                            : "border-border bg-surface-base text-muted-foreground hover:border-border/80 hover:bg-surface-raised hover:text-foreground",
                          !hasItems && "cursor-not-allowed opacity-40 hover:bg-surface-base hover:text-muted-foreground",
                        )}
                      >
                        Source {source}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

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

            {isCatalogLoading ? (
              <ul className="space-y-1" aria-label="Loading item catalog">
                {Array.from({ length: 6 }).map((_, index) => (
                  <li
                    key={index}
                    data-testid="item-catalog-skeleton"
                    className="rounded bg-card px-3 py-2"
                  >
                    <Skeleton className="h-4 w-2/3 bg-surface-raised" />
                    <Skeleton className="mt-2 h-3 w-1/3 bg-surface-raised" />
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="mb-2 text-xs text-muted-foreground">
                  {results.length > 100
                    ? `Showing 100 of ${results.length} items`
                    : `${results.length} items`}
                </p>

                <ul className="space-y-1">
                  {visibleResults.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded bg-card px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span translate="no" className="notranslate block truncate text-sm text-foreground">
                          {item.name}
                        </span>
                        <span translate="no" className="notranslate block text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      </div>
                      <span
                        translate="no"
                        className="notranslate shrink-0 rounded border border-border bg-surface-base px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
                      >
                        {item.source}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItem(item)}
                        className={cn(
                          "shrink-0 rounded px-2 py-1 text-xs font-bold transition-colors",
                          "cursor-pointer bg-primary text-foreground hover:bg-primary/90",
                        )}
                      >
                        ADD
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
