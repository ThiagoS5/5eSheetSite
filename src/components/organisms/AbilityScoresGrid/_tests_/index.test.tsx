/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AbilityScoresGrid } from "@/src/components/organisms/AbilityScoresGrid";
import type { CharacterSheetSummary } from "@/src/types/builder";
import { EMPTY_COIN_POUCH } from "@/src/types/characterBuild";

const summary = {
  finalAttributes: {
    forca: 8,
    destreza: 14,
    constituicao: 12,
    inteligencia: 16,
    sabedoria: 10,
    carisma: 12,
  },
  money: EMPTY_COIN_POUCH,
} as CharacterSheetSummary;

describe("AbilityScoresGrid", () => {
  afterEach(cleanup);

  it("renders all six ability scores with signed modifiers", () => {
    render(<AbilityScoresGrid summary={summary} />);

    expect(screen.getByRole("heading", { name: "Ability Scores" })).toBeInTheDocument();
    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});
