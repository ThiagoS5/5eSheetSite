"use client";

import { useState } from "react";
import type { CharacterSheetSummary, ItemCategory } from "@/types/builder";
import type { BuilderSpell } from "@/types/spells";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { originColorVars } from "@/src/components/organisms/sheet/sheetTheme";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";

type MainTab = "actions" | "spells" | "inventory" | "features" | "notes";
type OriginFilter = "all" | "class" | "species" | "background";
type InvFilter = "all" | "weapons" | "armor" | "utility" | "magic";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "actions",   label: "Actions",        icon: "fa-khanda" },
  { id: "spells",    label: "Spells",         icon: "fa-wand-sparkles" },
  { id: "inventory", label: "Inventory",      icon: "fa-box-open" },
  { id: "features",  label: "Features",       icon: "fa-scroll" },
  { id: "notes",     label: "Notes",          icon: "fa-feather" },
];

const ORIGIN_FILTERS: { id: OriginFilter; label: string }[] = [
  { id: "all",        label: "All" },
  { id: "class",      label: "Class" },
  { id: "species",    label: "Species" },
  { id: "background", label: "Background" },
];

const INV_FILTERS: { id: InvFilter; label: string }[] = [
  { id: "all",     label: "All" },
  { id: "weapons", label: "Weapons" },
  { id: "armor",   label: "Armor" },
  { id: "utility", label: "Utility" },
  { id: "magic",   label: "Magic" },
];

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

interface ContentTabsProps {
  summary: CharacterSheetSummary;
}

export function ContentTabs({ summary }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("actions");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [invFilter, setInvFilter] = useState<InvFilter>("all");
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const notes = useCharacterStore((s) => s.description.notas);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);
  const adjustCoin = useCharacterStore((s) => s.adjustCoin);
  const setCarriedLoadKg = useCharacterStore((s) => s.setCarriedLoadKg);
  const spendSlot = useCharacterStore((s) => s.spendSlot);

  const realWeapons = summary.weapons.filter((w) => w.name.trim() !== "");
  const features =
    originFilter === "all" ? summary.features : summary.features.filter((f) => f.source === originFilter);
  const equipment = summary.selectedEquipment.filter((it) => matchInv(it.category, invFilter));

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
              <SpellList title="Cantrips" spells={summary.spellcasting.cantrips} />
              <SpellList
                title="Spells"
                spells={[
                  ...summary.spellcasting.knownSpells,
                  ...summary.spellcasting.preparedSpells,
                ]}
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
              <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-1.5 p-0">
                {equipment.map((item, index) => {
                  const color = item.sourceType === "class" ? "text-brand-gold-alt" : "text-muted-foreground";
                  return (
                    <li key={`${item.id}-${index}`}>
                      <button
                        type="button"
                        onClick={() => setDetail({
                          kind: "equipment",
                          name: item.name,
                          qty: 1,
                          source: item.sourceType === "class" ? "Class" : "Manual",
                          cost: item.value != null ? `${item.value} GP` : undefined,
                          armorClass: item.armorClass ?? undefined,
                        })}
                        className={cn(
                          "flex w-full items-baseline gap-[9px] rounded-lg border border-border bg-surface-nested px-[11px] py-2 text-left text-[12.5px] text-subdued transition-colors hover:bg-card",
                          focusRing,
                        )}
                      >
                        <span translate="no" className={cn("notranslate font-bold", color)}>1×</span>
                        <span translate="no" className="notranslate">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
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
                        {f.source === "class" ? "Class" : f.source === "species" ? "Species" : "Background"}
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


        {activeTab === "notes" && (
          <textarea
            value={notes}
            onBlur={(e) => setDescriptionField("notas", e.target.value)}
            onChange={(e) => setDescriptionField("notas", e.target.value)}
            rows={8}
            placeholder="Write character notes..."
            className={cn(
              "h-[440px] w-full resize-y rounded-[9px] border border-border bg-background px-4 py-[14px] text-[13px] text-subdued outline-none placeholder:text-muted-foreground focus:border-primary",
              focusRing,
            )}
          />
        )}
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

function SpellList({ title, spells }: { title: string; spells: BuilderSpell[] }) {
  if (spells.length === 0) {
    return <EmptyState label={`No ${title.toLowerCase()} selected.`} />;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-2">
        {spells.map((spell) => (
          <article
            key={spell.id}
            className="rounded-lg border border-border bg-surface-nested p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 translate="no" className="notranslate font-serif text-base font-bold text-foreground">
                  {spell.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} · {spell.school} · {spell.castingTime}
                </p>
              </div>
              <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                {spell.source}
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-subdued">
              {spell.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
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
