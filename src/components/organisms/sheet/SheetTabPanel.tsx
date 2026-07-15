"use client";

import type { CharacterSheetSummary, CharacterDescription } from "@/src/types/builder";
import { SavingThrowsGrid } from "@/src/components/molecules/sheet/SavingThrowsGrid";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import { DefensesPanel } from "@/src/components/molecules/sheet/DefensesPanel";
import { PassivesPanel } from "@/src/components/molecules/sheet/PassivesPanel";
import { SensesPanel } from "@/src/components/molecules/sheet/SensesPanel";
import { ConditionsPanel } from "@/src/components/molecules/sheet/ConditionsPanel";
import { PlayStatePanel } from "@/src/components/organisms/sheet/PlayStatePanel";
import { CodexColumn } from "@/src/components/organisms/sheet/CodexColumn";

interface SheetTabPanelProps {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
}

export function SheetTabPanel({ summary, description }: SheetTabPanelProps) {
  return (
    <div className="flex flex-wrap items-start gap-[14px]">
      <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-[14px]">
        <SavingThrowsGrid savingThrows={summary.savingThrows} />
        <SkillsPanel skills={summary.skills} />
      </div>

      <div className="flex min-w-[300px] flex-[2_1_380px] flex-col gap-[14px]">
        <PlayStatePanel summary={summary} />
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          <DefensesPanel
            resistances={summary.resistances}
            immunities={summary.immunities}
            vulnerabilities={summary.vulnerabilities}
          />
          <ConditionsPanel />
          <PassivesPanel
            perception={summary.passives.perception}
            investigation={summary.passives.investigation}
            insight={summary.passives.insight}
          />
          <SensesPanel
            senses={summary.senses}
            languages={summary.languages}
            toolProficiencies={summary.toolProficiencies}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 basis-[230px]">
        <CodexColumn summary={summary} description={description} />
      </div>
    </div>
  );
}
