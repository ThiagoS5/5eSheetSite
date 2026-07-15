/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpButton } from "@/src/components/molecules/LevelUpButton";

function ProbeLevel() {
  const level = useCharacterStore((s) => s.level);
  return <span data-testid="level">{level}</span>;
}
function SetClass() {
  const selectClass = useCharacterStore((s) => s.selectClass);
  return <button onClick={() => selectClass("fighter-xphb")}>setclass</button>;
}
function ResolveWeaponMastery() {
  const setClassFeatureChoice = useCharacterStore((s) => s.setClassFeatureChoice);
  // Resolve the level-1 Weapon Mastery choice (resolution checks length only),
  // so a level-2 level-up flow has Hit Points as its single step.
  return (
    <button onClick={() => setClassFeatureChoice("weapon-mastery", ["a", "b", "c"])}>
      resolve-wm
    </button>
  );
}

describe("LevelUpButton", () => {
  afterEach(() => {
    cleanup();
    // O store persiste em sessionStorage; sem limpar, o nível vaza entre testes.
    sessionStorage.clear();
    localStorage.clear();
  });

  it("bumps the level and opens the flow", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><LevelUpButton /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));
    expect(screen.getByTestId("level")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "Level Up" }));
    expect(screen.getByTestId("level")).toHaveTextContent("2");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("reverts the level when the flow is cancelled with Escape", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><LevelUpButton /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));

    fireEvent.click(screen.getByRole("button", { name: "Level Up" }));
    expect(screen.getByTestId("level")).toHaveTextContent("2");

    // Escape closes the Radix dialog -> onOpenChange(false) -> onClose(false).
    fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });

    expect(screen.getByTestId("level")).toHaveTextContent("1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not stack levels across repeated open/cancel cycles", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><LevelUpButton /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));

    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Level Up" }));
      fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    }

    expect(screen.getByTestId("level")).toHaveTextContent("1");
  });

  it("keeps the incremented level when the flow is confirmed with Finish", () => {
    render(
      <CharacterStoreProvider>
        <SetClass />
        <ResolveWeaponMastery />
        <ProbeLevel />
        <LevelUpButton />
      </CharacterStoreProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));
    fireEvent.click(screen.getByRole("button", { name: "resolve-wm" }));

    // Level 1 -> 2: with Weapon Mastery resolved, Hit Points is the only step.
    fireEvent.click(screen.getByRole("button", { name: "Level Up" }));
    expect(screen.getByTestId("level")).toHaveTextContent("2");

    // Resolve Hit Points, then Finish to commit the level-up.
    fireEvent.click(screen.getByRole("button", { name: /use average/i }));
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    expect(screen.getByTestId("level")).toHaveTextContent("2");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
