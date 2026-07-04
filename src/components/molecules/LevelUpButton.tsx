"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";

export function LevelUpButton() {
  const level = useCharacterStore((s) => s.level);
  const levelUp = useCharacterStore((s) => s.levelUp);
  const [open, setOpen] = useState(false);
  const atMax = level >= 20;

  return (
    <>
      <button
        type="button"
        disabled={atMax}
        onClick={() => {
          levelUp();
          setOpen(true);
        }}
        className="inline-flex items-center gap-[7px] rounded-[9px] border border-brand-crimson-alt bg-primary px-[15px] py-[9px] text-[10.5px] font-bold uppercase tracking-[0.06em] text-white outline-none transition-colors hover:bg-brand-crimson-alt focus-visible:ring-3 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUp aria-hidden="true" className="h-4 w-4" />
        Level Up
      </button>
      <LevelUpFlow open={open} onClose={() => setOpen(false)} />
    </>
  );
}
