"use client";

import { useState, type ReactNode } from "react";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";

interface BuilderShellProps {
  children: ReactNode;
}

export function BuilderShell({ children }: BuilderShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const gridClass = getGridClass(sidebarCollapsed, sheetCollapsed);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#12131a] text-[#e8e9f0]">
      <div className={`grid min-h-screen w-full min-w-0 ${gridClass}`}>
        <BuilderSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        />

        <section
          aria-labelledby="builder-title"
          className="min-w-0 border-x border-white/[0.06] bg-[#12131a]"
        >
          <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#12131a]/95 px-4 py-4 backdrop-blur md:px-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#7a7e99]">
              Character Creation
            </p>
            <h1
              id="builder-title"
              className="mt-1 font-serif text-2xl font-bold tracking-wide text-white sm:text-3xl"
            >
              Forge & Fate
            </h1>
          </div>

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
