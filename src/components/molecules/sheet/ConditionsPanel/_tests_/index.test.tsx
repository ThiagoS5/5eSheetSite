/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const toggleCondition = vi.fn();
let activeConditions: string[] = [];

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      playState: { conditions: activeConditions },
      toggleCondition,
    }),
}));

import { ConditionsPanel } from "@/src/components/molecules/sheet/ConditionsPanel";

describe("ConditionsPanel", () => {
  afterEach(() => {
    cleanup();
    toggleCondition.mockClear();
    activeConditions = [];
  });

  it("shows the empty message when no condition is active", () => {
    render(<ConditionsPanel />);

    expect(screen.getByText("No active condition.")).toBeInTheDocument();
  });

  it("expands the full condition list and toggles a condition", () => {
    render(<ConditionsPanel />);

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Poisoned" }));
    expect(toggleCondition).toHaveBeenCalledWith("Poisoned");
  });

  it("renders active conditions as removable chips", () => {
    activeConditions = ["Prone"];
    render(<ConditionsPanel />);

    const chip = screen.getByRole("button", { name: /Prone/ });
    fireEvent.click(chip);
    expect(toggleCondition).toHaveBeenCalledWith("Prone");
  });
});
