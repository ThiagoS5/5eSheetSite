/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import type { CharacterSheetSummary } from "@/types/builder";

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Subir de Nível</button>,
}));

const summary = {
  name: "Thalindra", level: 5, className: "Mago", speciesName: "Alta Elfa", backgroundName: "Sábia",
  armorClass: 13, initiative: 3, speedMeters: 9, currentHp: 27, maxHp: 27, proficiencyBonus: 3,
  attributes: [{ key: "forca", label: "Força", abbr: "FOR", score: 8, modifier: -1 }],
} as unknown as CharacterSheetSummary;

describe("SheetHero", () => {
  afterEach(cleanup);

  it("renders identity, CA and HP", () => {
    render(<SheetHero summary={summary} onExport={() => {}} />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("calls onExport when Exportar is pressed", () => {
    const onExport = vi.fn();
    render(<SheetHero summary={summary} onExport={onExport} />);
    fireEvent.click(screen.getByRole("button", { name: /Exportar/ }));
    expect(onExport).toHaveBeenCalled();
  });
});
