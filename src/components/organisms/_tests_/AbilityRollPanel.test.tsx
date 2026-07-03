/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AbilityRollPanel } from "@/src/components/organisms/AbilityRollPanel";
import type { AbilityRoll } from "@/rules/abilityRollRules";

const fixedTotals = [15, 14, 13, 12, 10, 8];

function fixedRollFn(): AbilityRoll[] {
  return fixedTotals.map((total) => ({
    dice: [total > 4 ? 4 : 1, 5, 6, 2] as [number, number, number, number],
    dropped: 2,
    total,
  }));
}

describe("AbilityRollPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("rolls and shows six totals with the lowest die struck through", () => {
    render(<AbilityRollPanel onApply={vi.fn()} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Rolar 4d6" }));

    for (const total of fixedTotals) {
      expect(screen.getAllByText(String(total)).length).toBeGreaterThan(0);
    }

    expect(screen.getAllByText("descartado: 2").length).toBe(6);
  });

  it("assigns all six rolls to attributes and calls onApply with the mapping", () => {
    const onApply = vi.fn();
    render(<AbilityRollPanel onApply={onApply} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Rolar 4d6" }));

    fireEvent.change(screen.getByLabelText("Valor para Forca"), {
      target: { value: "15" },
    });
    fireEvent.change(screen.getByLabelText("Valor para Destreza"), {
      target: { value: "14" },
    });
    fireEvent.change(screen.getByLabelText("Valor para Constituicao"), {
      target: { value: "13" },
    });
    fireEvent.change(screen.getByLabelText("Valor para Inteligencia"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText("Valor para Sabedoria"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("Valor para Carisma"), {
      target: { value: "8" },
    });

    const applyButton = screen.getByRole("button", { name: "Aplicar" });
    expect(applyButton).toBeEnabled();

    fireEvent.click(applyButton);

    expect(onApply).toHaveBeenCalledWith({
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 12,
      sabedoria: 10,
      carisma: 8,
    });
  });

  it("does not offer a total already consumed by another attribute", () => {
    render(<AbilityRollPanel onApply={vi.fn()} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Rolar 4d6" }));

    fireEvent.change(screen.getByLabelText("Valor para Forca"), {
      target: { value: "15" },
    });

    const destrezaSelect = screen.getByLabelText(
      "Valor para Destreza",
    ) as HTMLSelectElement;
    const optionValues = Array.from(destrezaSelect.options).map(
      (option) => option.value,
    );

    expect(optionValues).not.toContain("15");
  });

  it("keeps Aplicar disabled until all six attributes are assigned", () => {
    render(<AbilityRollPanel onApply={vi.fn()} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Rolar 4d6" }));

    expect(screen.getByRole("button", { name: "Aplicar" })).toBeDisabled();
  });
});
