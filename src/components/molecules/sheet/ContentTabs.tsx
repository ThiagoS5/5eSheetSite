"use client";

import { useState } from "react";
import type { CharacterSheetSummary, SheetFeature } from "@/types/builder";
import { ActionCard } from "@/src/components/molecules/sheet/ActionCard";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";

type MainTab = "actions" | "spells" | "inventory" | "features" | "notes";
type ActionFilter = "all" | "class" | "species" | "background";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "actions",    label: "Ações" },
  { id: "spells",     label: "Magias" },
  { id: "inventory",  label: "Inventário" },
  { id: "features",   label: "Características" },
  { id: "notes",      label: "Anotações" },
];

const ACTION_FILTERS: { id: ActionFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "class",      label: "Classe" },
  { id: "species",    label: "Espécie" },
  { id: "background", label: "Antecedente" },
];

interface ContentTabsProps {
  summary: CharacterSheetSummary;
}

export function ContentTabs({ summary }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("actions");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const notes = useCharacterStore((s) => s.description.notas);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);

  const filteredFeatures: SheetFeature[] =
    actionFilter === "all"
      ? summary.features
      : summary.features.filter((f) => f.source === actionFilter);

  return (
    <div className="flex flex-col gap-3">
      {/* Main tab bar */}
      <div
        role="tablist"
        aria-label="Conteúdo da ficha"
        className="flex gap-0.5 overflow-x-auto rounded-lg border border-white/10 bg-[#10121b] p-0.5"
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded px-2 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest transition-colors",
              activeTab === tab.id
                ? "bg-[#1c1e2a] text-white"
                : "text-[#7a7e99] hover:text-[#b0b5cc]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "actions" && (
        <div>
          {/* Sub-filter */}
          <div className="mb-3 flex gap-1 overflow-x-auto">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActionFilter(f.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition-colors",
                  actionFilter === f.id
                    ? "border-[#e61c23]/50 bg-[#e61c23]/15 text-[#e61c23]"
                    : "border-white/10 text-[#7a7e99] hover:text-[#b0b5cc]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filteredFeatures.length > 0 ? (
            <div className="grid gap-2">
              {filteredFeatures.map((feat) => (
                <ActionCard key={`${feat.source}-${feat.name}`} feature={feat} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7a7e99]">Nenhuma ação encontrada.</p>
          )}
        </div>
      )}

      {activeTab === "spells" && (
        <div>
          {summary.isSpellcaster ? (
            <p className="text-sm text-[#7a7e99]">
              Magias serão listadas aqui em uma versão futura.
            </p>
          ) : (
            <p className="text-sm text-[#7a7e99]">Este personagem não possui magias.</p>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div>
          {summary.selectedEquipment.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.selectedEquipment.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#1c1e2a] px-3 py-2 text-sm"
                >
                  <span className="flex-1 text-[#e8e9f0]">{item.name}</span>
                  <span className="text-[0.65rem] text-[#7a7e99]">
                    {item.sourceType === "class" ? "Classe" : "Manual"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#7a7e99]">Nenhum equipamento selecionado.</p>
          )}
        </div>
      )}

      {activeTab === "features" && (
        <div className="grid gap-2">
          {summary.features.length > 0 ? (
            summary.features.map((feat) => (
              <ActionCard key={`${feat.source}-${feat.name}`} feature={feat} />
            ))
          ) : (
            <p className="text-sm text-[#7a7e99]">Nenhuma característica listada.</p>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          <textarea
            value={notes}
            onBlur={(e) => setDescriptionField("notas", e.target.value)}
            onChange={(e) => setDescriptionField("notas", e.target.value)}
            rows={8}
            placeholder="Anotações livres, segredos, objetivos…"
            className="w-full resize-none rounded-lg border border-white/10 bg-[#12131a] px-3 py-2 text-sm text-white placeholder:text-[#7a7e99] outline-none focus:border-[#e61c23] focus:ring-2 focus:ring-[#e61c23]/30"
          />
        </div>
      )}
    </div>
  );
}
