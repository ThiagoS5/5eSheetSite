"use client";

import { useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";

export function LevelUpButton() {
  const level = useCharacterStore((s) => s.level);
  const levelUp = useCharacterStore((s) => s.levelUp);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const [open, setOpen] = useState(false);
  // Nível antes do incremento desta sessão, para reverter se o usuário cancelar.
  const levelBeforeRef = useRef<number | null>(null);
  const atMax = level >= 20;

  function startLevelUp() {
    levelBeforeRef.current = level;
    levelUp();
    setOpen(true);
  }

  function handleClose(committed: boolean) {
    setOpen(false);
    // Cancelar (Escape, clique fora, X) desfaz o incremento em vez de deixar o
    // personagem um nível acima com escolhas pendentes — e acumulando a cada
    // abre/fecha. Confirmar (Finish) ou seguir para a tela de subclasse mantém.
    if (!committed && levelBeforeRef.current !== null) {
      setLevel(levelBeforeRef.current);
    }
    levelBeforeRef.current = null;
  }

  return (
    <>
      <button
        type="button"
        disabled={atMax}
        onClick={startLevelUp}
        className="inline-flex min-h-10 items-center gap-[7px] rounded-[9px] border border-brand-crimson-alt bg-primary px-[15px] py-[9px] text-[10.5px] font-bold uppercase tracking-[0.06em] text-white outline-none transition-colors hover:bg-brand-crimson-alt focus-visible:ring-3 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUp aria-hidden="true" className="h-4 w-4" />
        Level Up
      </button>
      <LevelUpFlow open={open} onClose={handleClose} />
    </>
  );
}
