import type { CharacterDescription, CharacterSheetSummary } from "@/src/types/builder";

export interface CodexColumnProps {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
  className?: string;
}
