interface DefensesPanelProps {
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
}

export function DefensesPanel({ resistances, immunities, vulnerabilities }: DefensesPanelProps) {
  const hasContent = resistances.length > 0 || immunities.length > 0 || vulnerabilities.length > 0;

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        Defesas
      </p>
      {hasContent ? (
        <ul className="space-y-0.5">
          {resistances.map((r) => (
            <li key={r} className="flex items-center gap-1.5 text-[0.72rem] text-[#b0b5cc]">
              <i aria-hidden="true" className="fa-solid fa-shield-halved text-[#4a9eff]" />
              Resist. {r}
            </li>
          ))}
          {immunities.map((im) => (
            <li key={im} className="flex items-center gap-1.5 text-[0.72rem] text-[#b0b5cc]">
              <i aria-hidden="true" className="fa-solid fa-shield text-[#4ade80]" />
              Imun. {im}
            </li>
          ))}
          {vulnerabilities.map((v) => (
            <li key={v} className="flex items-center gap-1.5 text-[0.72rem] text-[#b0b5cc]">
              <i aria-hidden="true" className="fa-solid fa-triangle-exclamation text-[#e61c23]" />
              Vuln. {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.72rem] text-[#7a7e99]">Nenhuma resistência especial.</p>
      )}
    </section>
  );
}
