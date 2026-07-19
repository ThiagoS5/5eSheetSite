"use client";

import { useState } from "react";
import type { CharacterSheetSummary, ItemCategory } from "@/src/types/builder";
import type { BuilderSpell } from "@/src/types/spells";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { originColorVars } from "@/src/components/organisms/sheet/sheetTheme";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";
import { SheetTabPanel } from "@/src/components/organisms/sheet/SheetTabPanel";
import { NotesPanel } from "@/src/components/organisms/sheet/NotesPanel";

import type { ContentTabsProps } from "./index.types";
export type { ContentTabsProps } from "./index.types";
type MainTab = "actions" | "spells" | "inventory" | "features" | "sheet" | "notes";
type OriginFilter = "all" | "class" | "species" | "background" | "feat";
type InvFilter = "all" | "weapons" | "armor" | "utility" | "magic";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "actions",   label: "Actions",        icon: "fa-khanda" },
  { id: "spells",    label: "Spells",         icon: "fa-wand-sparkles" },
  { id: "inventory", label: "Inventory",      icon: "fa-box-open" },
  { id: "features",  label: "Features",       icon: "fa-scroll" },
  { id: "sheet",     label: "Sheet",          icon: "fa-shield-halved" },
  { id: "notes",     label: "Notes",          icon: "fa-feather" },
];

const ORIGIN_FILTERS: { id: OriginFilter; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "class",      label: "Class" },
  { id: "species",    label: "Species" },
  { id: "background", label: "Background" },
  { id: "feat",       label: "Feats" },
];

const INV_FILTERS: { id: InvFilter; label: string }[] = [
  { id: "all",     label: "All" },
  { id: "weapons", label: "Weapons" },
  { id: "armor",   label: "Armor" },
  { id: "utility", label: "Utility" },
  { id: "magic",   label: "Magic" },
];

const ORIGIN_BADGE_LABELS: Record<Exclude<OriginFilter, "all">, string> = {
  class: "Class",
  species: "Species",
  background: "Background",
  feat: "Feat",
};

const MAGIC_CATS = new Set(["Ring", "Rod", "Scroll", "Staff", "Wand", "Wondrous", "Potion"]);

function matchInv(cat: ItemCategory, f: InvFilter): boolean {
  if (f === "all") return true;
  if (f === "weapons") return cat === "Weapon";
  if (f === "armor") return cat === "Armor";
  if (f === "utility") return cat === "Other Gear";
  return MAGIC_CATS.has(cat);
}

const chip =
  "whitespace-nowrap rounded-full border px-[14px] py-[6px] text-[11px] font-semibold transition-colors";

export function ContentTabs({ summary, description }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("actions");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [invFilter, setInvFilter] = useState<InvFilter>("all");
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const adjustCoin = useCharacterStore((s) => s.adjustCoin);
  const setCarriedLoadKg = useCharacterStore((s) => s.setCarriedLoadKg);
  const setInventoryQuantity = useCharacterStore((s) => s.setInventoryQuantity);
  const spendSlot = useCharacterStore((s) => s.spendSlot);

  const realWeapons = summary.weapons.filter((w) => w.name.trim() !== "");
  const features =
    originFilter === "all" ? summary.features : summary.features.filter((f) => f.source === originFilter);
  const equipment = summary.inventory.filter((entry) => matchInv(entry.item.category, invFilter));

  const handleTablistKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = MAIN_TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % MAIN_TABS.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + MAIN_TABS.length) % MAIN_TABS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = MAIN_TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = MAIN_TABS[nextIndex];
    setActiveTab(nextTab.id);
    document.getElementById(`tab-${nextTab.id}`)?.focus();
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">

      <div
        role="tablist"
        aria-label="Sheet content"
        className="flex gap-0.5 overflow-x-auto border-b border-border px-2"
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={handleTablistKeyDown}
            className={cn(
              "inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap border-b-2 px-[15px] py-3 text-xs font-semibold transition-colors",
              focusRing,
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <i aria-hidden="true" className={`fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>


      {activeTab === "features" && (
        <div className="flex flex-wrap items-center gap-[7px] border-b border-border bg-surface-nested px-4 py-[11px]">
          {ORIGIN_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={originFilter === f.id}
              onClick={() => setOriginFilter(f.id)}
              className={cn(
                chip,
                focusRing,
                originFilter === f.id
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border bg-surface-nested text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      {activeTab === "inventory" && (
        <div className="flex flex-wrap items-center gap-[7px] border-b border-border bg-surface-nested px-4 py-[11px]">
          {INV_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={invFilter === f.id}
              onClick={() => setInvFilter(f.id)}
              className={cn(
                chip,
                focusRing,
                invFilter === f.id
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border bg-surface-nested text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className={cn("max-h-[640px] overflow-y-auto p-4", focusRing)}
      >

        {activeTab === "actions" && (
          <div className="flex flex-col gap-4">
            {realWeapons.length > 0 ? (
              <div>
                <p className="mb-[9px] text-[9.5px] font-bold uppercase leading-none tracking-[0.14em] text-brand-crimson-alt">
                  Weapons
                </p>
                <div className="flex flex-col gap-2">
                  {realWeapons.map((w, i) => (
                    <button
                      key={`${w.name}-${i}`}
                      type="button"
                      onClick={() => setDetail({ kind: "weapon", name: w.name, attackBonus: w.attackBonus, damage: w.damage, notes: w.notes })}
                      className={cn(
                        "flex items-center gap-3 rounded-[9px] border border-border bg-surface-nested px-[13px] py-[11px] text-left transition-colors hover:bg-card",
                        focusRing,
                      )}
                    >
                      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                        <i aria-hidden="true" className="fa-solid fa-khanda text-sm text-brand-crimson-alt" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p translate="no" className="notranslate text-[13.5px] font-bold text-foreground">{w.name}</p>
                        <p className="text-[11px] text-muted-foreground">{w.notes || "—"}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-center">
                        <span translate="no" className="notranslate font-serif text-[17px] font-extrabold leading-none text-primary">{w.attackBonus}</span>
                        <span className="text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Hit</span>
                      </div>
                      <div translate="no" className="notranslate flex min-w-[96px] shrink-0 items-center justify-center rounded-[7px] border border-border bg-card px-[10px] py-[7px] text-center text-xs font-semibold text-subdued">
                        {w.damage || "—"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState label="No recorded action." />
            )}
          </div>
        )}


        {activeTab === "spells" && (
          summary.spellcasting ? (
            <div className="grid gap-4">
              <section className="rounded-lg border border-border bg-surface-nested p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Spellcasting
                    </p>
                    <p className="text-sm text-subdued">
                      DC {summary.spellcasting.spellSaveDc} · attack +{summary.spellcasting.spellAttackBonus} · {summary.spellcasting.abilityLabel}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
                    <span>{summary.spellcasting.selectedCantripCount} of {summary.spellcasting.cantripsKnownLimit} cantrips</span>
                    <span>{summary.spellcasting.selectedPreparedCount || summary.spellcasting.selectedKnownCount} of {summary.spellcasting.preparedSpellLimit || summary.spellcasting.knownSpellLimit} spells</span>
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(92px,1fr))] gap-2">
                  {summary.spellcasting.slots.map((slot) => (
                    <button
                      key={slot.level}
                      type="button"
                      onClick={() => spendSlot(slot.level)}
                      disabled={slot.remaining <= 0}
                      className={cn(
                        "rounded-lg border border-border bg-card p-3 text-left transition-colors disabled:opacity-45",
                        focusRing,
                      )}
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Level {slot.level}
                      </span>
                      <span translate="no" className="notranslate font-serif text-xl font-bold text-foreground">
                        {slot.remaining}/{slot.total}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
              <SpellList
                title="Cantrips"
                spells={summary.spellcasting.cantrips}
                onSelect={(spell) =>
                  setDetail({
                    kind: "spell",
                    name: spell.name,
                    castingTime: spell.castingTime,
                    range: spell.range,
                    duration: spell.duration,
                    components: spell.components,
                    classes: spell.classNames.join(", "),
                    description: spell.description,
                  })
                }
              />
              <SpellList
                title="Spells"
                spells={[
                  ...summary.spellcasting.knownSpells,
                  ...summary.spellcasting.preparedSpells,
                ]}
                onSelect={(spell) =>
                  setDetail({
                    kind: "spell",
                    name: spell.name,
                    castingTime: spell.castingTime,
                    range: spell.range,
                    duration: spell.duration,
                    components: spell.components,
                    classes: spell.classNames.join(", "),
                    description: spell.description,
                  })
                }
              />
            </div>
          ) : (
            <EmptyState
              label={summary.isSpellcaster ? "No spell from this origin." : "This character has no spells."}
            />
          )
        )}


        {activeTab === "inventory" && (
          <div className="flex flex-col gap-[14px]">
            <div className="flex flex-wrap gap-[9px]">
              <CoinCard label="PP" value={summary.money.pl} onDec={() => adjustCoin("pl", -1)} onInc={() => adjustCoin("pl", 1)} />
              <CoinCard label="GP" value={summary.money.po} onDec={() => adjustCoin("po", -1)} onInc={() => adjustCoin("po", 1)} />
              <CoinCard label="EP" value={summary.money.pe} onDec={() => adjustCoin("pe", -1)} onInc={() => adjustCoin("pe", 1)} />
              <CoinCard label="SP" value={summary.money.pp} onDec={() => adjustCoin("pp", -1)} onInc={() => adjustCoin("pp", 1)} />
              <CoinCard label="CP" value={summary.money.pc} onDec={() => adjustCoin("pc", -1)} onInc={() => adjustCoin("pc", 1)} />
              <div className="flex flex-1 basis-[90px] flex-col items-center gap-[3px] rounded-[10px] border border-border bg-surface-nested p-[11px]">
                <span className="font-serif text-xl font-extrabold text-foreground">
                  {summary.carry.currentKg} / {summary.carry.maxKg} kg
                </span>
                <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">Load</span>
                <div className="mt-1 flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Decrease load"
                    onClick={() => setCarriedLoadKg(summary.carry.currentKg - 1)}
                    className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label="Increase load"
                    onClick={() => setCarriedLoadKg(summary.carry.currentKg + 1)}
                    className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {equipment.length > 0 ? (
              <InventoryTable
                items={equipment}
                onSetQuantity={setInventoryQuantity}
                onSelect={(item, quantity) =>
                  setDetail({
                    kind: "equipment",
                    name: item.name,
                    qty: quantity,
                    source: formatInventorySource(item.source, item.sourceType),
                    category: item.category,
                    type: formatInventoryType(item.type),
                    cost: formatItemValue(item.value),
                    weight: formatItemWeight(item.weightKg),
                    charges: formatItemCharges(item.charges),
                    armorClass: item.armorClass ?? undefined,
                    rarity: formatRarity(item.rarity),
                    properties: item.weaponProperties?.length ? item.weaponProperties.join(", ") : undefined,
                    damage: formatItemDamage(item.damageDice, item.damageType),
                    range: item.range,
                    description: item.detail,
                  })
                }
              />
            ) : (
              <EmptyState label="No item from this origin." />
            )}
          </div>
        )}


        {activeTab === "features" && (
          <div className="flex flex-col gap-[10px]">
            {features.length > 0 ? (
              features.map((f) => {
                const v = originColorVars(f.source);
                return (
                  <div
                    key={`${f.source}-${f.name}`}
                    className="rounded-[9px] border border-border bg-surface-nested px-[14px] py-3"
                    style={{ borderLeftColor: v.color }}
                  >
                    <div className="mb-[5px] flex items-center justify-between gap-2">
                      <span translate="no" className="notranslate font-serif text-[15px] font-bold leading-tight text-foreground">{f.name}</span>
                      <span
                        className="whitespace-nowrap rounded border px-[7px] py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: v.color, background: v.colorBg, borderColor: v.colorSoft }}
                      >
                        {ORIGIN_BADGE_LABELS[f.source]}
                      </span>
                    </div>
                    {f.description && <p className="m-0 text-xs leading-relaxed text-subdued">{f.description}</p>}
                  </div>
                );
              })
            ) : (
              <EmptyState label="No feature from this origin." />
            )}
          </div>
        )}


        {activeTab === "sheet" && <SheetTabPanel summary={summary} description={description} />}

        {activeTab === "notes" && <NotesPanel />}
      </div>

      <ItemDetailModal item={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[9px] rounded-[9px] border border-dashed border-border p-4 text-[12.5px] text-muted-foreground">
      <i aria-hidden="true" className="fa-solid fa-circle-info" />
      {label}
    </div>
  );
}

function SpellList({
  title,
  spells,
  onSelect,
}: {
  title: string;
  spells: BuilderSpell[];
  onSelect: (spell: BuilderSpell) => void;
}) {
  if (spells.length === 0) {
    return <EmptyState label={`No ${title.toLowerCase()} selected.`} />;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface-nested">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead className="bg-primary/20 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2">Spell</th>
              <th scope="col" className="px-3 py-2">Level</th>
              <th scope="col" className="px-3 py-2">Casting</th>
              <th scope="col" className="px-3 py-2">Range</th>
              <th scope="col" className="px-3 py-2">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {spells.map((spell) => (
              <tr key={spell.id} className="transition-colors hover:bg-card">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onSelect(spell)}
                    className={cn("flex min-w-0 items-center gap-2 text-left", focusRing)}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-card text-brand-crimson-alt">
                      <i aria-hidden="true" className="fa-solid fa-wand-sparkles text-xs" />
                    </span>
                    <span className="min-w-0">
                      <span translate="no" className="notranslate block truncate text-[13px] font-bold text-foreground">
                        {spell.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {spell.school}
                      </span>
                    </span>
                  </button>
                </td>
                <td className="px-3 py-2 text-[12px] text-subdued">
                  {spell.level === 0 ? "Cantrip" : spell.level}
                </td>
                <td className="px-3 py-2 text-[12px] text-subdued">{spell.castingTime}</td>
                <td className="px-3 py-2 text-[12px] text-subdued">{spell.range}</td>
                <td translate="no" className="notranslate px-3 py-2 text-[11px] font-semibold text-muted-foreground">
                  {spell.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InventoryTable({
  items,
  onSelect,
  onSetQuantity,
}: {
  items: CharacterSheetSummary["inventory"];
  onSelect: (item: CharacterSheetSummary["inventory"][number]["item"], quantity: number) => void;
  onSetQuantity: (itemId: string, quantity: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface-nested">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead className="bg-primary/20 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2">Equipment</th>
            <th scope="col" className="px-3 py-2">Weight</th>
            <th scope="col" className="px-3 py-2 text-center">Quantity</th>
            <th scope="col" className="px-3 py-2">Charges</th>
            <th scope="col" className="px-3 py-2 text-right">Flags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map(({ item, quantity }, index) => {
            const canAdjustQuantity = item.sourceType === "manual";

            return (
              <tr key={`${item.id}-${index}`} className="transition-colors hover:bg-card">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    aria-label={`Open ${item.name}`}
                    onClick={() => onSelect(item, quantity)}
                    className={cn("flex min-w-0 items-center gap-2 text-left", focusRing)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-card text-muted-foreground">
                      <i aria-hidden="true" className={`fa-solid ${getInventoryIcon(item.category)} text-sm`} />
                    </span>
                    <span className="min-w-0">
                      <span translate="no" className="notranslate block truncate text-[13px] font-bold text-foreground">
                        {item.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {formatInventorySubtitle(item)}
                      </span>
                    </span>
                  </button>
                </td>
                <td translate="no" className="notranslate px-3 py-2 text-[12px] text-subdued">
                  {formatItemWeight(item.weightKg) ?? "-"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      disabled={!canAdjustQuantity}
                      onClick={() => onSetQuantity(item.id, quantity - 1)}
                      className={cn(
                        "h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-35",
                        focusRing,
                      )}
                    >
                      -
                    </button>
                    <span translate="no" className="notranslate min-w-5 text-center text-[13px] font-bold text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      disabled={!canAdjustQuantity}
                      onClick={() => onSetQuantity(item.id, quantity + 1)}
                      className={cn(
                        "h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-35",
                        focusRing,
                      )}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td translate="no" className="notranslate px-3 py-2 text-[12px] font-semibold text-subdued">
                  {formatItemCharges(item.charges) ?? "-"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2 text-muted-foreground">
                    {item.isMagical ? (
                      <i role="img" aria-label="Magical" className="fa-solid fa-sparkles text-xs text-brand-gold-alt" />
                    ) : null}
                    {item.armorClass || item.armorClassBonus || item.shieldBonus ? (
                      <i role="img" aria-label="Defensive" className="fa-solid fa-shield-halved text-xs" />
                    ) : null}
                    {item.attunementRequired ? (
                      <i role="img" aria-label="Attunement" className="fa-solid fa-link text-xs" />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getInventoryIcon(category: ItemCategory): string {
  if (category === "Weapon") return "fa-khanda";
  if (category === "Armor") return "fa-shield-halved";
  if (category === "Potion") return "fa-flask";
  if (category === "Ring") return "fa-ring";
  if (category === "Scroll") return "fa-scroll";
  if (category === "Wand" || category === "Staff" || category === "Rod") {
    return "fa-wand-sparkles";
  }
  if (category === "Wondrous") return "fa-sparkles";
  return "fa-box";
}

function formatInventorySubtitle(
  item: CharacterSheetSummary["inventory"][number]["item"],
): string {
  return [
    formatInventoryType(item.type) ?? item.category,
    formatInventorySource(item.source, item.sourceType),
  ]
    .filter(Boolean)
    .join(" - ");
}

function formatInventorySource(
  source: string,
  sourceType: CharacterSheetSummary["inventory"][number]["item"]["sourceType"],
): string {
  if (source === "Foundry VTT") return "Imported";
  if (sourceType === "class") return "Class";
  if (sourceType === "background") return "Background";
  return "Manual";
}

function formatInventoryType(type: string | undefined): string | undefined {
  if (!type) {
    return undefined;
  }

  return type.replace(/(^|-)([a-z])/g, (_match, prefix: string, char: string) =>
    `${prefix === "-" ? " " : ""}${char.toUpperCase()}`,
  );
}

function formatItemValue(value: number | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }

  if (value === 0) {
    return "0 GP";
  }

  if (value % 100 === 0) {
    return `${value / 100} GP`;
  }

  if (value % 10 === 0) {
    return `${value / 10} SP`;
  }

  return `${value} CP`;
}

function formatItemWeight(value: number | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }

  return `${value} kg`;
}

function formatItemCharges(
  charges: CharacterSheetSummary["inventory"][number]["item"]["charges"],
): string | undefined {
  if (!charges) {
    return undefined;
  }

  return `${charges.current} / ${charges.max}`;
}

function formatRarity(value: string | undefined): string | undefined {
  if (!value || value === "none") {
    return undefined;
  }

  return formatInventoryType(value);
}

function formatItemDamage(dice: string | undefined, type: string | undefined): string | undefined {
  if (!dice && !type) {
    return undefined;
  }

  return [dice, type].filter(Boolean).join(" ");
}

function CoinCard({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex flex-1 basis-[90px] flex-col items-center gap-[3px] rounded-[10px] border border-border bg-surface-nested p-[11px]">
      <span translate="no" className="notranslate font-serif text-xl font-extrabold text-foreground">{value}</span>
      <span translate="no" className="notranslate text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={onDec}
          className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}
        >
          −
        </button>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={onInc}
          className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}
        >
          +
        </button>
      </div>
    </div>
  );
}
