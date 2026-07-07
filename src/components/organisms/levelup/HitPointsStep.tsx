"use client";

import { useState } from "react";
import { rollHitDie } from "@/rules/hitPointRules";
import type { HpRollChoice } from "@/src/types/characterBuild";

export interface HitPointsStepProps {
  hitDie: number;
  targetLevel: number;
  conModifier: number;
  onChoose: (roll: HpRollChoice) => void;
  rollFn?: () => number;
}

export function HitPointsStep({ hitDie, targetLevel, conModifier, onChoose, rollFn }: HitPointsStepProps) {
  const [rolled, setRolled] = useState<number | null>(null);
  const average = Math.floor(hitDie / 2) + 1;
  const averageTotal = average + conModifier;
  const rolledTotal = rolled !== null ? rolled + conModifier : null;
  const conLabel = `${conModifier >= 0 ? "+" : ""}${conModifier} CON`;

  function handleRoll() {
    const roll = rollFn ? rollFn() : rollHitDie(hitDie);
    setRolled(roll);
  }

  return (
    <section aria-label={`Level ${targetLevel} · Hit Points`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Level <span translate="no" className="notranslate">{targetLevel}</span></p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Hit Points</h2>
      </header>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose("average")}
          className="flex flex-col items-start gap-1 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
        >
          <span className="font-semibold text-foreground">Use average (<span translate="no" className="notranslate">{average}</span>)</span>
          <span className="text-xs text-faint">Total gain: <span translate="no" className="notranslate">{averageTotal}</span></span>
        </button>

        <button
          type="button"
          onClick={handleRoll}
          className="flex flex-col items-start gap-1 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
        >
          <span className="font-semibold text-foreground">Roll die (<span translate="no" className="notranslate">d{hitDie}</span>)</span>
          <span aria-live="polite" className="text-xs text-faint">
            {rolled !== null ? `Rolled ${rolled} (total ${rolledTotal})` : "Not rolled yet"}
          </span>
        </button>
      </div>

      {rolled !== null ? (
        <div
          aria-live="polite"
          className="mt-4 rounded-md border border-brand-crimson-alt/45 bg-surface-raised p-4 shadow-inner shadow-black/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Rolled HP
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <span
                  translate="no"
                  className="notranslate font-serif text-4xl font-bold leading-none text-foreground"
                >
                  {rolled}
                </span>
                <span translate="no" className="notranslate text-sm font-semibold text-subdued">
                  {conLabel}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                <span translate="no" className="notranslate">{rolledTotal} total</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChoose(rolled)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
            >
              Confirm roll
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
