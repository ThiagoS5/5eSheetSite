"use client";

import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { createDefaultPlayState } from "@/rules/restRules";

import type { DeathSavesOverlayProps } from "./index.types";
export type { DeathSavesOverlayProps } from "./index.types";
export function DeathSavesOverlay({ onReset }: DeathSavesOverlayProps) {
  const deathSaves = useCharacterStore(
    (state) => (state.playState ?? createDefaultPlayState(0)).deathSaves,
  );
  const setDeathSaves = useCharacterStore((state) => state.setDeathSaves);
  const successes = deathSaves.successes;
  const failures = deathSaves.failures;

  function toggle(type: "success" | "failure", index: number) {
    if (type === "success") {
      setDeathSaves({ ...deathSaves, successes: successes > index ? index : index + 1 });
    } else {
      setDeathSaves({ ...deathSaves, failures: failures > index ? index : index + 1 });
    }
  }

  return (
    <div className="rounded-lg border border-primary/50 bg-primary/5 p-3">
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
        Death Saves
      </p>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-subdued">Successes</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Success ${i + 1}`}
                aria-pressed={successes > i}
                onClick={() => toggle("success", i)}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] text-brand-green transition-colors",
                  focusRing,
                  successes > i
                    ? "border-brand-green bg-brand-green/20"
                    : "border-white/30",
                )}
              >
                {successes > i ? (
                  <i aria-hidden="true" className="fa-solid fa-check" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-subdued">Failures</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Failure ${i + 1}`}
                aria-pressed={failures > i}
                onClick={() => toggle("failure", i)}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] text-primary transition-colors",
                  focusRing,
                  failures > i
                    ? "border-primary bg-primary/20"
                    : "border-white/30",
                )}
              >
                {failures > i ? (
                  <i aria-hidden="true" className="fa-solid fa-xmark" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "ml-auto self-end rounded text-[10px] text-muted-foreground underline",
              focusRing,
            )}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
