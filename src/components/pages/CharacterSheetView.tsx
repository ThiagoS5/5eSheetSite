"use client";

import { pdf } from "@react-pdf/renderer";
import { buildPdfDocument } from "@/src/adapters/pdfAdapter";
import { selectDerivedSheet } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { cn } from "@/src/lib/utils";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { SHEET_THEME_VARS } from "@/src/components/organisms/sheet/sheetTheme";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";

interface CharacterSheetViewProps {
  /** Embedded mode (builder conclusao) drops the full-screen chrome. */
  embedded?: boolean;
}

export function CharacterSheetView({ embedded = false }: CharacterSheetViewProps) {
  const state = useCharacterBuilderState();
  const description = useCharacterStore((s) => s.description);
  const summary = useCharacterStore(selectDerivedSheet);

  function handleFoundryExport() {
    const exportData = createFoundryCharacterExport(state, summary);
    downloadJson(`${sanitizeFileName(summary.name)}-foundry-vtt.json`, JSON.stringify(exportData, null, 2));
  }

  async function handlePdfExport() {
    const blob = await pdf(buildPdfDocument({ summary, description, inventory: summary.inventory })).toBlob();
    downloadBlob(blob, `${sanitizeFileName(summary.name)}-sheet.pdf`);
  }

  const content = (
    <div className="flex flex-col gap-[14px]" style={SHEET_THEME_VARS}>
      <SheetHero
        summary={summary}
        onExportFoundry={handleFoundryExport}
        onExportPdf={handlePdfExport}
      />
      <ContentTabs summary={summary} description={description} />
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
