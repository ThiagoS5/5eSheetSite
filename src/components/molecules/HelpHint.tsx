"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { CircleHelp } from "lucide-react";
import { conceptGlossary, type ConceptId } from "@/src/data/conceptGlossary";

interface HelpHintProps {
  conceptId: ConceptId;
  beginnerMode?: boolean;
}

export function HelpHint({ conceptId, beginnerMode = false }: HelpHintProps) {
  const concept = conceptGlossary[conceptId];

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={`O que e ${concept.term}?`}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent ${
              beginnerMode ? "text-brand-gold-alt" : "text-muted-foreground"
            }`}
          >
            <CircleHelp aria-hidden="true" className="h-4 w-4" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={8}
            collisionPadding={16}
            className="z-50 max-w-xs rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground shadow-2xl shadow-black/40"
          >
            <strong className="block text-foreground">{concept.term}</strong>
            <span className="text-muted-foreground">{concept.short}</span>
            <Tooltip.Arrow className="fill-background" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
