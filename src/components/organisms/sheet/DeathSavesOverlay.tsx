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
    <div className="rounded-lg border border-[#e61c23]/50 bg-[#e61c23]/5 p-3">
      <p className="mb-2 text-[0.65rem] uppercase tracking-widest text-[#7a7e99]">
        Testes de Morte
      </p>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#b0b5cc]">Sucessos</span>
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
                    ? "border-[#4ade80] bg-[#4ade80]/20"
                    : "border-white/30",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#b0b5cc]">Falhas</span>
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
                    ? "border-[#e61c23] bg-[#e61c23]/20"
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
            className="ml-auto self-end text-[10px] text-[#7a7e99] underline"
          >
            Resetar
          </button>
        )}
      </div>
    </div>
  );
}
