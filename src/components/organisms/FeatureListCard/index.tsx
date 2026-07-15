"use client";

import { useState } from "react";
import { parseRulesText } from "@/src/adapters/rulesTextAst";
import { RulesTextView } from "@/src/components/molecules/RulesTextView";
import { cn } from "@/src/lib/utils";
import type { BuilderFeature } from "@/src/types/builder";

import type { FeatureListCardProps } from "./index.types";
export type { FeatureListCardProps } from "./index.types";
export function FeatureListCard({
  title,
  features,
  emptyLabel,
}: FeatureListCardProps) {
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-md border border-white/[0.08] bg-background p-4"
    >
      <h3 id={headingId} className="font-serif text-lg font-bold tracking-wide text-foreground">
        {title}
      </h3>
      {features.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {features.map((feature, index) => (
            <FeatureRow key={`${title}-${feature.name}-${index}`} feature={feature} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-base leading-6 text-muted-foreground">{emptyLabel}</p>
      )}
    </section>
  );
}

function FeatureRow({ feature }: { feature: BuilderFeature }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? `Collapse ${feature.name}` : `View details for ${feature.name}`}
        className="flex w-full cursor-pointer items-center justify-between gap-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="font-serif text-base font-bold tracking-wide text-accent">
          {feature.name}
        </span>
        <i
          aria-hidden="true"
          className={cn(
            "shrink-0 text-muted-foreground transition-colors",
            isOpen ? "fa-solid fa-angle-down" : "fa-solid fa-plus",
          )}
        />
      </button>
      {isOpen && (
        <RulesTextView
          className="mt-2"
          nodes={
            feature.blocks?.length
              ? feature.blocks
              : parseRulesText(feature.description)
          }
        />
      )}
    </li>
  );
}

export function createNamedFeature(name: string, description: string): BuilderFeature {
  return { name, description };
}
