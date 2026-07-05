import type { ReactNode } from "react";
import { parseInlineText } from "@/src/adapters/rulesTextAst";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
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
    <div className="mt-2 first:mt-0">
      <Table className="text-muted-foreground">
        {node.caption ? (
          <TableCaption className="mt-2 text-left font-serif font-bold text-foreground">
            {node.caption}
          </TableCaption>
        ) : null}
        {node.headers.length > 0 ? (
          <TableHeader>
            <TableRow className="border-white/[0.12]">
              {node.headers.map((header, index) => (
                <TableHead key={index} scope="col" className="text-foreground">
                  {renderInline(header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          {node.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-white/[0.06]">
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  className="whitespace-normal p-2 align-top"
                >
                  {renderInline(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
      // Sem tabIndex: elemento informativo, não interativo — evita paradas
      // de tabulação falsas (achado de a11y do code review).
      return (
        <abbr
          key={index}
          className="cursor-help rounded-sm text-foreground no-underline"
          title={`dice: ${node.label}`}
        >
          {node.label}
        </abbr>
      );
    }

    // Refs viram <span> até o glossário de conceitos existir (Fase 3/9.4):
    // um <button> focável sem onClick é uma promessa quebrada para teclado
    // e leitores de tela.
    return (
      <span
        key={index}
        title={`${node.refType}: ${node.label}`}
        className="rounded-sm text-accent underline decoration-accent/40 underline-offset-4"
      >
        {node.label}
      </span>
    );
  });
}
