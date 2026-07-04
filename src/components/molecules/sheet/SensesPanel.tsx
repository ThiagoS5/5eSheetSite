interface SensesPanelProps {
  senses: Array<{ name: string; rangeFeet?: number }>;
  languages: string[];
}

export function SensesPanel({ senses, languages }: SensesPanelProps) {
  if (senses.length === 0 && languages.length === 0) return null;

  return (
    <section className="rounded-lg border border-white/[0.08] bg-card p-3">
      {senses.length > 0 && (
        <>
          <div className="mb-1 flex items-center gap-1.5">
            <i aria-hidden="true" className="fa-solid fa-tower-observation text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Senses
            </p>
          </div>
          <ul className="mb-3 space-y-0.5">
            {senses.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-xs text-subdued">
                <i aria-hidden="true" className="fa-solid fa-eye text-muted-foreground" />
                <span translate="no" className="notranslate">{s.name}</span>
                {s.rangeFeet != null && (
                  <span className="ml-auto text-muted-foreground">
                    <span translate="no" className="notranslate">{s.rangeFeet} ft.</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {languages.length > 0 && (
        <>
          <div className="mb-1 flex items-center gap-1.5">
            <i aria-hidden="true" className="fa-solid fa-language text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Languages
            </p>
          </div>
          <p translate="no" className="notranslate text-xs text-subdued">{languages.join(", ")}</p>
        </>
      )}
    </section>
  );
}
