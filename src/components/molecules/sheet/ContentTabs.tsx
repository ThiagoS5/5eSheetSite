"use client";

import { useState } from "react";
import type { CharacterSheetSummary, SheetFeature } from "@/types/builder";
import { ActionCard } from "@/src/components/molecules/sheet/ActionCard";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";

type MainTab = "actions" | "spells" | "inventory" | "features" | "notes";
type ActionFilter = "all" | "class" | "species" | "background";
type FeatureFilter = "all" | "class" | "species" | "background";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "actions",    label: "Ações",           icon: "fa-bolt" },
  { id: "spells",     label: "Magias",           icon: "fa-wand-sparkles" },
  { id: "inventory",  label: "Inventário",       icon: "fa-backpack" },
  { id: "features",   label: "Características",  icon: "fa-star" },
  { id: "notes",      label: "Anotações",        icon: "fa-pen" },
];

const ACTION_FILTERS: { id: ActionFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "class",      label: "Classe" },
  { id: "species",    label: "Espécie" },
  { id: "background", label: "Antecedente" },
];

const FEATURE_FILTERS: { id: FeatureFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "class",      label: "Features de Classe" },
  { id: "species",    label: "Traços de Espécie" },
  { id: "background", label: "Antecedente" },
];

const FEATURE_SECTIONS: {
  id: FeatureFilter;
  label: string;
  icon: string;
  accent: string;
  border: string;
}[] = [
  { id: "class",      label: "Features de Classe",  icon: "fa-hat-wizard",   accent: "text-primary",    border: "border-primary/30" },
  { id: "species",    label: "Traços de Espécie",   icon: "fa-dna",          accent: "text-brand-blue", border: "border-brand-blue/30" },
  { id: "background", label: "Antecedente",          icon: "fa-book-open",    accent: "text-accent",     border: "border-accent/30" },
];

interface ContentTabsProps {
  summary: CharacterSheetSummary;
}

export function ContentTabs({ summary }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("actions");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>("all");
  const notes = useCharacterStore((s) => s.description.notas);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);

  const filteredActions: SheetFeature[] =
    actionFilter === "all"
      ? summary.features
      : summary.features.filter((f) => f.source === actionFilter);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Linha decorativa no topo */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      {/* Barra de abas — parte do card */}
      <div className="border-b border-border bg-surface-nested px-2 pt-3">
        <div
          role="tablist"
          aria-label="Conteúdo da ficha"
          className="flex gap-1 overflow-x-auto"
        >
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors",
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
      </div>

      {/* Sub-filtros — visível apenas na aba AÇÕES */}
      {activeTab === "actions" && (
        <div className="border-b border-border/50 bg-surface-nested px-3 py-2">
          <div className="flex gap-1.5 overflow-x-auto">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActionFilter(f.id)}
                className={cn(
                  "whitespace-nowrap rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors",
                  actionFilter === f.id
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Área de conteúdo rolável */}
      <div className="max-h-[34rem] flex-1 overflow-y-auto p-4">
      {/* AÇÕES */}
      {activeTab === "actions" && (
        <div>
          {filteredActions.length > 0 ? (
            <div className="grid gap-2">
              {filteredActions.map((feat) => (
                <ActionCard key={`${feat.source}-${feat.name}`} feature={feat} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma ação encontrada.</p>
          )}
        </div>
      )}

      {/* MAGIAS */}
      {activeTab === "spells" && (
        <div className="rounded-lg border border-white/[0.08] bg-card p-4 text-center">
          <i aria-hidden="true" className="fa-solid fa-wand-sparkles mb-2 text-2xl text-muted-foreground" />
          <p className="text-sm font-semibold text-subdued">
            {summary.isSpellcaster ? "Magias serão listadas em breve." : "Este personagem não possui magias."}
          </p>
        </div>
      )}

      {/* INVENTÁRIO */}
      {activeTab === "inventory" && (
        <div>
          {summary.selectedEquipment.length > 0 ? (
            <ul className="divide-y divide-white/5 rounded-lg border border-white/[0.08] bg-card overflow-hidden">
              {summary.selectedEquipment.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <i aria-hidden="true" className="fa-solid fa-circle-dot text-[10px] text-muted-foreground" />
                  <span className="flex-1 text-[0.8rem] text-foreground">{item.name}</span>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest",
                    item.sourceType === "class" ? "text-primary" : "text-muted-foreground",
                  )}>
                    {item.sourceType === "class" ? "Classe" : "Manual"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum equipamento selecionado.</p>
          )}
        </div>
      )}

      {/* CARACTERÍSTICAS — estilo documento com seções agrupadas */}
      {activeTab === "features" && (
        <div>
          {/* Sub-filtros */}
          <div className="mb-4 flex gap-1 overflow-x-auto">
            {FEATURE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFeatureFilter(f.id)}
                className={cn(
                  "whitespace-nowrap rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors",
                  featureFilter === f.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-subdued",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {summary.features.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma característica listada.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {FEATURE_SECTIONS.filter((sec) =>
                featureFilter === "all" || featureFilter === sec.id,
              ).map((sec) => {
                const items = summary.features.filter((f) => f.source === sec.id);
                if (items.length === 0) return null;
                return (
                  <div key={sec.id}>
                    {/* Section header */}
                    <div className={cn("mb-3 flex items-center gap-2 border-b pb-1.5", sec.border)}>
                      <i aria-hidden="true" className={cn(`fa-solid ${sec.icon} text-[0.7rem]`, sec.accent)} />
                      <h3 className={cn("text-[0.65rem] font-bold uppercase tracking-widest", sec.accent)}>
                        {sec.label}
                      </h3>
                    </div>
                    {/* Features as document items */}
                    <div className="flex flex-col divide-y divide-white/5">
                      {items.map((feat) => (
                        <div key={feat.name} className="py-3 first:pt-0">
                          <p className="mb-1 text-[0.85rem] font-semibold text-foreground">
                            {feat.name}
                          </p>
                          {feat.description && (
                            <p className="text-[0.75rem] leading-relaxed text-subdued">
                              {feat.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ANOTAÇÕES */}
      {activeTab === "notes" && (
        <div>
          <textarea
            value={notes}
            onBlur={(e) => setDescriptionField("notas", e.target.value)}
            onChange={(e) => setDescriptionField("notas", e.target.value)}
            rows={8}
            placeholder="Anotações livres, segredos, objetivos…"
            className="w-full resize-none rounded-lg border border-border bg-surface-nested px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}
      </div>
    </div>
  );
}
