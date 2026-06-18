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
        <div className="relative flex shrink-0 items-center gap-4 overflow-hidden rounded-lg border border-border bg-card p-4 xl:w-[30%]">
          {/* Linha decorativa no topo */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent"
          />

          {/* Avatar */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-surface-nested">
            <i aria-hidden="true" className="fa-solid fa-user text-2xl text-muted-foreground" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold leading-none text-foreground">
                  {summary.name || "Personagem sem nome"}
                </h1>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Nível {summary.level}
                  {summary.speciesName ? ` • ${summary.speciesName}` : ""}
                  {summary.className ? ` ${summary.className}` : ""}
                </p>
              </div>
              <div className="ml-2 shrink-0 text-right">
                <span className="block text-sm font-bold text-foreground">
                  {summary.xp} / {summary.xpThreshold}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  XP Total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de stats de combate — 70% */}
        <div className="flex flex-1 flex-wrap items-stretch gap-2">
          {/* HP */}
          <div className="group relative flex w-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-surface-nested p-3 transition-colors hover:border-primary/50 sm:w-64">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <i aria-hidden="true" className="fa-solid fa-heart text-primary" /> Pontos de Vida
              </span>
              <span className="text-right text-[10px] leading-tight text-muted-foreground">
                Max
                <br />
                {summary.maxHp}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold leading-none text-foreground">
                {summary.currentHp}
              </span>
              <span className="text-lg text-muted-foreground">/ {summary.maxHp}</span>
            </div>
            <div className="mt-2 flex gap-1">
              <div className="flex flex-1 items-center justify-between rounded bg-surface-nested px-2 py-1">
                <span className="text-[10px] text-muted-foreground">Temp</span>
                <span className="text-xs text-foreground">
                  {summary.tempHp > 0 ? summary.tempHp : "--"}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between rounded bg-surface-nested px-2 py-1">
                <span className="text-[10px] text-muted-foreground">Dados</span>
                <span className="text-xs text-foreground">{summary.hitDice}</span>
              </div>
            </div>
            {/* Glow sutil */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-primary/5 blur-[30px] transition-colors group-hover:bg-primary/10"
            />
          </div>

          {/* Classe de Armadura — variante escudo */}
          <CombatStatFrame variant="shield" accentColor="#7a7e99">
            <span className="text-center text-[10px] uppercase leading-tight tracking-widest text-muted-foreground">
              Classe
              <br />
              Armadura
            </span>
            <span className="text-2xl font-bold text-foreground">{summary.armorClass}</span>
          </CombatStatFrame>

          {/* Iniciativa — variante square */}
          <CombatStatFrame variant="square" accentColor="#f3c969">
            <i aria-hidden="true" className="fa-solid fa-clock text-[10px] text-accent" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Iniciativa</span>
            <span className="text-2xl font-bold text-foreground">{fmt(summary.initiative)}</span>
          </CombatStatFrame>

          {/* Velocidade — variante square */}
          <CombatStatFrame variant="square" accentColor="#7a7e99">
            <i aria-hidden="true" className="fa-solid fa-shoe-prints text-[10px] text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Velocidade</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-foreground">{summary.speedMeters}</span>
              <span className="text-[10px] text-muted-foreground">m</span>
            </div>
          </CombatStatFrame>

          {/* Bônus Prof. + Inspiração */}
          <div className="flex min-w-[150px] flex-1 flex-col gap-2">
            <div className="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-nested px-3 py-2">
              <span className="flex items-center gap-2 text-[10px] uppercase leading-tight tracking-widest text-muted-foreground">
                <i aria-hidden="true" className="fa-solid fa-star text-accent" />
                Bônus Proficiência
              </span>
              <span className="text-xl font-bold text-foreground">+{summary.proficiencyBonus}</span>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-lg border border-border bg-surface-nested px-3 py-2">
              <span className="flex items-center gap-2 text-[10px] uppercase leading-tight tracking-widest text-muted-foreground">
                <i aria-hidden="true" className="fa-solid fa-sun text-accent" />
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
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/20 bg-transparent",
                )}
              >
                {hasInspiration && (
                  <i aria-hidden="true" className="fa-solid fa-check text-[10px] text-primary" />
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
