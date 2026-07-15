"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { conceptGlossary } from "@/src/data/conceptGlossary";
import { HelpHint } from "@/src/components/molecules/HelpHint";

import type { StepIntroCardProps } from "./index.types";
export type { StepIntroCardProps } from "./index.types";
export function StepIntroCard({
  conceptId,
  title,
  beginnerMode,
}: StepIntroCardProps) {
  const [open, setOpen] = useState(beginnerMode);
  const concept = conceptGlossary[conceptId];

  if (!beginnerMode && !open) {
    return null;
  }

  return (
    <section
      aria-labelledby={`${conceptId}-intro-title`}
      className="rounded-lg border border-brand-gold-alt/30 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              id={`${conceptId}-intro-title`}
              className="font-serif text-lg font-bold text-foreground"
            >
              {title}
            </h3>
            <HelpHint conceptId={conceptId} beginnerMode={beginnerMode} />
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {concept.short}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Recolher guia" : "Expandir guia"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
        >
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open ? (
        <p className="mt-3 text-sm leading-7 text-subdued">{concept.long}</p>
      ) : null}
    </section>
  );
}
