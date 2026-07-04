import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { StatBadge } from "@/src/components/atoms/StatBadge";
import type { CharacterSheetSummary } from "@/types/builder";

interface CombatStatsCardProps {
  summary: CharacterSheetSummary;
}

export function CombatStatsCard({ summary }: CombatStatsCardProps) {
  const initiative = getAbilityModifier(summary.finalAttributes.destreza);
  const armorClassFormula = summary.armorClassBreakdown
    ?.map((part) => `${part.value} ${part.label}`)
    .join(" + ");
  const armorClassTitle = armorClassFormula
    ? `AC ${summary.armorClass} = ${armorClassFormula}`
    : undefined;

  const hitPointsFormula = summary.maxHpBreakdown
    ?.map((part) => `${part.value} ${part.label}`)
    .join(" + ");
  const hitPointsTitle = hitPointsFormula
    ? `HP ${summary.hitPoints} = ${hitPointsFormula}`
    : undefined;

  return (
    <section
      aria-labelledby="combat-stats-title"
      className="rounded-md border border-white/[0.08] bg-background p-4"
    >
      <h3
        id="combat-stats-title"
        className="font-serif text-lg font-bold tracking-wide text-foreground"
      >
        Combat
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatBadge
          label="AC"
          value={summary.armorClass}
          detail={armorClassFormula}
          title={armorClassTitle}
        />
        <StatBadge
          label="HP"
          value={summary.hitPoints}
          detail={hitPointsFormula}
          title={hitPointsTitle}
        />
        <StatBadge label="Initiative" value={formatModifier(initiative)} />
        <StatBadge label="Proficiency" value={formatModifier(summary.proficiencyBonus)} />
      </dl>
    </section>
  );
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
