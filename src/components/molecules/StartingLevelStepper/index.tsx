"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

export function StartingLevelStepper() {
  const state = useCharacterStore((s) => s as CharacterBuilderState);
  const level = useCharacterStore((s) => s.level);
  const selectedClassId = useCharacterStore((s) => s.selectedClassId);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const [open, setOpen] = useState(false);

  const characterClass = useMemo(
    () => getBuilderClasses().find((c) => c.id === selectedClassId),
    [selectedClassId],
  );
  const pendingCount = useMemo(
    () => (characterClass ? getPendingRequirements(state, characterClass).length : 0),
    [state, characterClass],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Starting level</span>
      <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-card px-2 py-1">
        <button type="button" aria-label="Decrease level" disabled={level <= 1}
          onClick={() => setLevel(Math.max(1, level - 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-subdued outline-none transition hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <span translate="no" className="notranslate min-w-[2ch] text-center font-serif text-lg font-bold text-foreground">{level}</span>
        <button type="button" aria-label="Increase level" disabled={level >= 20}
          onClick={() => setLevel(Math.min(20, level + 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-subdued outline-none transition hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {pendingCount > 0 ? (
        <button type="button" onClick={() => setOpen(true)}
          className="rounded-md border border-brand-crimson-alt/60 bg-brand-crimson-alt/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground outline-none transition hover:bg-brand-crimson-alt/20 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Configure choices ({pendingCount})
        </button>
      ) : null}
      <LevelUpFlow open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
