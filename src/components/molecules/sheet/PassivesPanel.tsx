interface PassivesPanelProps {
  perception: number;
  investigation: number;
  insight: number;
}

export function PassivesPanel({ perception, investigation, insight }: PassivesPanelProps) {
  const items = [
    { label: "Percepção Passiva", value: perception },
    { label: "Investigação Passiva", value: investigation },
    { label: "Intuição Passiva", value: insight },
  ];

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <i aria-hidden="true" className="fa-solid fa-eye text-[#7a7e99]" />
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
          Sentidos Passivos
        </p>
      </div>
      <dl className="space-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-2">
            <dd className="w-6 text-right text-sm font-bold text-white">{value}</dd>
            <dt className="text-[0.72rem] text-[#b0b5cc]">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
