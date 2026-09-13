import type { CharacterSheetSummary } from "@/src/types/builder";

export interface SheetHeroProps {
  summary: CharacterSheetSummary;
  portraitUrl?: string;
  pdfBusy?: boolean;
  onExportForgeFate: () => void;
  onExportFoundry: () => void;
  onExportPdf: () => void;
}
