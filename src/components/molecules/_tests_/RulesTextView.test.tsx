/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseRulesText } from "@/src/adapters/rulesTextAst";
import { RulesInlineText, RulesTextView } from "@/src/components/molecules/RulesTextView";

describe("RulesTextView", () => {
  it("renders paragraphs with highlighted refs and accessible dice", () => {
    const { container } = render(
      <RulesTextView
        nodes={parseRulesText(["Cast {@spell Fireball|XPHB} for {@damage 8d6} damage."])}
      />,
    );

    expect(screen.getByText(/Cast/)).toBeInTheDocument();
    expect(screen.getByTitle("spell: Fireball")).toHaveTextContent("Fireball");
    expect(screen.getByTitle("dice: 8d6")).toHaveTextContent("8d6");
    // Refs e dados são informativos, não interativos: nenhum tab stop falso.
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[tabindex]")).toBeNull();
  });

  it("renders 5etools lists as real <ul> lists", () => {
    render(
      <RulesTextView
        nodes={parseRulesText([{ type: "list", items: ["First.", "Second."] }])}
      />,
    );

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders tables semantically with caption and column headers", () => {
    render(
      <RulesTextView
        nodes={parseRulesText([
          {
            type: "table",
            caption: "Rage Damage",
            colLabels: ["Level", "Bonus"],
            rows: [["1st", "+2"]],
          },
        ])}
      />,
    );

    const table = screen.getByRole("table", { name: "Rage Damage" });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Level" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "+2" })).toBeInTheDocument();
  });

  it("renders nothing for an empty AST", () => {
    const { container } = render(<RulesTextView nodes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RulesInlineText", () => {
  it("renders tagged strings inline (compat with legacy parseTaggedText)", () => {
    render(
      <p>
        <RulesInlineText text="While {@condition Prone|XPHB}, roll {@dice 1d4}." />
      </p>,
    );

    expect(screen.getByTitle("condition: Prone")).toHaveTextContent("Prone");
    expect(screen.getByTitle("dice: 1d4")).toHaveTextContent("1d4");
  });

  it("degrades unknown tags to plain text", () => {
    const { container } = render(
      <p>
        <RulesInlineText text="Gain {@unknown Mystery Value}." />
      </p>,
    );

    expect(screen.getByText(/Mystery Value/)).toBeInTheDocument();
    expect(container.querySelector("button")).toBeNull();
  });
});
