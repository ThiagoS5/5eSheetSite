"use client";

import { useState } from "react";
import type { CharacterSheetSummary } from "@/types/builder";
import { DeathSavesOverlay } from "@/src/components/organisms/sheet/DeathSavesOverlay";
import { cn } from "@/src/lib/utils";

interface SheetHeaderProps {
  summary: CharacterSheetSummary;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function fmtSpeed(feet: number): string {
  return `${Math.round(feet / 0.3)} m`;
}

export function SheetHeader({ summary }: SheetHeaderProps) {
  const [hasInspiration, setHasInspiration] = useState(false);

  return (
    <header className="glass-card mb-3 rounded-xl p-4 lg:mb-4">
      {/* Row 1: identity */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1c1e2a] font-serif text-xl font-bold text-[#7a7e99]">
          {summary.name.trim().charAt(0).toUpperCase() || "?"}
        </div>

        {/* Name + class + level */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-xl font-bold text-white">
            {summary.name || "Personagem sem nome"}
          </h1>
          <p className="text-xs text-[#b0b5cc]">
            Nível {summary.level} {summary.className}
            {summary.speciesName ? ` · ${summary.speciesName}` : ""}
          </p>
        </div>

        {/* Inspiration toggle */}
        <button
          type="button"
          aria-label={hasInspiration ? "Remover Inspiração" : "Adicionar Inspiração"}
          onClick={() => setHasInspiration((v) => !v)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm transition-colors",
            hasInspiration
              ? "border-[#f3c969] bg-[#f3c969]/20 text-[#f3c969]"
              : "border-white/20 text-[#7a7e99]",
          )}
        >
          <i aria-hidden="true" className="fa-solid fa-star" />
        </button>
      </div>

      {/* Row 2: combat stats */}
      <div className="mt-3 flex flex-wrap gap-2">
        <StatChip label="PV" value={`${summary.currentHp} / ${summary.hitPoints}`} />
        {summary.tempHp > 0 && (
          <StatChip label="PV Temp" value={`+${summary.tempHp}`} accent="gold" />
        )}
        <StatChip label="CA" value={String(summary.armorClass)} />
        <StatChip label="Iniciativa" value={fmt(summary.initiative)} />
        <StatChip label="Velocidade" value={fmtSpeed(summary.speedFeet)} />
        <StatChip label="Proficiência" value={fmt(summary.proficiencyBonus)} />
      </div>

      {/* Death saves (HP = 0) */}
      {summary.currentHp === 0 && (
        <div className="mt-3">
          <DeathSavesOverlay />
        </div>
      )}
    </header>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold";
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/10 bg-[#1c1e2a] px-3 py-1.5 text-center">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          accent === "gold" ? "text-[#f3c969]" : "text-white",
        )}
      >
        {value}
      </span>
    </div>
  );
}
