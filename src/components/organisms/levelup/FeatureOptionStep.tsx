"use client";

import type { FeatureOptionStepProps } from "@/src/components/organisms/levelup/types";

export function FeatureOptionStep({
  level,
  featureName,
  count,
  options,
  selected,
  onChange,
}: FeatureOptionStepProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
      return;
    }
    if (selected.length >= count) return;
    onChange([...selected, value]);
  };

  return (
    <section aria-label={`Level ${level} · ${featureName}`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Level <span translate="no" className="notranslate">{level}</span> · choose <span translate="no" className="notranslate">{count}</span>
        </p>
        <h2 translate="no" className="notranslate font-serif text-xl font-bold tracking-wide text-foreground">{featureName}</h2>
      </header>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isLocked = !isSelected && selected.length >= count;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              disabled={isLocked}
              aria-pressed={isSelected}
              className="flex items-center justify-between rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground"
            >
              <span translate="no" className="notranslate">{option.label}</span>
              {isSelected ? <i aria-hidden="true" className="fa-solid fa-check text-brand-crimson-alt" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
