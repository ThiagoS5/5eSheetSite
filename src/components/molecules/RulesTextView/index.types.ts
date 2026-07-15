import type { RulesTextNode } from "@/src/types/rulesText";

export interface RulesTextViewProps {
  nodes: RulesTextNode[];
  className?: string;
}

export interface RulesInlineTextProps { text: string }
