interface DefensesPanelProps {
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
}

export function DefensesPanel({ resistances, immunities, vulnerabilities }: DefensesPanelProps) {
  const hasContent = resistances.length > 0 || immunities.length > 0 || vulnerabilities.length > 0;

  return (
    <section className="rounded-lg border border-white/[0.08] bg-card p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <i aria-hidden="true" className="fa-solid fa-shield-halved text-muted-foreground" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Defesas
        </p>
      </div>
      {hasContent ? (
        <ul className="space-y-0.5">
          {resistances.map((r) => (
            <li key={r} className="flex items-center gap-1.5 text-[0.72rem] text-subdued">
              <i aria-hidden="true" className="fa-solid fa-shield-halved text-brand-blue" />
              Resist. {r}
            </li>
          ))}
          {immunities.map((im) => (
            <li key={im} className="flex items-center gap-1.5 text-[0.72rem] text-subdued">
              <i aria-hidden="true" className="fa-solid fa-shield text-brand-green" />
              Imun. {im}
            </li>
          ))}
          {vulnerabilities.map((v) => (
            <li key={v} className="flex items-center gap-1.5 text-[0.72rem] text-subdued">
              <i aria-hidden="true" className="fa-solid fa-triangle-exclamation text-primary" />
              Vuln. {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.72rem] text-muted-foreground">Nenhuma resistência especial.</p>
      )}
    </section>
  );
}
