/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { SavingThrowsGrid } from "@/src/components/molecules/sheet/SavingThrowsGrid";
import type { SheetSavingThrow } from "@/src/types/builder";

const saves: SheetSavingThrow[] = [
  { attributeKey: "forca", label: "Strength", abbr: "STR", modifier: -1, isProficient: false },
  { attributeKey: "inteligencia", label: "Intelligence", abbr: "INT", modifier: 7, isProficient: true },
];

describe("SavingThrowsGrid", () => {
  afterEach(cleanup);

  it("renders one cell per saving throw with signed modifier", () => {
    render(<SavingThrowsGrid savingThrows={saves} />);
    expect(screen.getByText("STR")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
  });

  it("marks proficient saves for assistive tech", () => {
    render(<SavingThrowsGrid savingThrows={saves} />);
    expect(screen.getByText("Proficient")).toBeInTheDocument();
  });
});
