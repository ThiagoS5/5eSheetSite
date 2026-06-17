"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

const CONDITION_LIST = [
  "Amedrontado", "Agarrado", "Caído", "Cego", "Confuso",
  "Encantado", "Enjoado", "Ensurdecido", "Envenenado",
  "Exausto", "Incapacitado", "Invisível", "Paralisado",
  "Petrificado", "Surdo",
];

export function ConditionsPanel() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  function toggle(name: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
          Condições
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[0.6rem] text-[#e61c23] hover:underline"
        >
          {expanded ? "Fechar" : "+ Adicionar"}
        </button>
      </div>

      {/* Active conditions */}
      {active.size > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {[...active].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className="flex items-center gap-1 rounded border border-[#e61c23]/40 bg-[#e61c23]/10 px-1.5 py-0.5 text-[0.65rem] text-[#e61c23]"
            >
              {name}
              <i aria-hidden="true" className="fa-solid fa-xmark text-[0.55rem]" />
            </button>
          ))}
        </div>
      )}

      {active.size === 0 && !expanded && (
        <p className="text-[0.72rem] text-[#7a7e99]">Nenhuma condição ativa.</p>
      )}

      {/* Condition picker */}
      {expanded && (
        <div className="flex flex-wrap gap-1">
          {CONDITION_LIST.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[0.65rem] transition-colors",
                active.has(name)
                  ? "border-[#e61c23]/40 bg-[#e61c23]/10 text-[#e61c23]"
                  : "border-white/20 text-[#b0b5cc] hover:border-white/40",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
