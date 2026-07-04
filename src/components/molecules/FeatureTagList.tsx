import { HoverTooltip } from "@/src/components/molecules/HoverTooltip";
import { parseTaggedText } from "@/src/utils/textParser";
import type { BuilderFeature } from "@/types/builder";

interface FeatureTagListProps {
  features: readonly BuilderFeature[];
  emptyLabel: string;
  ariaLabel?: string;
}

export function FeatureTagList({
  features,
  emptyLabel,
  ariaLabel,
}: FeatureTagListProps) {
  if (features.length === 0) {
    return <p className="text-sm italic text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={ariaLabel ?? emptyLabel}>
      {features.map((feature, index) => (
        <li key={`${feature.name}-${index}`}>
          <HoverTooltip content={<p>{parseTaggedText(feature.description)}</p>}>
            <span className="rounded border border-white/[0.08] bg-white/5 px-2 py-0.5 text-xs font-medium text-subdued transition hover:border-accent/60 hover:text-foreground">
              {feature.name}
            </span>
          </HoverTooltip>
        </li>
      ))}
    </ul>
  );
}
