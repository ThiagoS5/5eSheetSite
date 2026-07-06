/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import type { CharacterSheetSummary } from "@/types/builder";

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
        onExportFoundry={() => {}}
        onExportCanonical={() => {}}
        onExportPdf={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("calls the matching export action when an export button is pressed", () => {
    const onExportFoundry = vi.fn();
    const onExportCanonical = vi.fn();
    const onExportPdf = vi.fn();
    render(
      <SheetHero
        summary={summary}
        onExportFoundry={onExportFoundry}
        onExportCanonical={onExportCanonical}
        onExportPdf={onExportPdf}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Foundry JSON/ }));
    fireEvent.click(screen.getByRole("button", { name: /Export JSON/ }));
    fireEvent.click(screen.getByRole("button", { name: /Printable PDF/ }));

    expect(onExportFoundry).toHaveBeenCalledTimes(1);
    expect(onExportCanonical).toHaveBeenCalledTimes(1);
    expect(onExportPdf).toHaveBeenCalledTimes(1);
  });
});
