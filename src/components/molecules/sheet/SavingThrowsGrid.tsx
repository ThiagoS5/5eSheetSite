import type { SheetSavingThrow } from "@/types/builder";

interface SavingThrowsGridProps {
  savingThrows: SheetSavingThrow[];
}

export function SavingThrowsGrid({ savingThrows }: SavingThrowsGridProps) {
  return (
    <section className="rounded-[11px] border border-border bg-card p-[14px]">
      <div className="mb-[11px] flex items-center gap-[7px]">
        <i aria-hidden="true" className="fa-solid fa-shield-halved text-[11px] text-primary" />
        <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
          Saving Throws
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {savingThrows.map((sv) => (
          <div
            key={sv.attributeKey}
            className="relative flex flex-col items-center gap-[3px] rounded-[9px] border border-border bg-surface-nested px-1 py-[9px]"
          >
            {sv.isProficient && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute right-[6px] top-[6px] h-[7px] w-[7px] rounded-full bg-primary"
                />
                <span className="sr-only">Proficient</span>
              </>
            )}
            <span className="text-[9px] font-bold leading-none tracking-[0.1em] text-muted-foreground">
              <span translate="no" className="notranslate">{sv.abbr}</span>
            </span>
            <span className="font-serif text-lg font-extrabold text-foreground">
              <span translate="no" className="notranslate">{sv.modifier >= 0 ? "+" : ""}{sv.modifier}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
