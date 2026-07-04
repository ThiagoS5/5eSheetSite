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

    fireEvent.click(screen.getByRole("button", { name: "Roll 4d6" }));

    for (const total of fixedTotals) {
      expect(screen.getAllByText(String(total)).length).toBeGreaterThan(0);
    }

    expect(screen.getAllByText((_, element) => element?.textContent === "dropped: 2").length).toBe(6);
  });

  it("assigns all six rolls to attributes and calls onApply with the mapping", () => {
    const onApply = vi.fn();
    render(<AbilityRollPanel onApply={onApply} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Roll 4d6" }));

    fireEvent.change(screen.getByLabelText("Value for Strength"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Value for Dexterity"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Value for Constitution"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Value for Intelligence"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Value for Wisdom"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText("Value for Charisma"), {
      target: { value: "5" },
    });

    const applyButton = screen.getByRole("button", { name: "Apply" });
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

  it("does not offer a roll already consumed by another attribute", () => {
    render(<AbilityRollPanel onApply={vi.fn()} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Roll 4d6" }));

    fireEvent.change(screen.getByLabelText("Value for Strength"), {
      target: { value: "0" },
    });

    const destrezaSelect = screen.getByLabelText(
      "Value for Dexterity",
    ) as HTMLSelectElement;
    const optionValues = Array.from(destrezaSelect.options).map(
      (option) => option.value,
    );

    expect(optionValues).not.toContain("0");
  });

  it("keeps Apply disabled until all six attributes are assigned", () => {
    render(<AbilityRollPanel onApply={vi.fn()} rollFn={fixedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Roll 4d6" }));

    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });

  it("allows assigning both rolls when two totals tie, without locking either out", () => {
    const tiedTotals = [13, 13, 12, 11, 10, 8];

    function tiedRollFn(): AbilityRoll[] {
      return tiedTotals.map((total) => ({
        dice: [total > 4 ? 4 : 1, 5, 6, 2] as [number, number, number, number],
        dropped: 2,
        total,
      }));
    }

    const onApply = vi.fn();
    render(<AbilityRollPanel onApply={onApply} rollFn={tiedRollFn} />);

    fireEvent.click(screen.getByRole("button", { name: "Roll 4d6" }));

    const forcaSelect = screen.getByLabelText("Value for Strength") as HTMLSelectElement;
    const destrezaSelect = screen.getByLabelText(
      "Value for Dexterity",
    ) as HTMLSelectElement;

    // Both rolls (index 0 and 1) with total 13 must be independently offered.
    const forcaOptionValues = Array.from(forcaSelect.options).map(
      (option) => option.value,
    );
    expect(forcaOptionValues).toEqual(expect.arrayContaining(["0", "1"]));

    // Assign the first "13" (index 0) to Forca.
    fireEvent.change(forcaSelect, { target: { value: "0" } });

    // The second "13" (index 1) must still be assignable to Destreza.
    const destrezaOptionValues = Array.from(destrezaSelect.options).map(
      (option) => option.value,
    );
    expect(destrezaOptionValues).toContain("1");
    expect(destrezaOptionValues).not.toContain("0");

    fireEvent.change(destrezaSelect, { target: { value: "1" } });

    fireEvent.change(screen.getByLabelText("Value for Constitution"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Value for Intelligence"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Value for Wisdom"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText("Value for Charisma"), {
      target: { value: "5" },
    });

    const applyButton = screen.getByRole("button", { name: "Apply" });
    expect(applyButton).toBeEnabled();

    fireEvent.click(applyButton);

    expect(onApply).toHaveBeenCalledWith({
      forca: 13,
      destreza: 13,
      constituicao: 12,
      inteligencia: 11,
      sabedoria: 10,
      carisma: 8,
    });
  });
});
