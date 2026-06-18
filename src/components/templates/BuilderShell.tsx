"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";
import { Header } from "@/src/components/organisms/Header";
import { SidebarProvider } from "@/src/components/ui/sidebar";

interface BuilderShellProps {
  children: ReactNode;
}

export function BuilderShell({ children }: BuilderShellProps) {
  const pathname = usePathname();
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
            <div className="px-4 py-5 md:px-6">{children}</div>
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
