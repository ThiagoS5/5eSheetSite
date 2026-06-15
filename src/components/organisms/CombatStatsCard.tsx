import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { StatBadge } from "@/src/components/atoms/StatBadge";
import type { CharacterSheetSummary } from "@/types/builder";

interface CombatStatsCardProps {
  summary: CharacterSheetSummary;
}

export function CombatStatsCard({ summary }: CombatStatsCardProps) {
  const initiative = getAbilityModifier(summary.finalAttributes.destreza);

  return (
    <section
      aria-labelledby="combat-stats-title"
      className="rounded-md border border-white/[0.08] bg-[#10121b] p-4"
    >
      <h3
        id="combat-stats-title"
        className="font-serif text-lg font-bold tracking-wide text-white"
      >
        Combate
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatBadge label="CA" value={summary.armorClass} />
        <StatBadge label="PV" value={summary.hitPoints} />
        <StatBadge label="Iniciativa" value={formatModifier(initiative)} />
        <StatBadge label="Proficiência" value={formatModifier(summary.proficiencyBonus)} />
      </dl>
    </section>
  );
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
