import type { SheetSkill } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";

const ATTRIBUTE_ORDER: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];
const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR", destreza: "DES", constituicao: "CON",
  inteligencia: "INT", sabedoria: "SAB", carisma: "CAR",
};

interface SkillsPanelProps {
  skills: SheetSkill[];
}

export function SkillsPanel({ skills }: SkillsPanelProps) {
  const groups = ATTRIBUTE_ORDER.map((key) => ({
    key,
    abbr: ATTRIBUTE_ABBR[key],
    skills: skills.filter((s) => s.attributeKey === key),
  })).filter((g) => g.skills.length > 0);

  return (
    <section className="rounded-[11px] border border-border bg-card p-[14px]">
      <div className="mb-[11px] flex items-center gap-[7px]">
        <i aria-hidden="true" className="fa-solid fa-list-check text-[11px] text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
          Perícias
        </p>
      </div>
      <div className="flex flex-col gap-[10px]">
        {groups.map((grp) => (
          <div key={grp.key}>
            <p className="mb-[5px] text-[8.5px] font-bold uppercase leading-none tracking-[0.14em] text-brand-crimson-alt">
              {grp.abbr}
            </p>
            <div className="flex flex-col gap-px">
              {grp.skills.map((sk) => {
                const dot = sk.isExpert
                  ? "bg-brand-gold border-transparent"
                  : sk.isProficient
                    ? "bg-primary border-transparent"
                    : "bg-transparent border-border";
                const label = sk.isExpert ? "Especialista" : sk.isProficient ? "Proficiente" : "Não proficiente";
                return (
                  <div key={sk.name} className="flex items-center gap-[9px] rounded-md px-[6px] py-1 hover:bg-surface-nested">
                    <span aria-hidden="true" className={`h-[7px] w-[7px] shrink-0 rounded-full border ${dot}`} />
                    <span className="sr-only">{label}:</span>
                    <span className="min-w-[30px] text-right font-serif text-sm font-bold text-foreground">
                      {sk.modifier >= 0 ? "+" : ""}{sk.modifier}
                    </span>
                    <span className="text-[12.5px] text-subdued">{sk.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
