import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { StatBadge } from "@/src/components/atoms/StatBadge";
import type { CharacterSheetSummary } from "@/types/builder";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";

interface AbilityScoresGridProps {
  summary: CharacterSheetSummary;
}

const ATTRIBUTE_ORDER: readonly AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

export function AbilityScoresGrid({ summary }: AbilityScoresGridProps) {
  return (
    <section
      aria-labelledby="ability-scores-title"
      className="rounded-md border border-white/[0.08] bg-background p-4"
    >
      <h3
        id="ability-scores-title"
        className="font-serif text-lg font-bold tracking-wide text-foreground"
      >
        Atributos
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {ATTRIBUTE_ORDER.map((attribute) => (
          <StatBadge
            key={attribute}
            label={ATTRIBUTE_LABELS[attribute]}
            value={summary.finalAttributes[attribute]}
            detail={formatModifier(getAbilityModifier(summary.finalAttributes[attribute]))}
          />
        ))}
      </dl>
    </section>
  );
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
