"use client";

import { useState } from "react";
import type { AsiOrFeatStepProps } from "@/src/components/organisms/levelup/types";
import type { AttributeKey } from "@/types/dnd";

type Tab = "asi" | "feat";
type AsiMode = "one" | "two";

export function AsiOrFeatStep({ level, attributes, selectableFeats, value, onChange }: AsiOrFeatStepProps) {
  const [tab, setTab] = useState<Tab>(value?.mode === "feat" ? "feat" : "asi");
  const [mode, setMode] = useState<AsiMode>(() => {
    if (value?.mode === "asi" && Object.keys(value.increases).length === 2) return "two";
    return "one";
  });
  const increases = value?.mode === "asi" ? value.increases : {};

  const picked = Object.keys(increases) as AttributeKey[];
  const perPoint = mode === "one" ? 2 : 1;
  const maxPicks = mode === "one" ? 1 : 2;
  const selectedFeatId = value?.mode === "feat" ? value.featId : "";

  function emitAsi(next: Partial<Record<AttributeKey, number>>) {
    onChange({ mode: "asi", increases: next });
  }

  function pickAttr(key: AttributeKey) {
    if (picked.includes(key)) {
      const next = { ...increases };
      delete next[key];
      emitAsi(next);
      return;
    }
    if (mode === "one") {
      emitAsi({ [key]: 2 });
      return;
    }
    if (picked.length >= maxPicks) return;
    emitAsi({ ...increases, [key]: 1 });
  }

  function switchMode(nextMode: AsiMode) {
    setMode(nextMode);
    onChange({ mode: "asi", increases: {} });
  }

  return (
    <section aria-label={`Nível ${level} · Aumento de Atributo ou Talento`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Nível {level}</p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Aumento de Atributo ou Talento</h2>
      </header>

      <div className="mb-4 flex gap-2">
        <button type="button" aria-pressed={tab === "asi"} onClick={() => setTab("asi")}
          className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground [&:not([aria-pressed=true])]:border-white/[0.08] [&:not([aria-pressed=true])]:text-muted-foreground [&:not([aria-pressed=true])]:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Aumento de Atributo
        </button>
        <button type="button" aria-pressed={tab === "feat"} onClick={() => setTab("feat")}
          className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground [&:not([aria-pressed=true])]:border-white/[0.08] [&:not([aria-pressed=true])]:text-muted-foreground [&:not([aria-pressed=true])]:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Talento
        </button>
      </div>

      {tab === "asi" ? (
        <div>
          <div className="mb-3 flex gap-2">
            <button type="button" onClick={() => switchMode("one")} aria-pressed={mode === "one"}
              className="rounded-full border px-3 py-1 text-xs outline-none aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent [&:not([aria-pressed=true])]:border-white/[0.12] [&:not([aria-pressed=true])]:text-muted-foreground">
              +2 em um
            </button>
            <button type="button" onClick={() => switchMode("two")} aria-pressed={mode === "two"}
              className="rounded-full border px-3 py-1 text-xs outline-none aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent [&:not([aria-pressed=true])]:border-white/[0.12] [&:not([aria-pressed=true])]:text-muted-foreground">
              +1 em dois
            </button>
          </div>
          <p className="mb-3 text-xs text-faint">
            {mode === "one" ? "Selecione 1 atributo para receber +2." : "Marque 2 atributos para receber +1 cada."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {attributes.map((attr) => {
              const isSel = picked.includes(attr.key);
              const isLocked = !isSel && picked.length >= maxPicks;
              const newVal = isSel ? attr.current + perPoint : attr.current;
              return (
                <button key={attr.key} type="button" onClick={() => pickAttr(attr.key)} disabled={isLocked} aria-pressed={isSel}
                  className="flex items-center justify-between rounded-md border border-white/[0.08] bg-card px-3 py-2 text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground">
                  <span>{attr.label}</span>
                  <span>{isSel ? <span className="font-bold text-accent">+{perPoint} </span> : null}{attr.current} → {newVal}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {selectableFeats.length === 0 ? (
            <p className="text-sm text-faint">Nenhum talento elegível.</p>
          ) : (
            selectableFeats.map((feat) => (
              <button key={feat.id} type="button" onClick={() => onChange({ mode: "feat", featId: feat.id })} aria-pressed={feat.id === selectedFeatId}
                className="rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10">
                <span className="block text-sm font-semibold text-foreground">{feat.name}</span>
                {feat.description ? <span className="mt-0.5 block text-xs text-faint">{feat.description}</span> : null}
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}
