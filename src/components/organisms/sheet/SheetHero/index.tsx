import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { CombatStatFrame } from "@/src/components/atoms/sheet/frames/CombatStatFrame";
import { AttributeGrid } from "@/src/components/molecules/sheet/AttributeGrid";
import { LevelUpButton } from "@/src/components/molecules/LevelUpButton";

import type { SheetHeroProps } from "./index.types";
export type { SheetHeroProps } from "./index.types";
function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function SheetHero({
  summary,
  onExportForgeFate,
  onExportFoundry,
  onExportPdf,
}: SheetHeroProps) {
  return (
    <div className="flex flex-col items-center gap-[18px] rounded-2xl border border-border bg-surface-nested px-5 py-[22px] [background:radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent_60%),var(--surface-nested)]">

      <div
        data-testid="sheet-hero-topbar"
        className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[14px] max-md:grid-cols-1"
      >
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 md:justify-self-start">
          <ExportButton label="Export Forge & Fate JSON" icon="fa-file-code" onClick={onExportForgeFate} />
          <ExportButton label="Export Foundry VTT JSON" icon="fa-file-export" onClick={onExportFoundry} />
          <ExportButton label="Export PDF" icon="fa-file-pdf" onClick={onExportPdf} />
        </div>
        <div
          data-testid="sheet-hero-identity"
          className="min-w-0 justify-self-center text-center md:min-w-[200px]"
        >
          <h1 translate="no" className="notranslate m-0 font-serif text-[28px] font-extrabold leading-[1.02] text-foreground">
            {summary.name || "Unnamed Character"}
          </h1>
          <p translate="no" className="notranslate mt-[5px] text-[13px] text-muted-foreground">
            <span className="font-semibold text-brand-crimson-alt">
              Level <span className="notranslate">{summary.level}</span>
            </span>
            {[
              [summary.speciesName, summary.className].filter(Boolean).join(" "),
              summary.backgroundName,
              `${summary.ruleset === "2024" ? "2024" : "2014"} rules`,
            ]
              .filter(Boolean)
              .map((part) => ` - ${part}`)
              .join("")}
          </p>
        </div>
        <div className="justify-self-center md:justify-self-end">
          <LevelUpButton />
        </div>
      </div>


      <div
        data-testid="sheet-hero-combat-stats"
        className="grid grid-cols-1 items-center justify-items-center gap-[22px] min-[440px]:grid-cols-[88px_172px_88px]"
      >
        <CombatStatFrame variant="square" accentColor="var(--brand-crimson-alt)">
          <i aria-hidden="true" className="fa-solid fa-bolt text-[13px] text-primary" />
          <span className="text-[8.5px] uppercase tracking-[0.05em] text-muted-foreground">Initiative</span>
          <span translate="no" className="notranslate font-serif text-2xl font-extrabold text-foreground">{fmt(summary.initiative)}</span>
        </CombatStatFrame>

        <div className="relative flex h-[190px] w-[172px] items-center justify-center">
          <svg viewBox="0 0 100 110" className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50 4 L 94 18 L 94 54 C 94 80 72 100 50 106 C 28 100 6 80 6 54 L 6 18 Z" fill="var(--card)" stroke="var(--brand-crimson-alt)" strokeWidth="1.5" />
            <path d="M 50 9 L 89 21 L 89 54 C 89 78 68 97 50 102 C 32 97 11 78 11 54 L 11 21 Z" fill="none" stroke="var(--brand-crimson-alt)" strokeWidth="0.6" opacity="0.5" />
          </svg>
          <div className="relative flex flex-col items-center gap-0.5 pb-4">
            <span className="text-center text-[9.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-brand-crimson-alt">
              Armor<br />Class
            </span>
            <span translate="no" className="notranslate font-serif text-5xl font-extrabold leading-none text-foreground">{summary.armorClass}</span>
          </div>
        </div>

        <CombatStatFrame variant="square" accentColor="var(--muted-foreground)">
          <i aria-hidden="true" className="fa-solid fa-shoe-prints text-[13px] text-muted-foreground" />
          <span className="text-[8.5px] uppercase tracking-[0.05em] text-muted-foreground">Speed</span>
          <span translate="no" className="notranslate font-serif text-[22px] font-extrabold text-foreground">
            {summary.speedFeet}<span className="text-xs font-semibold text-muted-foreground">ft.</span>
          </span>
        </CombatStatFrame>
      </div>


      <div className="flex w-full max-w-[560px] items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-crimson-alt" />
        <div className="flex items-center gap-[10px] rounded-full border border-border bg-card px-4 py-[7px]">
          <i aria-hidden="true" className="fa-solid fa-heart text-xs text-primary" />
          <span className="font-serif text-xl font-extrabold text-foreground">
            <span translate="no" className="notranslate">{summary.currentHp}</span><span translate="no" className="notranslate text-[13px] font-semibold text-muted-foreground"> / {summary.maxHp} HP</span>
          </span>
          <span className="h-[18px] w-px bg-border" />
          <i aria-hidden="true" className="fa-solid fa-star text-[11px] text-primary" />
          <span translate="no" className="notranslate font-serif text-base font-extrabold text-foreground">+{summary.proficiencyBonus}</span>
          <span className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Prof.</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-brand-crimson-alt to-transparent" />
      </div>

      <AttributeGrid attributes={summary.attributes} />
    </div>
  );
}

function ExportButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[7px] rounded-[9px] border border-border bg-card px-[14px] py-[9px] text-xs font-bold tracking-[0.04em] text-muted-foreground transition-colors hover:border-brand-crimson-alt hover:text-foreground",
        focusRing,
      )}
    >
      <i aria-hidden="true" className={`fa-solid ${icon}`} />
      {label}
    </button>
  );
}
