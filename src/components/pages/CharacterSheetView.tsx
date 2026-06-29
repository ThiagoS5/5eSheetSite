"use client";

import { useMemo, useState } from "react";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { cn } from "@/src/lib/utils";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { SheetHeader } from "@/src/components/organisms/sheet/SheetHeader";
import { AttributesColumn } from "@/src/components/organisms/sheet/AttributesColumn";
import { SkillsColumn } from "@/src/components/organisms/sheet/SkillsColumn";
import { MainContentColumn } from "@/src/components/organisms/sheet/MainContentColumn";
import { CodexColumn } from "@/src/components/organisms/sheet/CodexColumn";

type MobileTab = "attrs" | "skills" | "actions" | "codex";

const MOBILE_TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: "attrs",   icon: "fa-dice-d20",   label: "Atributos" },
  { id: "skills",  icon: "fa-list-check", label: "Perícias" },
  { id: "actions", icon: "fa-sword",      label: "Ações" },
  { id: "codex",   icon: "fa-book-open",  label: "Códice" },
];

interface CharacterSheetViewProps {
  /**
   * Embedded mode renders the sheet inside another layout (the builder's
   * conclusão step): it drops the full-screen chrome and the fixed mobile
   * tab bar — which would collide with the builder's sticky nav — and stacks
   * the columns vertically on small screens instead.
   */
  embedded?: boolean;
}

export function CharacterSheetView({ embedded = false }: CharacterSheetViewProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("attrs");
  const state = useCharacterBuilderState();
  const description = useCharacterStore((s) => s.description);
  const summary = useMemo(() => selectCharacterSheetSummary(state), [state]);

  function handleDownload() {
    const exportData = createFoundryCharacterExport(state, summary);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${sanitizeFileName(summary.name)}-foundry-vtt.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const desktopGrid = (
    <div className="hidden gap-3 md:grid md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.4fr)_18rem]">
      <AttributesColumn summary={summary} />
      <SkillsColumn summary={summary} />
      <MainContentColumn summary={summary} className="md:col-span-2 lg:col-span-1" />
      <CodexColumn
        summary={summary}
        description={description}
        className="hidden xl:flex xl:flex-col"
      />
    </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground outline-none transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <i aria-hidden="true" className="fa-solid fa-file-export" />
            Exportar (Foundry VTT)
          </button>
        </div>

        <SheetHeader summary={summary} />
        {desktopGrid}

        {/* Mobile: stacked columns, no fixed nav (builder owns the bottom bar) */}
        <div className="flex flex-col gap-3 md:hidden">
          <AttributesColumn summary={summary} />
          <SkillsColumn summary={summary} />
          <MainContentColumn summary={summary} />
          <CodexColumn summary={summary} description={description} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-nested">
      <main className="flex-1 p-3 pb-20 md:pb-3 lg:p-4">
        <SheetHeader summary={summary} />
        {desktopGrid}

        {/* Mobile: single panel per tab */}
        <div className="md:hidden">
          {mobileTab === "attrs"   && <AttributesColumn summary={summary} />}
          {mobileTab === "skills"  && <SkillsColumn summary={summary} />}
          {mobileTab === "actions" && <MainContentColumn summary={summary} />}
          {mobileTab === "codex"   && (
            <CodexColumn summary={summary} description={description} />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Seções da ficha"
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-border bg-background md:hidden"
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors",
              mobileTab === tab.id ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <i aria-hidden="true" className={`fa-solid ${tab.icon} text-base`} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function sanitizeFileName(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "character"
  );
}
