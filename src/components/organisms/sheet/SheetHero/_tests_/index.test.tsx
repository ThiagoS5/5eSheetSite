/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import type { CharacterSheetSummary } from "@/src/types/builder";

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Level Up</button>,
}));

const summary = {
  name: "Thalindra",
  level: 5,
  className: "Wizard",
  speciesName: "High Elf",
  backgroundName: "Sage",
  ruleset: "2024",
  armorClass: 13,
  initiative: 3,
  speedFeet: 30,
  currentHp: 27,
  maxHp: 27,
  proficiencyBonus: 3,
  attributes: [{ key: "forca", label: "Strength", abbr: "STR", score: 8, modifier: -1 }],
} as unknown as CharacterSheetSummary;

describe("SheetHero", () => {
  afterEach(cleanup);

  it("renders identity, AC and HP", () => {
    render(
      <SheetHero
        summary={summary}
        onExportForgeFate={() => {}}
        onExportFoundry={() => {}}
        onExportPdf={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("calls the matching export action when an export button is pressed", () => {
    const onExportForgeFate = vi.fn();
    const onExportFoundry = vi.fn();
    const onExportPdf = vi.fn();
    render(
      <SheetHero
        summary={summary}
        onExportForgeFate={onExportForgeFate}
        onExportFoundry={onExportFoundry}
        onExportPdf={onExportPdf}
      />,
    );

    expect(screen.queryByRole("button", { name: /^Export JSON$/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export Forge & Fate JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "Export Foundry VTT JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));

    expect(onExportForgeFate).toHaveBeenCalledTimes(1);
    expect(onExportFoundry).toHaveBeenCalledTimes(1);
    expect(onExportPdf).toHaveBeenCalledTimes(1);
  });
});
