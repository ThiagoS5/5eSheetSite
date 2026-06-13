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
    return <p className="text-sm italic text-[#7a7e99]">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={ariaLabel ?? emptyLabel}>
      {features.map((feature) => (
        <li key={feature.name}>
          <HoverTooltip content={<p>{parseTaggedText(feature.description)}</p>}>
            <span className="rounded border border-white/[0.08] bg-white/5 px-2 py-0.5 text-[0.65rem] font-medium text-[#b0b5cc] transition hover:border-[#f3c969]/60 hover:text-white">
              {feature.name}
            </span>
          </HoverTooltip>
        </li>
      ))}
    </ul>
  );
}
