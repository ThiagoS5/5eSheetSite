/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DefensesPanel } from "@/src/components/molecules/sheet/DefensesPanel";

describe("DefensesPanel", () => {
  afterEach(cleanup);

  it("lists resistances, immunities, and vulnerabilities", () => {
    render(
      <DefensesPanel
        resistances={["Necrotic"]}
        immunities={["Poison"]}
        vulnerabilities={["Fire"]}
      />,
    );

    expect(screen.getByText("Necrotic")).toBeInTheDocument();
    expect(screen.getByText("Poison")).toBeInTheDocument();
    expect(screen.getByText("Fire")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("shows the empty message when the character has no defenses", () => {
    render(<DefensesPanel resistances={[]} immunities={[]} vulnerabilities={[]} />);

    expect(screen.getByText("No special resistance.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
