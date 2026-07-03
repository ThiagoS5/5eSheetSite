"use client";

import { PanelTop } from "lucide-react";

interface MobileBuilderBarIdentity {
  name: string;
  className: string;
  level: number;
  hp: number;
  ac: number;
}

interface MobileBuilderBarProps {
  currentStepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextBlockedReason?: string;
  identity: MobileBuilderBarIdentity;
  onOpenSheet: () => void;
}

export function MobileBuilderBar({
  currentStepIndex,
  totalSteps,
  onBack,
  onNext,
  nextBlockedReason,
  identity,
  onOpenSheet,
}: MobileBuilderBarProps) {
  const isBlocked = Boolean(nextBlockedReason);
  const stepPositionLabel = `Etapa ${Math.max(currentStepIndex + 1, 1)}/${totalSteps}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-surface-nested/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <button
        type="button"
        aria-label="Abrir ficha"
        onClick={onOpenSheet}
        className="flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-2 text-left outline-none transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-brand-crimson-alt/40 bg-card font-serif text-sm font-bold text-foreground"
        >
          {identity.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1 truncate text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {identity.name || "Herói sem nome"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{identity.className || "Classe"}</span>
          <span aria-hidden="true">·</span>
          <span>Nível {identity.level}</span>
          <span aria-hidden="true">·</span>
          <span>PV {identity.hp}</span>
          <span aria-hidden="true">·</span>
          <span>CA {identity.ac}</span>
        </span>
        <PanelTop aria-hidden="true" className="h-4 w-4 shrink-0 text-subdued" />
      </button>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-foreground outline-none transition hover:border-white/20 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Voltar
        </button>
        <span className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {stepPositionLabel}
        </span>
        <button
          type="button"
          aria-disabled={isBlocked ? "true" : undefined}
          onClick={() => {
            if (isBlocked) {
              return;
            }

            onNext();
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-crimson-alt bg-brand-crimson-alt px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-foreground shadow-lg shadow-brand-crimson-alt/20 outline-none transition hover:bg-destructive focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          Avançar
        </button>
      </div>

      {nextBlockedReason ? (
        <p className="px-4 pb-3 text-xs leading-5 text-accent">
          {nextBlockedReason}
        </p>
      ) : null}
    </div>
  );
}
