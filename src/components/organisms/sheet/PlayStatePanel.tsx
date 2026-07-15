"use client";

import { useState } from "react";
import type { CharacterSheetSummary } from "@/src/types/builder";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { DeathSavesOverlay } from "@/src/components/organisms/sheet/DeathSavesOverlay";
import { createDefaultPlayState } from "@/rules/restRules";

interface PlayStatePanelProps {
  summary: CharacterSheetSummary;
}

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
  const trackedResources = getTrackedResources(summary);

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
            <ActionButton label="Short Rest" onClick={() => shortRest({ hitDiceToSpend })} />
            <ActionButton label="Long Rest" onClick={longRest} />
          </div>
          <p className="text-xs text-muted-foreground">
            Hit dice spent: {playState.hitDiceSpent} of {summary.level}
          </p>
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
                        {resource.recovery === "shortRest" ? "Short rest" : "Long rest"}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={used >= 1}
                      onChange={(event) =>
                        setResourceUseCount(
                          resource.id,
                          event.target.checked ? 1 : 0,
                          1,
                          resource.recovery,
                        )
                      }
                      className="h-4 w-4 accent-primary"
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

function getTrackedResources(summary: CharacterSheetSummary) {
  return (summary.classFeatures ?? [])
    .map((feature) => {
      const text = `${feature.name} ${feature.description}`.toLowerCase();
      if (!/finish .*rest|short rest|long rest/.test(text)) return null;
      const recovery = text.includes("short rest") ? "shortRest" : "longRest";
      return {
        id: feature.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        label: feature.name,
        recovery,
      } as const;
    })
    .filter((resource): resource is NonNullable<typeof resource> => Boolean(resource));
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

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
