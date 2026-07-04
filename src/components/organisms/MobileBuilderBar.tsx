"use client";

import { ListChecks, PanelTop } from "lucide-react";

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
  onOpenSteps: () => void;
  hasPreviousStep?: boolean;
  hasNextStep?: boolean;
}

export function MobileBuilderBar({
  currentStepIndex,
  totalSteps,
  onBack,
  onNext,
  nextBlockedReason,
  identity,
  onOpenSheet,
  onOpenSteps,
  hasPreviousStep = true,
  hasNextStep = true,
}: MobileBuilderBarProps) {
  const isBlocked = Boolean(nextBlockedReason) || !hasNextStep;
  const stepPositionLabel = `Step ${Math.max(currentStepIndex + 1, 1)}/${totalSteps}`;
  const nextReason = !hasNextStep ? "Last step." : nextBlockedReason;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-surface-nested/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <button
        type="button"
        aria-label="Open the live sheet"
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
          <span translate="no" className="notranslate font-semibold text-foreground">
            {identity.name || "Unnamed Hero"}
          </span>
          <span aria-hidden="true">·</span>
          <span translate="no" className="notranslate">{identity.className || "Class"}</span>
          <span aria-hidden="true">·</span>
          <span>Level <span translate="no" className="notranslate">{identity.level}</span></span>
          <span aria-hidden="true">·</span>
          <span><span translate="no" className="notranslate">HP</span> <span translate="no" className="notranslate">{identity.hp}</span></span>
          <span aria-hidden="true">·</span>
          <span><span translate="no" className="notranslate">AC</span> <span translate="no" className="notranslate">{identity.ac}</span></span>
        </span>
        <PanelTop aria-hidden="true" className="h-4 w-4 shrink-0 text-subdued" />
      </button>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-disabled={!hasPreviousStep ? "true" : undefined}
          onClick={() => {
            if (!hasPreviousStep) {
              return;
            }

            onBack();
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white/5 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-foreground outline-none transition hover:border-white/20 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          aria-label="Open builder steps"
          onClick={onOpenSteps}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground outline-none transition hover:border-white/20 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
        >
          <ListChecks aria-hidden="true" className="h-4 w-4" />
          {stepPositionLabel}
        </button>
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
          Next
        </button>
      </div>

      {nextReason ? (
        <p className="px-4 pb-3 text-xs leading-5 text-accent">
          {nextReason}
        </p>
      ) : null}
    </div>
  );
}
