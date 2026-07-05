import type {
  RulesTextInlineNode,
  RulesTextNode,
  RulesTextRefType,
} from "@/types/rulesText";

const REF_TAGS: ReadonlySet<string> = new Set<RulesTextRefType>([
  "spell",
  "item",
  "condition",
  "feat",
  "skill",
  "action",
  "sense",
  "creature",
  "class",
  "background",
  "race",
  "variantrule",
]);

const DICE_TAGS: ReadonlySet<string> = new Set(["dice", "damage", "d20", "hit", "chance"]);

/**
 * Converte entries brutos 5eTools em RulesTextNode[].
 * Contrato: nunca lança; entrada desconhecida degrada para texto ou é ignorada.
 */
export function parseRulesText(entries: unknown): RulesTextNode[] {
  try {
    return entriesToBlocks(entries);
  } catch {
    return [];
  }
}

function entriesToBlocks(entries: unknown): RulesTextNode[] {
  if (entries === null || entries === undefined) {
    return [];
  }

  if (Array.isArray(entries)) {
    return entries.flatMap((entry) => entryToBlocks(entry));
  }

  return entryToBlocks(entries);
}

function entryToBlocks(entry: unknown): RulesTextNode[] {
  if (typeof entry === "string") {
    const children = parseInlineText(entry);
    return children.length ? [{ type: "paragraph", children }] : [];
  }

  if (typeof entry !== "object" || entry === null) {
    return [];
  }

  const record = entry as Record<string, unknown>;

  if (record.type === "list") {
    return listToBlocks(record);
  }

  if (record.type === "table") {
    return tableToBlocks(record);
  }

  const name = typeof record.name === "string" ? record.name.trim() : "";
  const innerBlocks = [
    ...entriesToBlocks(record.entries),
    ...(record.entry !== undefined ? entriesToBlocks(record.entry) : []),
  ];

  if (!name) {
    return innerBlocks;
  }

  return prependTitle(name, innerBlocks);
}

function prependTitle(name: string, blocks: RulesTextNode[]): RulesTextNode[] {
  const title: RulesTextInlineNode = {
    type: "bold",
    children: [{ type: "text", text: `${name}. ` }],
  };

  const [first, ...rest] = blocks;

  if (first?.type === "paragraph") {
    return [{ type: "paragraph", children: [title, ...first.children] }, ...rest];
  }

  return [{ type: "paragraph", children: [title] }, ...blocks];
}

function listToBlocks(record: Record<string, unknown>): RulesTextNode[] {
  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items = rawItems
    .map((item) => listItemToInline(item))
    .filter((children) => children.length > 0);

  return items.length ? [{ type: "list", items }] : [];
}

function listItemToInline(item: unknown): RulesTextInlineNode[] {
  if (typeof item === "string") {
    return parseInlineText(item);
  }

  if (typeof item !== "object" || item === null) {
    return [];
  }

  const record = item as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const children = blocksToInline(entriesToBlocks(record.entry ?? record.entries));

  if (!name) {
    return children;
  }

  return [
    { type: "bold", children: [{ type: "text", text: `${name}. ` }] },
    ...children,
  ];
}

function tableToBlocks(record: Record<string, unknown>): RulesTextNode[] {
  const caption = typeof record.caption === "string" ? record.caption : undefined;
  const colLabels = Array.isArray(record.colLabels) ? record.colLabels : [];
  const rawRows = Array.isArray(record.rows) ? record.rows : [];

  const headers = colLabels.map((label) => cellToInline(label));
  const rows = rawRows
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) => row.map((cell) => cellToInline(cell)));

  if (!headers.length && !rows.length) {
    return [];
  }

  return [{ type: "table", caption, headers, rows }];
}

function cellToInline(cell: unknown): RulesTextInlineNode[] {
  if (typeof cell === "string") {
    return parseInlineText(cell);
  }

  if (typeof cell === "number") {
    return [{ type: "text", text: String(cell) }];
  }

  if (typeof cell === "object" && cell !== null) {
    const record = cell as Record<string, unknown>;
    const roll = record.roll as Record<string, unknown> | undefined;

    if (roll && typeof roll === "object") {
      if (typeof roll.exact === "number") {
        return [{ type: "text", text: String(roll.exact) }];
      }
      if (typeof roll.min === "number" && typeof roll.max === "number") {
        return [{ type: "text", text: `${roll.min}–${roll.max}` }];
      }
    }

    return blocksToInline(entriesToBlocks(record.entry ?? record.entries));
  }

  return [];
}

/** Achata blocos em inline nodes (para células/itens que recebem blocos aninhados). */
function blocksToInline(blocks: RulesTextNode[]): RulesTextInlineNode[] {
  return blocks.flatMap((block) => {
    if (block.type === "paragraph") {
      return block.children;
    }

    if (block.type === "list") {
      return block.items.flatMap((item, index) =>
        index === 0 ? item : [{ type: "text", text: " " } as RulesTextInlineNode, ...item],
      );
    }

    return [{ type: "text", text: tableToPlainText(block) }];
  });
}

/**
 * Parser de tags inline 5eTools ({@dice}, {@spell …}); suporta chaves aninhadas.
 * Tags desconhecidas degradam para o rótulo visível.
 */
export function parseInlineText(text: string): RulesTextInlineNode[] {
  const nodes: RulesTextInlineNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const start = text.indexOf("{@", cursor);

    if (start === -1) {
      pushText(nodes, text.slice(cursor));
      break;
    }

    pushText(nodes, text.slice(cursor, start));

    const end = findClosingBrace(text, start);

    if (end === -1) {
      pushText(nodes, text.slice(start));
      break;
    }

    const inner = text.slice(start + 2, end);
    const spaceIndex = inner.indexOf(" ");
    const tag = (spaceIndex === -1 ? inner : inner.slice(0, spaceIndex)).toLowerCase();
    const content = spaceIndex === -1 ? "" : inner.slice(spaceIndex + 1);

    nodes.push(...tagToNodes(tag, content));
    cursor = end + 1;
  }

  return nodes;
}

function findClosingBrace(text: string, openIndex: number): number {
  let depth = 0;

  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "{") {
      depth += 1;
    } else if (text[i] === "}") {
      depth -= 1;

      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function tagToNodes(tag: string, content: string): RulesTextInlineNode[] {
  if (tag === "b" || tag === "bold") {
    return [{ type: "bold", children: parseInlineText(content) }];
  }

  if (tag === "i" || tag === "italic") {
    return [{ type: "italic", children: parseInlineText(content) }];
  }

  if (DICE_TAGS.has(tag)) {
    return [{ type: "dice", label: getDisplayLabel(content) }];
  }

  if (REF_TAGS.has(tag)) {
    return [
      {
        type: "internalRef",
        refType: tag as RulesTextRefType,
        label: getRefDisplayLabel(content),
        ref: content,
      },
    ];
  }

  const label = getDisplayLabel(content);
  return label ? [{ type: "text", text: label }] : [];
}

function getDisplayLabel(rawContent: string): string {
  const [label] = rawContent.split("|");
  return label.trim();
}

/**
 * Refs 5eTools usam `nome|fonte|texto de exibição`: o 3º segmento, quando
 * presente, é o rótulo a mostrar (mesma convenção de getTaggedDisplayText
 * no fiveEToolsAdapter).
 */
function getRefDisplayLabel(rawContent: string): string {
  const parts = rawContent.split("|").map((part) => part.trim());
  return parts[2] || parts[0];
}

function pushText(nodes: RulesTextInlineNode[], text: string): void {
  if (text) {
    nodes.push({ type: "text", text });
  }
}

/** Achata o AST em texto puro (export, Foundry, busca). */
export function astToPlainText(nodes: RulesTextNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "paragraph") {
        return inlineToPlainText(node.children);
      }

      if (node.type === "list") {
        return node.items.map(inlineToPlainText).filter(Boolean).join(" ");
      }

      return tableToPlainText(node);
    })
    .filter(Boolean)
    .join(" ")
    .trim();
}

function tableToPlainText(table: Extract<RulesTextNode, { type: "table" }>): string {
  const caption = table.caption ? `${table.caption}: ` : "";
  const headerLine = table.headers.map(inlineToPlainText).filter(Boolean).join(" - ");
  const rowLines = table.rows.map((row) =>
    row.map(inlineToPlainText).filter(Boolean).join(" - "),
  );

  return `${caption}${[headerLine, ...rowLines].filter(Boolean).join("; ")}`;
}

function inlineToPlainText(nodes: RulesTextInlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return node.text;
      }

      if (node.type === "dice") {
        return node.label;
      }

      if (node.type === "internalRef") {
        return node.label;
      }

      return inlineToPlainText(node.children);
    })
    .join("");
}
