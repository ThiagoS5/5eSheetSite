"use client";

import { useState } from "react";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { DeathSavesOverlay } from "@/src/components/organisms/sheet/DeathSavesOverlay";
import { createDefaultPlayState } from "@/rules/restRules";

import type { PlayStatePanelProps } from "./index.types";
export type { PlayStatePanelProps } from "./index.types";
export function PlayStatePanel({ summary }: PlayStatePanelProps) {
  const [amount, setAmount] = useState(1);
  const [hitDiceToSpend, setHitDiceToSpend] = useState(1);
  const applyDamage = useCharacterStore((state) => state.applyDamage);
  const heal = useCharacterStore((state) => state.heal);
  const setTempHp = useCharacterStore((state) => state.setTempHp);
  const shortRest = useCharacterStore((state) => state.shortRest);
  const longRest = useCharacterStore((state) => state.longRest);
  const toggleInspiration = useCharacterStore((state) => state.toggleInspiration);
  const setOverride = useCharacterStore((state) => state.setOverride);
  const setResourceUseCount = useCharacterStore((state) => state.setResourceUseCount);
  const storePlayState = useCharacterStore((state) => state.playState);
  const playState = storePlayState ?? createDefaultPlayState(summary.maxHp);
  const trackedResources = summary.resources ?? [];

  return (
    <section className="rounded-lg border border-white/[0.08] bg-card p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <i aria-hidden="true" className="fa-solid fa-heart-pulse text-[11px] text-primary" />
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Play Mode
          </h2>
        </div>
        <button
          type="button"
          aria-pressed={playState.inspiration}
          onClick={toggleInspiration}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
            focusRing,
            playState.inspiration
              ? "border-brand-gold-alt bg-tone-gold-deep/30 text-brand-gold-alt"
              : "border-border text-muted-foreground",
          )}
        >
          Inspiration
        </button>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Current" value={summary.currentHp} />
          <Stat label="Max" value={summary.maxHp} manual={playState.overrides.maxHp !== undefined} />
          <Stat label="Temp" value={summary.tempHp} />
        </div>

        <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Amount
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))}
            className={cn("h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none", focusRing)}
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <ActionButton label="Damage" onClick={() => applyDamage(amount)} />
          <ActionButton label="Heal" onClick={() => heal(amount)} />
          <ActionButton label="Temp" onClick={() => setTempHp(amount)} />
        </div>

        <div className="grid gap-2 border-t border-border pt-3">
          <div className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
            <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Hit dice
              <input
                type="number"
                min={0}
                max={summary.level}
                value={hitDiceToSpend}
                onChange={(event) => setHitDiceToSpend(Math.max(0, Number(event.target.value)))}
                className={cn("h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none", focusRing)}
              />
            </label>
            <ActionButton label="Short Rest" disabled={summary.currentHp <= 0} onClick={() => shortRest({ hitDiceToSpend })} />
            <ActionButton label="Long Rest" disabled={summary.currentHp <= 0} onClick={longRest} />
          </div>
          <p className="text-xs text-muted-foreground">
            Hit dice spent: {playState.hitDiceSpent} of {summary.level}
          </p>
          <p className="text-xs text-muted-foreground">{summary.currentHp <= 0 ? "Regain at least 1 hit point before starting a rest." : "Short rest rolls each selected Hit Die and adds Constitution. Use one die at a time to avoid spending more than needed."}</p>
        </div>

        {trackedResources.length > 0 ? (
          <div className="grid gap-2 border-t border-border pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Resources
            </p>
            <div className="grid gap-2">
              {trackedResources.map((resource) => {
                const used = playState.resourceUses[resource.id] ?? 0;
                return (
                  <label
                    key={resource.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-nested px-3 py-2 text-xs text-subdued"
                  >
                    <span>
                      <span className="block font-semibold text-foreground">{resource.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {resource.shortRestRecovery === "all" ? "All on short rest" : resource.shortRestRecovery > 0 ? `${resource.shortRestRecovery} on short rest; all on long rest` : "Long rest"}
                      </span>
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={resource.maxUses}
                      step={1}
                      aria-label={`${resource.label}: uses spent of ${resource.maxUses}`}
                      value={used}
                      onChange={(event) =>
                        setResourceUseCount(
                          resource.id,
                          Math.trunc(Number(event.target.value)),
                          resource.maxUses,
                          "longRest",
                        )
                      }
                      className={cn("h-10 w-16 rounded-md border border-border bg-background px-2 text-sm text-foreground", focusRing)}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
          <ManualOverride
            label="Max HP"
            value={playState.overrides.maxHp ?? summary.maxHp}
            isManual={playState.overrides.maxHp !== undefined}
            onApply={(value) => setOverride("maxHp", value)}
            onReset={() => setOverride("maxHp", null)}
          />
          <ManualOverride
            label="AC"
            value={playState.overrides.armorClass ?? summary.armorClass}
            isManual={playState.overrides.armorClass !== undefined}
            onApply={(value) => setOverride("armorClass", value)}
            onReset={() => setOverride("armorClass", null)}
          />
        </div>

        {summary.currentHp <= 0 ? <DeathSavesOverlay /> : null}
      </div>
    </section>
  );
}

function Stat({ label, value, manual = false }: { label: string; value: number; manual?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface-nested p-2">
      <span translate="no" className="notranslate block font-serif text-xl font-bold text-foreground">{value}</span>
      <span className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      {manual ? (
        <span className="ml-1 rounded border border-brand-gold-alt/50 px-1 text-[8px] uppercase text-brand-gold-alt">
          manual
        </span>
      ) : null}
    </div>
  );
}

function ActionButton({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn("rounded-md border border-border bg-surface-nested px-3 py-2 text-xs font-semibold text-subdued transition hover:text-foreground", focusRing)}
    >
      {label}
    </button>
  );
}

function ManualOverride({
  label,
  value,
  isManual,
  onApply,
  onReset,
}: {
  label: string;
  value: number;
  isManual: boolean;
  onApply: (value: number) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-surface-nested p-2">
      <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
        <input
          type="number"
          value={draft}
          onChange={(event) => setDraft(Number(event.target.value))}
          className={cn("h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none", focusRing)}
        />
      </label>
      <div className="flex gap-1">
        <button type="button" onClick={() => onApply(draft)} className={cn("flex-1 rounded border border-border px-2 py-1 text-[11px] text-subdued", focusRing)}>
          Set
        </button>
        {isManual ? (
          <button type="button" onClick={onReset} className={cn("flex-1 rounded border border-brand-gold-alt/40 px-2 py-1 text-[11px] text-brand-gold-alt", focusRing)}>
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
