"use client";

import { ChoiceCard } from "@/src/components/molecules/ChoiceCard";
import type { SubclassStepProps } from "@/src/components/organisms/levelup/types";

export function SubclassStep({ level, subclasses, selectedSubclassId, onSelect }: SubclassStepProps) {
  return (
    <section aria-label={`Level ${level} · Subclass`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Level <span translate="no" className="notranslate">{level}</span>
        </p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Subclass</h2>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {subclasses.map((subclass) => (
          <ChoiceCard
            key={subclass.id}
            title={subclass.name}
            selected={subclass.id === selectedSubclassId}
            onSelect={() => onSelect(subclass.id)}
          >
            {subclass.features[0]?.description || "Class subclass."}
          </ChoiceCard>
        ))}
      </div>
    </section>
  );
}
