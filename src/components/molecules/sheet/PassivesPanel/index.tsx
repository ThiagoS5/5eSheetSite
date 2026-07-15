

import type { PassivesPanelProps } from "./index.types";
export type { PassivesPanelProps } from "./index.types";
export function PassivesPanel({ perception, investigation, insight }: PassivesPanelProps) {
  const items = [
    { label: "Passive Perception", value: perception },
    { label: "Passive Investigation", value: investigation },
    { label: "Passive Insight", value: insight },
  ];

  return (
    <section className="rounded-lg border border-white/[0.08] bg-card p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <i aria-hidden="true" className="fa-solid fa-eye text-muted-foreground" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Passive Senses
        </p>
      </div>
      <dl className="space-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-2">
            <dd translate="no" className="notranslate w-6 text-right text-sm font-bold text-foreground">{value}</dd>
            <dt className="text-xs text-subdued">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
