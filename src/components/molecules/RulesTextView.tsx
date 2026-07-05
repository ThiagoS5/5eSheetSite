import type { ReactNode } from "react";
import { parseInlineText } from "@/src/adapters/rulesTextAst";
import type { RulesTextInlineNode, RulesTextNode } from "@/types/rulesText";

interface RulesTextViewProps {
  nodes: RulesTextNode[];
  className?: string;
}

/**
 * Renderer React único do AST de texto de regras (MANIFESTO/Fase 7):
 * parágrafos reais, listas <ul>, tabelas semânticas com caption/scope.
 */
export function RulesTextView({ nodes, className }: RulesTextViewProps) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {nodes.map((node, index) => (
        <BlockNode key={index} node={node} />
      ))}
    </div>
  );
}

/**
 * Variante inline para strings com tags 5eTools em contextos sem blocos
 * (tooltips, resumos de uma linha).
 */
export function RulesInlineText({ text }: { text: string }) {
  return <>{renderInline(parseInlineText(text))}</>;
}

function BlockNode({ node }: { node: RulesTextNode }) {
  if (node.type === "paragraph") {
    return (
      <p className="mt-2 min-w-0 break-words text-sm leading-relaxed text-muted-foreground first:mt-0">
        {renderInline(node.children)}
      </p>
    );
  }

  if (node.type === "list") {
    return (
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground first:mt-0">
        {node.items.map((item, index) => (
          <li key={index} className="min-w-0 break-words">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-2 overflow-x-auto first:mt-0">
      <table className="w-full border-collapse text-sm text-muted-foreground">
        {node.caption ? (
          <caption className="mb-1 text-left font-serif text-sm font-bold text-foreground">
            {node.caption}
          </caption>
        ) : null}
        {node.headers.length > 0 ? (
          <thead>
            <tr>
              {node.headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="border-b border-white/[0.12] px-2 py-1 text-left font-medium text-foreground"
                >
                  {renderInline(header)}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {node.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/[0.06] last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-1 align-top">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderInline(nodes: RulesTextInlineNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    if (node.type === "text") {
      return node.text;
    }

    if (node.type === "bold") {
      return (
        <strong key={index} className="font-bold text-foreground">
          {renderInline(node.children)}
        </strong>
      );
    }

    if (node.type === "italic") {
      return <em key={index}>{renderInline(node.children)}</em>;
    }

    if (node.type === "dice") {
      return (
        <abbr
          key={index}
          aria-label={`dice: ${node.label}`}
          tabIndex={0}
          className="cursor-help rounded-sm text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
          title={`dice: ${node.label}`}
        >
          {node.label}
        </abbr>
      );
    }

    return (
      <button
        key={index}
        type="button"
        aria-label={`${node.refType}: ${node.label}`}
        className="rounded-sm text-accent underline decoration-accent/40 underline-offset-4 outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
      >
        {node.label}
      </button>
    );
  });
}
