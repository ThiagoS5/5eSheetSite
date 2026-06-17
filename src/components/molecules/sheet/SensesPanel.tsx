interface SensesPanelProps {
  senses: Array<{ name: string; rangeFeet?: number }>;
  languages: string[];
}

export function SensesPanel({ senses, languages }: SensesPanelProps) {
  if (senses.length === 0 && languages.length === 0) return null;

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      {senses.length > 0 && (
        <>
          <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Sentidos
          </p>
          <ul className="mb-3 space-y-0.5">
            {senses.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-[0.72rem] text-[#b0b5cc]">
                <i aria-hidden="true" className="fa-solid fa-eye text-[#7a7e99]" />
                {s.name}
                {s.rangeFeet != null && (
                  <span className="ml-auto text-[#7a7e99]">
                    {Math.round(s.rangeFeet / 0.3)} m
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {languages.length > 0 && (
        <>
          <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Idiomas
          </p>
          <p className="text-[0.72rem] text-[#b0b5cc]">{languages.join(", ")}</p>
        </>
      )}
    </section>
  );
}
