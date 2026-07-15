import type { ConceptId } from "@/src/data/conceptGlossary";

export interface StepIntroCardProps {
  conceptId: ConceptId;
  title: string;
  beginnerMode: boolean;
}
