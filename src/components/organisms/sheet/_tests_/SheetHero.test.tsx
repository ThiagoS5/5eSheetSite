/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import type { CharacterSheetSummary } from "@/types/builder";

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Level Up</button>,
}));

const summary = {
  name: "Thalindra", level: 5, className: "Wizard", speciesName: "High Elf", backgroundName: "Sage",
  armorClass: 13, initiative: 3, speedFeet: 30, currentHp: 27, maxHp: 27, proficiencyBonus: 3,
  attributes: [{ key: "forca", label: "Strength", abbr: "STR", score: 8, modifier: -1 }],
} as unknown as CharacterSheetSummary;

describe("SheetHero", () => {
  afterEach(cleanup);

  it("renders identity, AC and HP", () => {
    render(<SheetHero summary={summary} onExport={() => {}} onExportCanonical={() => {}} />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("calls onExport when Export is pressed", () => {
    const onExport = vi.fn();
    render(<SheetHero summary={summary} onExport={onExport} onExportCanonical={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /^Export$/ }));
    expect(onExport).toHaveBeenCalled();
  });

  it("fires onExportCanonical from the Export JSON button", () => {
    const onExportCanonical = vi.fn();
    render(<SheetHero summary={summary} onExport={() => {}} onExportCanonical={onExportCanonical} />);
    fireEvent.click(screen.getByRole("button", { name: /export json/i }));
    expect(onExportCanonical).toHaveBeenCalledTimes(1);
  });
});
