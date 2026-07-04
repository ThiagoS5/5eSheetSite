/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { StartingLevelStepper } from "@/src/components/molecules/StartingLevelStepper";

function ProbeLevel() {
  const level = useCharacterStore((s) => s.level);
  return <span data-testid="level">{level}</span>;
}
function SetClass() {
  const selectClass = useCharacterStore((s) => s.selectClass);
  return <button onClick={() => selectClass("fighter-xphb")}>setclass</button>;
}

describe("StartingLevelStepper", () => {
  afterEach(cleanup);

  it("increments and decrements the starting level within 1..20", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><StartingLevelStepper /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));

    fireEvent.click(screen.getByRole("button", { name: "Increase level" }));
    expect(screen.getByTestId("level")).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: "Decrease level" }));
    expect(screen.getByTestId("level")).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Decrease level" })).toBeDisabled();
  });

  it("shows the configure button only when there are pending level choices", () => {
    render(<CharacterStoreProvider><SetClass /><StartingLevelStepper /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setclass" }));
    // level 1 fighter: weapon mastery is pending (count 3) -> button shows.
    expect(screen.getByRole("button", { name: /Configure choices/ })).toBeInTheDocument();
  });
});
