/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CombatStatsCard } from "@/src/components/organisms/CombatStatsCard";
import type { CharacterSheetSummary } from "@/types/builder";

afterEach(() => {
  cleanup();
});

describe("CombatStatsCard", () => {
  it("exposes armor class formula details", () => {
    render(
      <CombatStatsCard
        summary={{
          armorClass: 18,
          armorClassBreakdown: [
            { label: "Chain Mail", value: 16 },
            { label: "Shield", value: 2 },
          ],
          hitPoints: 12,
          finalAttributes: { forca: 10, destreza: 14, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
          proficiencyBonus: 2,
        } as CharacterSheetSummary}
      />,
    );

    expect(screen.getByText("CA")).toHaveAttribute(
      "title",
      "CA 18 = 16 Chain Mail + 2 Shield",
    );
    expect(screen.getByText("16 Chain Mail + 2 Shield")).toBeInTheDocument();
  });

  it("exposes hit points formula details", () => {
    render(
      <CombatStatsCard
        summary={{
          armorClass: 18,
          armorClassBreakdown: [
            { label: "Chain Mail", value: 16 },
            { label: "Shield", value: 2 },
          ],
          hitPoints: 12,
          maxHpBreakdown: [
            { label: "Nivel 1 (d10)", value: 10 },
            { label: "CON (+2 x 1)", value: 2 },
          ],
          finalAttributes: { forca: 10, destreza: 14, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
          proficiencyBonus: 2,
        } as CharacterSheetSummary}
      />,
    );

    expect(screen.getByText("PV")).toHaveAttribute(
      "title",
      "PV 12 = 10 Nivel 1 (d10) + 2 CON (+2 x 1)",
    );
    expect(screen.getByText("10 Nivel 1 (d10) + 2 CON (+2 x 1)")).toBeInTheDocument();
  });
});
