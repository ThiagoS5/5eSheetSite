"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

const CONDITION_LIST = [
  "Blinded", "Charmed", "Confused", "Deafened", "Exhausted",
  "Frightened", "Grappled", "Incapacitated", "Invisible",
  "Paralyzed", "Petrified", "Poisoned", "Prone", "Sickened",
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
    <section className="rounded-lg border border-white/[0.08] bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <i aria-hidden="true" className="fa-solid fa-circle-exclamation text-muted-foreground text-[10px]" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Conditions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] text-foreground hover:underline"
        >
          {expanded ? "Close" : "+ Add"}
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
              className="flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs text-foreground"
            >
              {name}
              <i aria-hidden="true" className="fa-solid fa-xmark text-[10px]" />
            </button>
          ))}
        </div>
      )}

      {active.size === 0 && !expanded && (
        <p className="text-xs text-muted-foreground">No active condition.</p>
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
                "rounded border px-1.5 py-0.5 text-xs transition-colors",
                active.has(name)
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-white/20 text-subdued hover:border-white/40",
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
