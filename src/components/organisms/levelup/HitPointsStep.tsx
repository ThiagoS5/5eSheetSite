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

  function handleRoll() {
    const roll = rollFn ? rollFn() : rollHitDie(hitDie);
    setRolled(roll);
  }

  return (
    <section aria-label={`Nível ${targetLevel} · Pontos de Vida`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Nível {targetLevel}</p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Pontos de Vida</h2>
      </header>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose("average")}
          className="flex flex-col items-start gap-1 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
        >
          <span className="font-semibold text-foreground">Usar média ({average})</span>
          <span className="text-xs text-faint">Ganho total: {averageTotal}</span>
        </button>

        <button
          type="button"
          onClick={handleRoll}
          className="flex flex-col items-start gap-1 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
        >
          <span className="font-semibold text-foreground">Rolar dado (d{hitDie})</span>
          <span aria-live="polite" className="text-xs text-faint">
            {rolled !== null ? `Rolou ${rolled} (total ${rolledTotal})` : "Ainda não rolado"}
          </span>
        </button>
      </div>

      {rolled !== null ? (
        <button
          type="button"
          onClick={() => onChoose(rolled)}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
        >
          Confirmar rolagem
        </button>
      ) : null}
    </section>
  );
}
