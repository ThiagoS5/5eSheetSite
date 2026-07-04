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

describe("LevelUpButton", () => {
  afterEach(cleanup);

  it("bumps the level and opens the flow", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><LevelUpButton /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));
    expect(screen.getByTestId("level")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "Level Up" }));
    expect(screen.getByTestId("level")).toHaveTextContent("2");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
