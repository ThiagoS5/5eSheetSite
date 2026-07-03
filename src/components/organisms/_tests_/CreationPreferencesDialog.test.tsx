/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CreationPreferencesDialog } from "@/src/components/organisms/CreationPreferencesDialog";
import { writeGlobalPreferences } from "@/src/services/preferencesService";
import { createCharacterStore } from "@/src/store/createCharacterStore";
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

  it("seeds from global defaults when the character has no per-character prefs", () => {
    writeGlobalPreferences({
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
    });

    render(
      <CharacterStoreProvider>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByRole("radio", { name: "Marco" })).toBeChecked();
  });

  it("prefers per-character prefs over global defaults", () => {
    writeGlobalPreferences({
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone" },
    });

    const store = createCharacterStore();
    store.getState().setCreationPreferences({ activeSources: ["XPHB"], progressionMode: "xp" });

    render(
      <CharacterStoreProvider store={store}>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByRole("radio", { name: "XP" })).toBeChecked();
  });
});
