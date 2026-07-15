"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { SubclassStepProps } from "./index.types";
export type { SubclassStepProps } from "./index.types";

/**
 * Level-up step for the subclass choice. The choice itself lives in the
 * builder's Class › Subclass screen (full hero cards with every feature);
 * this step summarizes the current state and routes the player there.
 */
export function SubclassStep({
  level,
  className,
  subclasses,
  selectedSubclassId,
  onNavigateToSubclassScreen,
}: SubclassStepProps) {
  const selected = subclasses.find((subclass) => subclass.id === selectedSubclassId);

  return (
    <section aria-label={`Level ${level} · Subclass`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Level <span translate="no" className="notranslate">{level}</span> · {className}
        </p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">
          Subclass
        </h2>
      </header>

      {selected ? (
        <div className="rounded-lg border border-brand-green/40 bg-brand-green/10 p-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-green">
            <Check aria-hidden="true" className="h-3.5 w-3.5" />
            Subclass chosen
          </p>
          <p translate="no" className="notranslate mt-1 font-serif text-lg font-bold text-foreground">
            {selected.name}
          </p>
          <p className="mt-1 text-sm leading-6 text-subdued">
            {selected.features.length === 1
              ? "1 subclass feature recorded on the sheet."
              : `${selected.features.length} subclass features recorded on the sheet.`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-brand-gold-alt/35 bg-brand-gold-alt/10 p-4">
          <p className="text-sm leading-6 text-foreground">
            At level {level}, every {className} specializes into a subclass.
            Compare the{" "}
            {subclasses.length === 1
              ? "available option"
              : `${subclasses.length} available options`}{" "}
            — each with its full feature list — on the subclass screen.
          </p>
        </div>
      )}

      <Link
        href="/builder/subclasse"
        onClick={onNavigateToSubclassScreen}
        className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 ${
          selected
            ? "border border-white/[0.12] text-subdued hover:text-foreground"
            : "bg-primary text-foreground hover:bg-brand-crimson-alt"
        }`}
      >
        {selected ? "Change subclass" : "Choose a subclass"}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
