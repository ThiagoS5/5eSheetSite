/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { AttributeGrid } from "@/src/components/molecules/sheet/AttributeGrid";
import type { SheetAttribute } from "@/types/builder";

const attrs: SheetAttribute[] = [
  { key: "forca", label: "Força", abbr: "FOR", score: 8, modifier: -1 },
  { key: "inteligencia", label: "Inteligência", abbr: "INT", score: 18, modifier: 4 },
];

describe("AttributeGrid", () => {
  afterEach(cleanup);

  it("renders each attribute's abbr, signed modifier and score", () => {
    render(<AttributeGrid attributes={attrs} />);
    expect(screen.getByText("FOR")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("+4")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });
});
