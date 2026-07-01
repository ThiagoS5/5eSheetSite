/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { SavingThrowsGrid } from "@/src/components/molecules/sheet/SavingThrowsGrid";
import type { SheetSavingThrow } from "@/types/builder";

const saves: SheetSavingThrow[] = [
  { attributeKey: "forca", label: "Força", abbr: "FOR", modifier: -1, isProficient: false },
  { attributeKey: "inteligencia", label: "Inteligência", abbr: "INT", modifier: 7, isProficient: true },
];

describe("SavingThrowsGrid", () => {
  afterEach(cleanup);

  it("renders one cell per saving throw with signed modifier", () => {
    render(<SavingThrowsGrid savingThrows={saves} />);
    expect(screen.getByText("FOR")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
  });

  it("marks proficient saves for assistive tech", () => {
    render(<SavingThrowsGrid savingThrows={saves} />);
    // Proficient INT cell exposes an accessible "Proficiente" label; FOR does not.
    expect(screen.getByText("Proficiente")).toBeInTheDocument();
  });
});
