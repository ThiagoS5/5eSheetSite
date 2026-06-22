"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

interface DeathSavesOverlayProps {
  onReset?: () => void;
}

export function DeathSavesOverlay({ onReset }: DeathSavesOverlayProps) {
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);

  function toggle(type: "success" | "failure", index: number) {
    if (type === "success") {
      setSuccesses((prev) => (prev > index ? index : index + 1));
    } else {
      setFailures((prev) => (prev > index ? index : index + 1));
    }
  }

  return (
    <div className="rounded-lg border border-primary/50 bg-primary/5 p-3">
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
        Testes de Morte
      </p>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-subdued">Sucessos</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Sucesso ${i + 1}`}
                onClick={() => toggle("success", i)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-colors",
                  successes > i
                    ? "border-brand-green bg-brand-green/20"
                    : "border-white/30",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-subdued">Falhas</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Falha ${i + 1}`}
                onClick={() => toggle("failure", i)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-colors",
                  failures > i
                    ? "border-primary bg-primary/20"
                    : "border-white/30",
                )}
              />
            ))}
          </div>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto self-end text-[10px] text-muted-foreground underline"
          >
            Resetar
          </button>
        )}
      </div>
    </div>
  );
}
