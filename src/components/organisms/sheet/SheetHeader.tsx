"use client";

import { useState } from "react";
import type { CharacterSheetSummary } from "@/types/builder";
import { DeathSavesOverlay } from "@/src/components/organisms/sheet/DeathSavesOverlay";
import { CombatStatFrame } from "@/src/components/atoms/sheet/frames/CombatStatFrame";
import { cn } from "@/src/lib/utils";

interface SheetHeaderProps {
  summary: CharacterSheetSummary;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function SheetHeader({ summary }: SheetHeaderProps) {
  const [hasInspiration, setHasInspiration] = useState(false);

  return (
    <header className="mb-3 flex flex-col gap-3 lg:mb-4">
      <div className="flex flex-col gap-3 xl:flex-row">
        {/* Bloco do personagem — 30% */}
        <div className="relative flex shrink-0 items-center gap-4 overflow-hidden rounded-lg border border-white/10 bg-[#1c1e2a] p-4 xl:w-[30%]">
          {/* Linha decorativa no topo */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-[#e61c23] to-transparent"
          />

          {/* Avatar */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-[#12131a]">
            <i aria-hidden="true" className="fa-solid fa-user text-2xl text-[#7a7e99]" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-none text-white">
                  {summary.name || "Personagem sem nome"}
                </h1>
                <p className="mt-1 truncate text-sm text-[#7a7e99]">
                  Nível {summary.level}
                  {summary.speciesName ? ` • ${summary.speciesName}` : ""}
                  {summary.className ? ` ${summary.className}` : ""}
                </p>
              </div>
              <div className="ml-2 shrink-0 text-right">
                <span className="block text-sm font-bold text-[#e61c23]">
                  {summary.xp} / {summary.xpThreshold}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-[#7a7e99]">
                  XP Total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de stats de combate — 70% */}
        <div className="flex flex-1 flex-wrap items-stretch gap-2">
          {/* HP */}
          <div className="group relative flex w-full flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-[#12131a] p-3 transition-colors hover:border-[#e61c23]/50 sm:w-64">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#7a7e99]">
                <i aria-hidden="true" className="fa-solid fa-heart text-[#e61c23]" /> Pontos de Vida
              </span>
              <span className="text-right text-[10px] leading-tight text-[#7a7e99]">
                Max
                <br />
                {summary.maxHp}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold leading-none text-white">
                {summary.currentHp}
              </span>
              <span className="text-lg text-[#7a7e99]">/ {summary.maxHp}</span>
            </div>
            <div className="mt-2 flex gap-1">
              <div className="flex flex-1 items-center justify-between rounded bg-[#1a1c23] px-2 py-1">
                <span className="text-[8px] text-[#7a7e99]">Temp</span>
                <span className="text-xs text-white">
                  {summary.tempHp > 0 ? summary.tempHp : "--"}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between rounded bg-[#1a1c23] px-2 py-1">
                <span className="text-[8px] text-[#7a7e99]">Dados</span>
                <span className="text-xs text-white">{summary.hitDice}</span>
              </div>
            </div>
            {/* Glow sutil */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#e61c23]/5 blur-[30px] transition-colors group-hover:bg-[#e61c23]/10"
            />
          </div>

          {/* Classe de Armadura — variante escudo */}
          <CombatStatFrame variant="shield" accentColor="#7a7e99">
            <span className="text-center text-[8px] uppercase leading-tight tracking-widest text-[#7a7e99]">
              Classe
              <br />
              Armadura
            </span>
            <span className="text-2xl font-bold text-white">{summary.armorClass}</span>
          </CombatStatFrame>

          {/* Iniciativa — variante square */}
          <CombatStatFrame variant="square" accentColor="#f3c969">
            <i aria-hidden="true" className="fa-solid fa-clock text-[10px] text-[#f3c969]" />
            <span className="text-[8px] uppercase tracking-widest text-[#7a7e99]">Iniciativa</span>
            <span className="text-2xl font-bold text-white">{fmt(summary.initiative)}</span>
          </CombatStatFrame>

          {/* Velocidade — variante square */}
          <CombatStatFrame variant="square" accentColor="#7a7e99">
            <i aria-hidden="true" className="fa-solid fa-shoe-prints text-[10px] text-[#7a7e99]" />
            <span className="text-[8px] uppercase tracking-widest text-[#7a7e99]">Velocidade</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-white">{summary.speedMeters}</span>
              <span className="text-[10px] text-[#7a7e99]">m</span>
            </div>
          </CombatStatFrame>

          {/* Bônus Prof. + Inspiração */}
          <div className="flex min-w-[150px] flex-1 flex-col gap-2">
            <div className="flex flex-1 items-center justify-between rounded-lg border border-white/10 bg-[#12131a] px-3 py-2">
              <span className="flex items-center gap-2 text-[10px] uppercase leading-tight tracking-widest text-[#7a7e99]">
                <i aria-hidden="true" className="fa-solid fa-star text-[#f3c969]" />
                Bônus Proficiência
              </span>
              <span className="text-xl font-bold text-white">+{summary.proficiencyBonus}</span>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-lg border border-white/10 bg-[#12131a] px-3 py-2">
              <span className="flex items-center gap-2 text-[10px] uppercase leading-tight tracking-widest text-[#7a7e99]">
                <i aria-hidden="true" className="fa-solid fa-sun text-[#f3c969]" />
                Inspiração Heroica
              </span>
              <button
                type="button"
                aria-pressed={hasInspiration}
                aria-label={hasInspiration ? "Remover inspiração heroica" : "Adicionar inspiração heroica"}
                onClick={() => setHasInspiration((v) => !v)}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                  hasInspiration
                    ? "border-[#e61c23]/50 bg-[#e61c23]/10"
                    : "border-white/20 bg-transparent",
                )}
              >
                {hasInspiration && (
                  <i aria-hidden="true" className="fa-solid fa-check text-[10px] text-[#e61c23]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Death saves (PV = 0) */}
      {summary.currentHp === 0 && <DeathSavesOverlay />}
    </header>
  );
}
