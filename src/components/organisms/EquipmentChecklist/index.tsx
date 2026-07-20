"use client";

import { ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import type { EquipmentAcquisitionMode, EquipmentSourceKey } from "@/src/store/characterStore.types";
import type { BuilderBackground, BuilderClass, BuilderEquipmentPackage, BuilderEquipmentPackageItem } from "@/src/types/builder";
import { useBuilderHeaderToolbar } from "@/src/hooks/useBuilderHeaderToolbar";

import type { EquipmentChecklistProps } from "./index.types";
export type { EquipmentChecklistProps } from "./index.types";
interface EquipmentSourceKit {
  id: string;
  label: string;
  summary: string;
  items: BuilderEquipmentPackageItem[];
}

interface EquipmentSourceBlock {
  key: EquipmentSourceKey;
  heading: string;
  kits: EquipmentSourceKit[];
  goldLabel: string;
  summary: string;
}


function splitOptions(summary: string): { a: string; b: string } | null {
  const match = summary.match(/\(A\)\s*(.*?)\s*;?\s*or\s*\(B\)\s*(.*)$/i);
  if (!match) return null;
  const clean = (text: string) => text.replace(/[;.\s]+$/, "").trim();
  return { a: clean(match[1] ?? ""), b: clean(match[2] ?? "") };
}


function stripGoldFromItemFallback(piece: string): string {
  const withoutTrailingGold = piece.replace(
    /\s+(?:and|plus)\s+\d+(?:[.,]\d+)?\s*(?:GP|PO)\b.*$/i,
    "",
  );

  return /^\d+(?:[.,]\d+)?\s*(?:GP|PO)$/i.test(withoutTrailingGold)
    ? ""
    : withoutTrailingGold;
}

function parseItemList(
  text: string,
  { omitGold = false }: { omitGold?: boolean } = {},
): { qty?: number; label: string }[] {
  return text
    .split(",")
    .map((piece) => (omitGold ? stripGoldFromItemFallback(piece.trim()) : piece.trim()))
    .filter(Boolean)
    .map((piece) => {
      const match = piece.match(/^(\d+)\s+(.+)$/);
      if (match && !/^(gp|po|pp|pc)$/i.test(match[2] ?? "")) {
        return { qty: Number(match[1]), label: match[2] ?? piece };
      }
      return { label: piece };
    });
}

function buildEquipmentSources(
  selectedClass?: BuilderClass,
  selectedBackground?: BuilderBackground,
): EquipmentSourceBlock[] {
  const sources: EquipmentSourceBlock[] = [];

  if (selectedClass?.startingEquipmentPackages.length) {
    sources.push({
      key: "class",
      heading: "CLASS EQUIPMENT",
      kits: selectedClass.startingEquipmentPackages.map(
        (entry: BuilderEquipmentPackage) => ({
          id: entry.id,
          label: entry.label,
          summary: entry.summary,
          items: entry.items,
        }),
      ),
      goldLabel: selectedClass.startingEquipmentGold || "Starting gold",
      summary: "",
    });
  }

  if (selectedBackground?.equipmentSummary) {
    sources.push({
      key: "background",
      heading: "BACKGROUND EQUIPMENT",
      kits: [
        {
          id: "background-kit",
          label: "Background Items",
          summary: selectedBackground.equipmentSummary,
          items: selectedBackground.equipmentItemsA ?? [],
        },
      ],
      goldLabel: selectedBackground.equipmentGold ?? "Background gold",
      summary: selectedBackground.equipmentSummary ?? "",
    });
  }

  return sources;
}

export function EquipmentChecklist({
  selectedClass,
  selectedBackground,
  choicesBySource,
  equippedItemIds = [],
  onToggleEquipped,
  onSourceModeChange,
  onSourceOptionChange,
}: EquipmentChecklistProps) {
  const sources = buildEquipmentSources(selectedClass, selectedBackground);
  const toolbar = useBuilderHeaderToolbar();

  return (
    <section aria-labelledby="equipment-title" className="grid gap-5">
      <div className="grid gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
            Starting Gear
          </p>
          <h2
            id="equipment-title"
            className="mt-1 font-serif text-xl font-bold tracking-wide text-foreground"
          >
            Starting Equipment
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose between class offered items or starting gold.
          </p>
        </div>
        {toolbar}
      </div>

      {sources.map((source) => {
        const choice = choicesBySource[source.key];


        const selectedMode = choice?.mode;
        const mode: EquipmentAcquisitionMode = selectedMode ?? "items";

        return (
          <Card key={source.key} className="bg-muted ring-white/10">
            <CardHeader>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {source.heading}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <ModeButton
                  active={selectedMode === "items"}
                  label="Offered Items"
                  onClick={() => {
                    onSourceModeChange(source.key, "items");
                    if (source.kits[0]) onSourceOptionChange(source.key, source.kits[0].id);
                  }}
                />
                <ModeButton
                  active={selectedMode === "gold"}
                  label="Starting Gold"
                  onClick={() => onSourceModeChange(source.key, "gold")}
                />
              </div>

              {mode === "items" ? (
                <div className="rounded-md border border-border p-3">
                  {source.kits
                    .filter((kit) => !choice?.selectedOptionId || kit.id === choice.selectedOptionId)
                    .map((kit) => (
                    <div key={kit.id}>
                      {kit.items.filter((item) => item.value === undefined).length > 0 ? (
                        <ul className="grid gap-1 text-base text-subdued">
                          {kit.items
                            .filter((item) => item.value === undefined)
                            .map((item, index) => (
                              <EquipmentItemRow
                                key={`${kit.id}-${item.id}-${index}`}
                                item={item}
                                isEquipped={equippedItemIds.includes(item.id)}
                                onToggleEquipped={onToggleEquipped}
                              />
                            ))}
                        </ul>
                      ) : (
                        <ul className="grid gap-1 text-base text-subdued">
                          {parseItemList(splitOptions(source.summary)?.a ?? kit.summary, {
                            omitGold: source.key === "class",
                          }).map((entry, index) => (
                              <li key={`${kit.id}-a-${index}`} className="flex gap-2">
                                {entry.qty ? (
                                  <span translate="no" className="notranslate font-semibold text-foreground">
                                    {entry.qty}×
                                  </span>
                                ) : null}
                                <span translate="no" className="notranslate">{entry.label}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-accent/20 bg-accent/10 px-4 py-3 text-base font-semibold text-accent">
                  {splitOptions(source.summary)?.b ?? source.goldLabel}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

    </section>
  );
}

function EquipmentItemRow({
  item,
  isEquipped,
  onToggleEquipped,
}: {
  item: BuilderEquipmentPackageItem;
  isEquipped: boolean;
  onToggleEquipped?: (itemId: string) => void;
}) {
  return (
    <li className="flex items-center gap-2">
      <span translate="no" className="notranslate font-semibold text-foreground">
        {item.quantity}×
      </span>
      <span translate="no" className="notranslate min-w-0 flex-1">
        {item.label}
      </span>
      {onToggleEquipped ? (
        <Button
          type="button"
          variant={isEquipped ? "secondary" : "ghost"}
          size="icon"
          aria-label={`${isEquipped ? "Unequip" : "Equip"} ${item.label}`}
          onClick={() => onToggleEquipped(item.id)}
        >
          {isEquipped ? (
            <ShieldOff className="h-3 w-3" />
          ) : (
            <ShieldCheck className="h-3 w-3" />
          )}
        </Button>
      ) : null}
    </li>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
        active
          ? "border-brand-crimson-alt bg-brand-crimson-alt text-white"
          : "border-border bg-white/5 text-muted-foreground hover:border-border/80 hover:bg-surface-raised hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
