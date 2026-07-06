"use client";

import { pdf } from "@react-pdf/renderer";
import { buildPdfDocument } from "@/src/adapters/pdfAdapter";
import { selectDerivedSheet } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { cn } from "@/src/lib/utils";
import { deriveCarriedEquipment } from "@/rules/inventoryRules";
import { getBuilderBackgrounds, getBuilderClasses } from "@/src/services/ruleService";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { serializeCharacterExport } from "@/src/utils/canonicalExport";
import { SHEET_THEME_VARS } from "@/src/components/organisms/sheet/sheetTheme";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import { SavingThrowsGrid } from "@/src/components/molecules/sheet/SavingThrowsGrid";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import { CodexColumn } from "@/src/components/organisms/sheet/CodexColumn";
import { DefensesPanel } from "@/src/components/molecules/sheet/DefensesPanel";
import { PassivesPanel } from "@/src/components/molecules/sheet/PassivesPanel";
import { SensesPanel } from "@/src/components/molecules/sheet/SensesPanel";
import { ConditionsPanel } from "@/src/components/molecules/sheet/ConditionsPanel";
import { PlayStatePanel } from "@/src/components/organisms/sheet/PlayStatePanel";

interface CharacterSheetViewProps {
  /** Embedded mode (builder conclusao) drops the full-screen chrome. */
  embedded?: boolean;
}

export function CharacterSheetView({ embedded = false }: CharacterSheetViewProps) {
  const state = useCharacterBuilderState();
  const description = useCharacterStore((s) => s.description);
  const summary = useCharacterStore(selectDerivedSheet);
  const characterBuild = useCharacterStore((s) => s.characterBuild);

  function handleFoundryExport() {
    const exportData = createFoundryCharacterExport(state, summary);
    downloadJson(`${sanitizeFileName(summary.name)}-foundry-vtt.json`, JSON.stringify(exportData, null, 2));
  }

  async function handlePdfExport() {
    const inventory = deriveCarriedEquipment({
      state,
      characterClass: getBuilderClasses().find((entry) => entry.id === state.selectedClassId),
      background: getBuilderBackgrounds().find((entry) => entry.id === state.selectedBackgroundId),
    });
    const blob = await pdf(buildPdfDocument({ summary, description, inventory })).toBlob();
    downloadBlob(blob, `${sanitizeFileName(summary.name)}-sheet.pdf`);
  }

  function handleExportCanonical() {
    const json = serializeCharacterExport(characterBuild);
    downloadJson(`${sanitizeFileName(summary.name)}-forge-fate.json`, json);
  }

  const content = (
    <div className="flex flex-col gap-[14px]" style={SHEET_THEME_VARS}>
      <SheetHero
        summary={summary}
        onExportFoundry={handleFoundryExport}
        onExportCanonical={handleExportCanonical}
        onExportPdf={handlePdfExport}
      />

      {/* Middle region */}
      <div className="flex flex-wrap items-start gap-[14px]">
        <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-[14px]">
          <SavingThrowsGrid savingThrows={summary.savingThrows} />
          <SkillsPanel skills={summary.skills} />
        </div>
        <div className="min-w-0 flex-[2_1_400px]">
          <ContentTabs summary={summary} />
        </div>
        <div className="min-w-0 flex-1 basis-[250px]">
          <CodexColumn summary={summary} description={description} />
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[14px]">
        <DefensesPanel
          resistances={summary.resistances}
          immunities={summary.immunities}
          vulnerabilities={summary.vulnerabilities}
        />
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
        <PlayStatePanel summary={summary} />
        <ConditionsPanel />
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={cn("min-h-screen bg-background")}>
      <main className="p-3 lg:p-4">{content}</main>
    </div>
  );
}

function sanitizeFileName(value: string): string {
  return (
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character"
  );
}

function downloadJson(fileName: string, json: string): void {
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, fileName);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
