import type { CharacterSheetSummary } from "@/types/builder";
import { DefensesPanel } from "@/src/components/molecules/sheet/DefensesPanel";
import { ConditionsPanel } from "@/src/components/molecules/sheet/ConditionsPanel";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";

interface MainContentColumnProps {
  summary: CharacterSheetSummary;
  className?: string;
}

const EMPTY_ROWS = 3;

export function MainContentColumn({ summary, className }: MainContentColumnProps) {
  const weaponRows = [...summary.weapons];
  while (weaponRows.length < EMPTY_ROWS) {
    weaponRows.push({ name: "", attackBonus: "", damage: "", notes: "" });
  }

  return (
    <section aria-label="Conteúdo principal" className={`flex flex-col gap-3 ${className ?? ""}`}>
      {/* Defenses + conditions side by side */}
      <div className="grid grid-cols-2 gap-3">
        <DefensesPanel
          resistances={summary.resistances}
          immunities={summary.immunities}
          vulnerabilities={summary.vulnerabilities}
        />
        <ConditionsPanel />
      </div>

      {/* Weapons table */}
      <section className="rounded-lg border border-white/[0.08] bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <i aria-hidden="true" className="fa-solid fa-sword text-muted-foreground text-[10px]" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Armas
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full text-[0.72rem]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1 pr-3 text-left font-semibold">NOME</th>
                <th className="py-1 pr-3 text-left font-semibold">BÔNUS/CD</th>
                <th className="py-1 pr-3 text-left font-semibold">DANO & TIPO</th>
                <th className="py-1 text-left font-semibold">NOTAS</th>
              </tr>
            </thead>
            <tbody>
              {weaponRows.map((w, i) => (
                <tr
                  key={w.name || `empty-${i}`}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-1.5 pr-3 text-foreground">{w.name || "—"}</td>
                  <td className="py-1.5 pr-3 font-semibold text-foreground">{w.attackBonus || "—"}</td>
                  <td className="py-1.5 pr-3 text-subdued">{w.damage || "—"}</td>
                  <td className="py-1.5 text-muted-foreground">{w.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Main content tabs */}
      <ContentTabs summary={summary} />
    </section>
  );
}
