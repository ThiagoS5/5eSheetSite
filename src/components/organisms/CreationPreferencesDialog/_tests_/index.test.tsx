/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CreationPreferencesDialog } from "@/src/components/organisms/CreationPreferencesDialog";
import {
  readGlobalPreferences,
  writeGlobalPreferences,
} from "@/src/services/preferencesService";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";

describe("CreationPreferencesDialog", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders the Active Sources and Progression sections", () => {
    render(
      <CharacterStoreProvider>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("group", { name: "Active sources" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Progression" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "XPHB (Player's Handbook 2024)" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("checkbox", {
        name: "EFA (Eberron: Forge of the Artificer)",
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Select all sources" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Deselect optional sources" }),
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

    fireEvent.click(screen.getByRole("radio", { name: "Milestone" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

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

    expect(screen.getByRole("radio", { name: "Milestone" })).toBeChecked();
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

  it("deselects optional sources while keeping XPHB locked", () => {
    render(
      <CharacterStoreProvider>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deselect optional sources" }));

    expect(
      screen.getByRole("checkbox", { name: "XPHB (Player's Handbook 2024)" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "EFA (Eberron: Forge of the Artificer)",
      }),
    ).not.toBeChecked();
  });

  it("selects all optional sources after they were cleared", () => {
    render(
      <CharacterStoreProvider>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deselect optional sources" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all sources" }));

    expect(
      screen.getByRole("checkbox", {
        name: "EFA (Eberron: Forge of the Artificer)",
      }),
    ).toBeChecked();
  });

  it("saves only the selected optional sources plus locked XPHB", () => {
    function SourcesProbe() {
      const activeSources = useCharacterStore(
        (state) => state.creationPreferences?.activeSources ?? [],
      );
      return <span data-testid="sources">{activeSources.join("|")}</span>;
    }

    render(
      <CharacterStoreProvider>
        <SourcesProbe />
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deselect optional sources" }));
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "EFA (Eberron: Forge of the Artificer)",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByTestId("sources")).toHaveTextContent("XPHB|EFA");
  });

  it("preserves the saved beginner-mode preference when saving creation preferences", () => {
    writeGlobalPreferences({
      beginnerMode: true,
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "xp" },
    });

    render(
      <CharacterStoreProvider>
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Deselect optional sources" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(readGlobalPreferences().beginnerMode).toBe(true);
  });
});
