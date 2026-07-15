export interface SensesPanelProps {
  senses: Array<{ name: string; rangeFeet?: number }>;
  languages: string[];
  toolProficiencies?: string[];
}
