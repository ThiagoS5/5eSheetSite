import type { CharacterSheetSummary } from "@/src/types/builder";

export interface SheetHeroProps {
  summary: CharacterSheetSummary;
  onExportForgeFate: () => void;
  onExportFoundry: () => void;
  onExportPdf: () => void;
}
