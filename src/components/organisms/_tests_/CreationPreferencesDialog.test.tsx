/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CreationPreferencesDialog } from "@/src/components/organisms/CreationPreferencesDialog";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";

describe("CreationPreferencesDialog", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders the Fontes ativas and Progressao sections", () => {
    render(
      <CharacterStoreProvider>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("group", { name: "Fontes ativas" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Progressão" }),
    ).toBeInTheDocument();
  });

  it("saves progressionMode milestone via setCreationPreferences on Save", () => {
    function StateProbe() {
      const creationPreferences = useCharacterStore((s) => s.creationPreferences);
      return <span data-testid="mode">{creationPreferences?.progressionMode ?? "xp"}</span>;
    }
    render(
      <CharacterStoreProvider>
        <StateProbe />
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Marco" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByTestId("mode")).toHaveTextContent("milestone");
  });
});
