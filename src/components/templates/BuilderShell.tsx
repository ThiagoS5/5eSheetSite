"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Save, Settings } from "lucide-react";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";
import { CreationPreferencesDialog } from "@/src/components/organisms/CreationPreferencesDialog";
import { Header } from "@/src/components/organisms/Header";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { useCharacterStore } from "@/src/store/useCharacterStore";

interface BuilderShellProps {
  children: ReactNode;
}

export function BuilderShell({ children }: BuilderShellProps) {
  const pathname = usePathname();
  const updatedAt = useCharacterStore(
    (state) => state.characterBuild.exportMetadata.updatedAt,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  // The conclusão step is the full character sheet itself, so the live preview
  // aside is redundant there and is hidden.
  const isSummaryStep = pathname?.endsWith("/conclusao") ?? false;
  const showSheetPreview = !isSummaryStep;
  const gridClass = getGridClass(
    sidebarCollapsed,
    sheetCollapsed,
    showSheetPreview,
  );

  return (
    <SidebarProvider
      open={!sidebarCollapsed}
      onOpenChange={(open) => setSidebarCollapsed(!open)}
      className="block min-h-0 w-full bg-transparent"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
    >
      <main className="min-h-screen overflow-x-hidden bg-surface-nested pt-16 text-foreground">
        <Header />
        <div className={`grid min-h-[calc(100dvh-4rem)] w-full min-w-0 ${gridClass}`}>
          <BuilderSidebar />

          <section
            aria-labelledby="builder-title"
            className="min-w-0 border-x border-white/[0.06] bg-surface-nested"
          >
            <div className="px-4 py-5 md:px-6">
              <AutosaveStatus updatedAt={updatedAt} />
              {children}
            </div>
          </section>

          {showSheetPreview ? (
            <CharacterSheetPreview
              collapsed={sheetCollapsed}
              onToggleCollapsed={() => setSheetCollapsed((value) => !value)}
            />
          ) : null}
        </div>
      </main>
    </SidebarProvider>
  );
}

function AutosaveStatus({ updatedAt }: { updatedAt: string }) {
  const savedAt = formatSavedAt(updatedAt);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  return (
    <div className="mb-4 flex justify-end gap-2">
      <button
        type="button"
        aria-label="Preferências da criação"
        onClick={() => setPreferencesOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-card text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
      >
        <Settings aria-hidden="true" className="h-4 w-4" />
      </button>
      <div
        role="status"
        aria-label="Rascunho salvo"
        className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Save aria-hidden="true" className="h-3.5 w-3.5 text-brand-green" />
        Salvo <span suppressHydrationWarning>{savedAt}</span>
      </div>
      <CreationPreferencesDialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </div>
  );
}

function formatSavedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getGridClass(
  sidebarCollapsed: boolean,
  sheetCollapsed: boolean,
  showSheetPreview: boolean,
): string {
  if (!showSheetPreview) {
    return sidebarCollapsed
      ? "xl:grid-cols-[4.5rem_minmax(0,1fr)]"
      : "xl:grid-cols-[16rem_minmax(0,1fr)]";
  }

  if (sidebarCollapsed && sheetCollapsed) {
    return "xl:grid-cols-[4.5rem_minmax(0,1fr)_4.5rem]";
  }

  if (sidebarCollapsed) {
    return "xl:grid-cols-[4.5rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[4.5rem_minmax(0,1fr)_24rem]";
  }

  if (sheetCollapsed) {
    return "xl:grid-cols-[16rem_minmax(0,1fr)_4.5rem]";
  }

  return "xl:grid-cols-[16rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[16rem_minmax(0,1fr)_24rem]";
}
