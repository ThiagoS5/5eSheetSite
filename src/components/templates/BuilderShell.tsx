"use client";

import { useState, type ReactNode } from "react";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";
import { Header } from "@/src/components/organisms/Header";

interface BuilderShellProps {
  children: ReactNode;
}

export function BuilderShell({ children }: BuilderShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const gridClass = getGridClass(sidebarCollapsed, sheetCollapsed);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#12131a] pt-16 text-[#e8e9f0]">
      <Header />
      <div className={`grid min-h-[calc(100dvh-4rem)] w-full min-w-0 ${gridClass}`}>
        <BuilderSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />

        <section
          aria-labelledby="builder-title"
          className="min-w-0 border-x border-white/[0.06] bg-[#12131a]"
        >
          <div className="px-4 py-5 md:px-6">{children}</div>
        </section>

        <CharacterSheetPreview
          collapsed={sheetCollapsed}
          onToggleCollapsed={() => setSheetCollapsed((value) => !value)}
        />
      </div>
    </main>
  );
}

function getGridClass(sidebarCollapsed: boolean, sheetCollapsed: boolean): string {
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
