/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const setDeathSaves = vi.fn();

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (state: unknown) => unknown) =>
    selector({
      playState: {
        deathSaves: {
          successes: 1,
          failures: 0,
        },
      },
      setDeathSaves,
    }),
}));

import { DeathSavesOverlay } from "@/src/components/organisms/sheet/DeathSavesOverlay";

describe("DeathSavesOverlay", () => {
  afterEach(() => {
    cleanup();
    setDeathSaves.mockClear();
  });

  it("renders current death save state", () => {
    render(<DeathSavesOverlay />);

    expect(screen.getByText("Death Saves")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Success 1" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Failure 1" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("updates failures when a failure marker is toggled", () => {
    render(<DeathSavesOverlay />);

    fireEvent.click(screen.getByRole("button", { name: "Failure 2" }));

    expect(setDeathSaves).toHaveBeenCalledWith({
      successes: 1,
      failures: 2,
    });
  });
});
