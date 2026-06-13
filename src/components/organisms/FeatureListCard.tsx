import { HoverTooltip } from "@/src/components/molecules/HoverTooltip";
import { parseTaggedText } from "@/src/utils/textParser";
import type { BuilderFeature } from "@/types/builder";

interface FeatureListCardProps {
  title: string;
  features: BuilderFeature[];
  emptyLabel: string;
}

export function FeatureListCard({
  title,
  features,
  emptyLabel,
}: FeatureListCardProps) {
  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-md border border-white/[0.08] bg-[#10121b] p-4"
    >
      <h3 id={headingId} className="font-serif text-lg font-bold tracking-wide text-white">
        {title}
      </h3>
      {features.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {features.map((feature) => (
            <li
              key={`${title}-${feature.name}`}
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-3"
            >
              <HoverTooltip content={<p>{parseTaggedText(feature.description)}</p>}>
                <span className="font-serif text-base font-bold tracking-wide text-[#f3c969]">
                  {feature.name}
                </span>
              </HoverTooltip>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-[#7a7e99]">{emptyLabel}</p>
      )}
    </section>
  );
}

export function createNamedFeature(name: string, description: string): BuilderFeature {
  return { name, description };
}
