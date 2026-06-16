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
import { Minus, Plus, Trash2 } from "lucide-react";

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

interface InventoryEntry {
  itemId: string;
  quantity: number;
}

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

  const results = useMemo(() => filterCatalog(catalog, filters), [catalog, filters]);

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
    <section className="bg-[#10121b] rounded-lg border border-white/10 p-4">
      <Accordion type="multiple" defaultValue={["inventory", "add"]}>
        {/* ── Inventário Atual ── */}
        <AccordionItem value="inventory">
          <AccordionTrigger>Inventário Atual</AccordionTrigger>
          <AccordionContent>
            {inventory.length === 0 ? (
              <p className="text-[#7a7e99] text-sm">Nenhum item no inventário.</p>
            ) : (
              <ul className="space-y-1">
                {inventory.map((entry) => {
                  const name =
                    itemMap.get(entry.itemId)?.name ?? entry.itemId;
                  return (
                    <li
                      key={entry.itemId}
                      className="flex items-center justify-between gap-2 rounded bg-[#1c1e2a] px-3 py-2"
                    >
                      <span className="flex-1 text-sm text-[#b0b5cc]">{name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Diminuir ${name}`}
                          onClick={() =>
                            onSetQuantity(entry.itemId, entry.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium text-white">
                          {entry.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Aumentar ${name}`}
                          onClick={() =>
                            onSetQuantity(entry.itemId, entry.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remover ${name}`}
                          className="text-[#e61c23]"
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
          <AccordionTrigger>Adicionar Itens</AccordionTrigger>
          <AccordionContent>
            {/* Search */}
            <div className="mb-3">
              <Input
                aria-label="Buscar item"
                placeholder="Buscar itens…"
                value={filters.query}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, query: e.target.value }))
                }
                className="bg-[#1c1e2a] border-white/10 text-white placeholder:text-[#7a7e99]"
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
                    className={[
                      "rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em]",
                      active
                        ? "border-[#e61c23] bg-[#e61c23] text-white"
                        : "border-white/10 bg-white/5 text-[#7a7e99]",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Property checkboxes */}
            <div className="mb-3 flex flex-wrap gap-4">
              <label className="flex items-center gap-1.5 text-xs text-[#7a7e99] cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  title="Em breve"
                  className="accent-[#c41e1e]"
                />
                Proficient
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#b0b5cc] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#c41e1e]"
                  checked={filters.common}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, common: e.target.checked }))
                  }
                />
                Common
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#b0b5cc] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#c41e1e]"
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
              <label className="flex items-center gap-1.5 text-xs text-[#b0b5cc] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#c41e1e]"
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
            <p className="mb-2 text-xs text-[#7a7e99]">
              {visibleResults.length} itens
            </p>

            {/* Results list */}
            <ul className="space-y-1">
              {visibleResults.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded bg-[#1c1e2a] px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-white truncate">
                      {item.name}
                    </span>
                    <span className="block text-xs text-[#7a7e99]">
                      {item.category} / {item.source}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddItem(item.id)}
                    className="rounded bg-[#e61c23] px-2 py-1 text-xs font-bold text-white shrink-0"
                  >
                    ADD
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
