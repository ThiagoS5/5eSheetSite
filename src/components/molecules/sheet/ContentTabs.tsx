"use client";

import { useState } from "react";
import type { CharacterSheetSummary } from "@/types/builder";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { originColorVars } from "@/src/components/organisms/sheet/sheetTheme";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";

type MainTab = "actions" | "spells" | "inventory" | "features" | "notes";
type OriginFilter = "all" | "class" | "species" | "background";
type InvFilter = "all" | "class" | "manual";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "actions",   label: "Ações",          icon: "fa-khanda" },
  { id: "spells",    label: "Magias",         icon: "fa-wand-sparkles" },
  { id: "inventory", label: "Inventário",     icon: "fa-box-open" },
  { id: "features",  label: "Características", icon: "fa-scroll" },
  { id: "notes",     label: "Anotações",      icon: "fa-feather" },
];

const ORIGIN_FILTERS: { id: OriginFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "class",      label: "Classe" },
  { id: "species",    label: "Espécie" },
  { id: "background", label: "Antecedente" },
];

const INV_FILTERS: { id: InvFilter; label: string }[] = [
  { id: "all",    label: "Todos" },
  { id: "class",  label: "Classe" },
  { id: "manual", label: "Manual" },
];

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

  const realWeapons = summary.weapons.filter((w) => w.name.trim() !== "");
  const features =
    originFilter === "all" ? summary.features : summary.features.filter((f) => f.source === originFilter);
  const equipment =
    invFilter === "all"
      ? summary.selectedEquipment
      : summary.selectedEquipment.filter((it) => it.sourceType === invFilter);

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
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Conteúdo da ficha"
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

      {/* Filter bar — only where it filters real data */}
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
        className={cn("p-4", focusRing)}
      >
        {/* AÇÕES */}
        {activeTab === "actions" && (
          <div className="flex flex-col gap-4">
            {realWeapons.length > 0 ? (
              <div>
                <p className="mb-[9px] text-[9.5px] font-bold uppercase leading-none tracking-[0.14em] text-brand-crimson-alt">
                  Armas
                </p>
                <div className="flex flex-col gap-2">
                  {realWeapons.map((w, i) => (
                    <button
                      key={`${w.name}-${i}`}
                      type="button"
                      onClick={() => setDetail({ kind: "weapon", name: w.name, attackBonus: w.attackBonus, damage: w.damage, notes: w.notes })}
                      className={cn(
                        "flex items-center gap-3 rounded-[9px] border border-border border-l-[3px] border-l-brand-crimson-alt bg-surface-nested px-[13px] py-[11px] text-left transition-colors hover:bg-card",
                        focusRing,
                      )}
                    >
                      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                        <i aria-hidden="true" className="fa-solid fa-khanda text-sm text-brand-crimson-alt" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-bold text-foreground">{w.name}</p>
                        <p className="text-[11px] text-muted-foreground">{w.notes || "—"}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-center">
                        <span className="font-serif text-[17px] font-extrabold leading-none text-primary">{w.attackBonus}</span>
                        <span className="text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Acerto</span>
                      </div>
                      <div className="flex min-w-[96px] shrink-0 items-center justify-center rounded-[7px] border border-border bg-card px-[10px] py-[7px] text-center text-xs font-semibold text-subdued">
                        {w.damage || "—"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState label="Nenhuma ação registrada." />
            )}
          </div>
        )}

        {/* MAGIAS — selector computes no spells today; intentional empty state */}
        {activeTab === "spells" && (
          <EmptyState
            label={summary.isSpellcaster ? "Nenhuma magia desta origem." : "Este personagem não possui magias."}
          />
        )}

        {/* INVENTÁRIO */}
        {activeTab === "inventory" && (
          <div className="flex flex-col gap-[14px]">
            <div className="flex flex-wrap gap-[9px]">
              <MoneyCard label="Peças de Ouro" value="—" />
              <MoneyCard label="Peças de Cobre" value="—" />
              <MoneyCard label="Carga" value="—" />
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
                          source: item.sourceType === "class" ? "Classe" : "Manual",
                          cost: item.value != null ? `${item.value} PO` : undefined,
                          armorClass: item.armorClass ?? undefined,
                        })}
                        className={cn(
                          "flex w-full items-baseline gap-[9px] rounded-lg border border-border bg-surface-nested px-[11px] py-2 text-left text-[12.5px] text-subdued transition-colors hover:bg-card",
                          focusRing,
                        )}
                      >
                        <span className={cn("font-bold", color)}>1×</span>
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState label="Nenhum item desta origem." />
            )}
          </div>
        )}

        {/* CARACTERÍSTICAS */}
        {activeTab === "features" && (
          <div className="flex flex-col gap-[10px]">
            {features.length > 0 ? (
              features.map((f) => {
                const v = originColorVars(f.source);
                return (
                  <div
                    key={`${f.source}-${f.name}`}
                    className="rounded-[9px] border border-border border-l-[3px] bg-surface-nested px-[14px] py-3"
                    style={{ borderLeftColor: v.color }}
                  >
                    <div className="mb-[5px] flex items-center justify-between gap-2">
                      <span className="font-serif text-[15px] font-bold leading-tight text-foreground">{f.name}</span>
                      <span
                        className="whitespace-nowrap rounded border px-[7px] py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: v.color, background: v.colorBg, borderColor: v.colorSoft }}
                      >
                        {f.source === "class" ? "Classe" : f.source === "species" ? "Espécie" : "Antecedente"}
                      </span>
                    </div>
                    {f.description && <p className="m-0 text-xs leading-relaxed text-subdued">{f.description}</p>}
                  </div>
                );
              })
            ) : (
              <EmptyState label="Nenhuma característica desta origem." />
            )}
          </div>
        )}

        {/* ANOTAÇÕES */}
        {activeTab === "notes" && (
          <textarea
            value={notes}
            onBlur={(e) => setDescriptionField("notas", e.target.value)}
            onChange={(e) => setDescriptionField("notas", e.target.value)}
            rows={8}
            placeholder="Escreva as anotações do personagem…"
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

function MoneyCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 basis-[90px] flex-col items-center gap-[3px] rounded-[10px] border border-border bg-surface-nested p-[11px]">
      <span className="font-serif text-xl font-extrabold text-foreground">{value}</span>
      <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
    </div>
  );
}
