export type RulesTextRefType =
  | "spell"
  | "item"
  | "condition"
  | "feat"
  | "skill"
  | "action"
  | "sense"
  | "creature"
  | "class"
  | "background"
  | "race"
  | "variantrule";

export type RulesTextInlineNode =
  | { type: "text"; text: string }
  | { type: "bold"; children: RulesTextInlineNode[] }
  | { type: "italic"; children: RulesTextInlineNode[] }
  | { type: "dice"; label: string }
  | { type: "internalRef"; refType: RulesTextRefType; label: string; ref: string };

export type RulesTextNode =
  | { type: "paragraph"; children: RulesTextInlineNode[] }
  | { type: "list"; items: RulesTextInlineNode[][] }
  | {
      type: "table";
      caption?: string;
      headers: RulesTextInlineNode[][];
      rows: RulesTextInlineNode[][][];
    };
