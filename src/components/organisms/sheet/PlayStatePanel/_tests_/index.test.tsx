/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_COIN_POUCH } from "@/src/types/characterBuild";
import type { CharacterSheetSummary } from "@/src/types/builder";

const applyDamage = vi.fn();
const heal = vi.fn();
const setTempHp = vi.fn();
const shortRest = vi.fn();
const longRest = vi.fn();
const toggleInspiration = vi.fn();
const setOverride = vi.fn();
const setResourceUseCount = vi.fn();

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (state: unknown) => unknown) =>
    selector({
      applyDamage,
      heal,
      setTempHp,
      shortRest,
      longRest,
      toggleInspiration,
      setOverride,
      setResourceUseCount,
      playState: {
        currentHp: 20,
        tempHp: 0,
        hitDiceSpent: 0,
        inspiration: false,
        resourceUses: {},
        conditions: [],
        deathSaves: { successes: 0, failures: 0 },
        overrides: {},
        campaignLog: [],
      },
    }),
}));

import { PlayStatePanel } from "@/src/components/organisms/sheet/PlayStatePanel";

const summary = {
  level: 3,
  currentHp: 20,
  maxHp: 24,
  tempHp: 0,
  armorClass: 15,
  classFeatures: [
    {
      name: "Arcane Recovery",
      description: "You regain power when you finish a short rest.",
    },
  ],
  money: EMPTY_COIN_POUCH,
} as CharacterSheetSummary;

describe("PlayStatePanel", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders hit point controls and applies the entered amount", () => {
    render(<PlayStatePanel summary={summary} />);

    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Damage" }));
    fireEvent.click(screen.getByRole("button", { name: "Heal" }));
    fireEvent.click(screen.getByRole("button", { name: "Temp" }));

    expect(applyDamage).toHaveBeenCalledWith(5);
    expect(heal).toHaveBeenCalledWith(5);
    expect(setTempHp).toHaveBeenCalledWith(5);
  });

  it("tracks rest actions and feature resource use", () => {
    render(<PlayStatePanel summary={summary} />);

    fireEvent.change(screen.getByLabelText("Hit dice"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Short Rest" }));
    fireEvent.click(screen.getByRole("button", { name: "Long Rest" }));
    fireEvent.click(screen.getByLabelText(/Arcane Recovery/i));

    expect(shortRest).toHaveBeenCalledWith({ hitDiceToSpend: 2 });
    expect(longRest).toHaveBeenCalledTimes(1);
    expect(setResourceUseCount).toHaveBeenCalledWith(
      "arcane-recovery",
      1,
      1,
      "shortRest",
    );
  });
});
