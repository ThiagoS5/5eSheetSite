import type { ReactNode } from "react";

type KnownTagType =
  | "spell"
  | "damage"
  | "condition"
  | "item"
  | "feat"
  | "skill"
  | "dice";

const TAG_PATTERN = /\{@([a-zA-Z]+)\s+([^}]+)\}/g;
const INTERACTIVE_TAGS: ReadonlySet<string> = new Set([
  "spell",
  "condition",
  "item",
  "feat",
  "skill",
]);
const PASSIVE_TAGS: ReadonlySet<string> = new Set(["damage", "dice"]);

export function parseTaggedText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TAG_PATTERN)) {
    const index = match.index ?? 0;
    const type = match[1] ?? "unknown";
    const content = match[2] ?? "";

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    nodes.push(renderTaggedToken(type.toLowerCase(), content, nodes.length));
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderTaggedToken(type: string, rawContent: string, key: number): ReactNode {
  const label = getDisplayLabel(rawContent);
  const accessibleLabel = `${getTagLabel(type)}: ${label}`;

  if (INTERACTIVE_TAGS.has(type)) {
    return (
      <button
        key={`tag-${key}`}
        type="button"
        aria-label={accessibleLabel}
        className="rounded-sm text-accent underline decoration-accent/40 underline-offset-4 outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
      >
        {label}
      </button>
    );
  }

  if (PASSIVE_TAGS.has(type)) {
    return (
      <abbr
        key={`tag-${key}`}
        aria-label={accessibleLabel}
        tabIndex={0}
        className="cursor-help rounded-sm text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
        title={accessibleLabel}
      >
        {label}
      </abbr>
    );
  }

  return (
    <abbr
      key={`tag-${key}`}
      aria-label={`unknown: ${label}`}
      tabIndex={0}
      className="cursor-help rounded-sm text-subdued no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
      title={`unknown: ${label}`}
    >
      {label}
    </abbr>
  );
}

function getDisplayLabel(rawContent: string): string {
  const [label] = rawContent.split("|");
  return label.trim();
}

function getTagLabel(type: string): KnownTagType | "unknown" {
  if (
    type === "spell" ||
    type === "damage" ||
    type === "condition" ||
    type === "item" ||
    type === "feat" ||
    type === "skill" ||
    type === "dice"
  ) {
    return type;
  }

  return "unknown";
}
