/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SensesPanel } from "@/src/components/molecules/sheet/SensesPanel";

describe("SensesPanel", () => {
  afterEach(cleanup);

  it("renders senses with range, languages, and tool proficiencies", () => {
    render(
      <SensesPanel
        senses={[{ name: "Darkvision", rangeFeet: 60 }]}
        languages={["Common", "Elvish"]}
        toolProficiencies={["Thieves' Tools"]}
      />,
    );

    expect(screen.getByText("Darkvision")).toBeInTheDocument();
    expect(screen.getByText("60 ft.")).toBeInTheDocument();
    expect(screen.getByText("Common, Elvish")).toBeInTheDocument();
    expect(screen.getByText("Thieves' Tools")).toBeInTheDocument();
  });

  it("omits the range when a sense has none", () => {
    render(<SensesPanel senses={[{ name: "Tremorsense" }]} languages={[]} />);

    expect(screen.getByText("Tremorsense")).toBeInTheDocument();
    expect(screen.queryByText(/ft\./)).not.toBeInTheDocument();
  });

  it("renders nothing when there are no senses, languages, or tools", () => {
    const { container } = render(<SensesPanel senses={[]} languages={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("hides the sections that have no content", () => {
    render(<SensesPanel senses={[]} languages={["Common"]} />);

    expect(screen.queryByText("Senses")).not.toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.queryByText("Tool Proficiencies")).not.toBeInTheDocument();
  });
});
