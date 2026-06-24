"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";

export function LevelUpButton() {
  const level = useCharacterStore((s) => s.level);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const [open, setOpen] = useState(false);
  const atMax = level >= 20;

  return (
    <>
      <button
        type="button"
        disabled={atMax}
        onClick={() => {
          setLevel(level + 1);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand-crimson-alt/60 bg-brand-crimson-alt/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground outline-none transition hover:border-brand-crimson-alt hover:bg-brand-crimson-alt/20 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUp aria-hidden="true" className="h-4 w-4" />
        Subir de Nível
      </button>
      <LevelUpFlow open={open} onClose={() => setOpen(false)} />
    </>
  );
}
