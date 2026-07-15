import type { CharacterSheetSummary } from "@/src/types/builder";

export interface SheetHeroProps {
  summary: CharacterSheetSummary;
  onExportFoundry: () => void;
  onExportPdf: () => void;
}
