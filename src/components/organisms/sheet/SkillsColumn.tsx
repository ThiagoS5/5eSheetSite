import type { CharacterSheetSummary, SheetSkill } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";
import { SkillRow } from "@/src/components/molecules/sheet/SkillRow";
import { PassivesPanel } from "@/src/components/molecules/sheet/PassivesPanel";
import { SensesPanel } from "@/src/components/molecules/sheet/SensesPanel";
import { cn } from "@/src/lib/utils";

const ATTRIBUTE_ORDER: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];

const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR", destreza: "DES", constituicao: "CON",
  inteligencia: "INT", sabedoria: "SAB", carisma: "CAR",
};

interface SkillsColumnProps {
  summary: CharacterSheetSummary;
}

export function SkillsColumn({ summary }: SkillsColumnProps) {
  const skillsByAttr = ATTRIBUTE_ORDER.reduce<Record<string, SheetSkill[]>>(
    (acc, key) => {
      acc[key] = summary.skills.filter((s) => s.attributeKey === key);
      return acc;
    },
    {},
  );

  return (
    <section aria-labelledby="skills-col-title" className="flex flex-col gap-3">
      <h3
        id="skills-col-title"
        className="flex items-center gap-2 font-serif text-lg font-bold tracking-wide text-foreground"
      >
        <i aria-hidden="true" className="fa-solid fa-list-check text-muted-foreground" />
        Salvaguardas & Perícias
      </h3>

      <div className="rounded-lg border border-white/[0.08] bg-card px-3 py-2">
        {ATTRIBUTE_ORDER.map((key) => {
          const save = summary.savingThrows.find((s) => s.attributeKey === key);
          const skills = skillsByAttr[key] ?? [];
          return (
            <div key={key} className="border-b border-border/50 py-1.5 last:border-0">
              {/* Saving throw row */}
              {save && (
                <div className="flex items-center gap-2 py-0.5">
                  <div
                    className={cn(
                      "flex h-3 w-3 shrink-0 items-center justify-center rounded border",
                      save.isProficient
                        ? "border-primary bg-primary/20"
                        : "border-white/30",
                    )}
                  >
                    {save.isProficient && (
                      <div className="h-1.5 w-1.5 rounded-sm bg-primary" />
                    )}
                  </div>
                  <span className="min-w-[1.75rem] text-right text-base font-bold text-foreground">
                    {save.modifier >= 0 ? "+" : ""}{save.modifier}
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    Salv. {ATTRIBUTE_ABBR[key]}
                  </span>
                </div>
              )}
              {/* Skills for this attribute (indented) */}
              <div className="pl-4">
                {skills.map((skill) => (
                  <SkillRow key={skill.name} skill={skill} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <PassivesPanel
        perception={summary.passives.perception}
        investigation={summary.passives.investigation}
        insight={summary.passives.insight}
      />

      <SensesPanel senses={summary.senses} languages={summary.languages} />
    </section>
  );
}
