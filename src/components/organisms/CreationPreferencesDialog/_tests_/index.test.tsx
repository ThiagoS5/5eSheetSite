/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CreationPreferencesDialog } from "@/src/components/organisms/CreationPreferencesDialog";
import {
  readGlobalPreferences,
  writeGlobalPreferences,
} from "@/src/services/preferencesService";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";

describe("CreationPreferencesDialog", () => {
  it("returns keyboard focus to the external opener after Escape", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Open preferences</button><CreationPreferencesDialog open={open} onClose={() => setOpen(false)} /></>;
    }
    render(<CharacterStoreProvider><Harness /></CharacterStoreProvider>);
    const opener = screen.getByRole("button", { name: "Open preferences" });
    opener.focus();
    fireEvent.click(opener);
    screen.getByRole("searchbox", { name: "Search source books" }).focus();
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it("searches books by content without changing hidden source selections", () => {
    const store = createCharacterStore();
    store.getState().setCreationPreferences({ activeSources: ["XPHB", "EFA"], progressionMode: "xp", choiceLimits: "rules" });
    render(<CharacterStoreProvider store={store}><CreationPreferencesDialog open onClose={() => {}} /></CharacterStoreProvider>);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search source books" }), { target: { value: "Eberron: Forge" } });
    const checkbox = screen.getByRole("checkbox", { name: "EFA (Eberron: Forge of the Artificer)" });
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAccessibleDescription(expect.stringContaining("1 class"));
    expect(screen.queryByRole("checkbox", { name: "XPHB (Player's Handbook 2024)" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(store.getState().creationPreferences?.activeSources).toEqual(["XPHB", "EFA"]);
  });

  it("provides a recoverable empty search and cancels unsaved source edits", () => {
    const store = createCharacterStore();
    store.getState().setCreationPreferences({ activeSources: ["XPHB", "EFA"], progressionMode: "xp", choiceLimits: "rules" });
    render(<CharacterStoreProvider store={store}><CreationPreferencesDialog open onClose={() => {}} /></CharacterStoreProvider>);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search source books" }), { target: { value: "no-such-book" } });
    expect(screen.getByText("No books match your search.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    fireEvent.click(screen.getByRole("button", { name: "Deselect optional sources" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(store.getState().creationPreferences?.activeSources).toEqual(["XPHB", "EFA"]);
  });
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
      screen.getByRole("checkbox", { name: "PHB (Player's Handbook)" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("checkbox", { name: "PHB (Player's Handbook)" }),
    ).not.toBeChecked();
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
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone", choiceLimits: "rules" },
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
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "milestone", choiceLimits: "rules" },
    });

    const store = createCharacterStore();
    store.getState().setCreationPreferences({ activeSources: ["XPHB"], progressionMode: "xp", choiceLimits: "rules" });

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
    expect(
      screen.getByRole("checkbox", { name: "PHB (Player's Handbook)" }),
    ).not.toBeChecked();
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
      creationDefaults: { activeSources: ["XPHB"], progressionMode: "xp", choiceLimits: "rules" },
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

  it("persists the per-character flexible choices switch", () => {
    function ChoiceLimitsProbe() {
      const choiceLimits = useCharacterStore(
        (state) => state.creationPreferences?.choiceLimits ?? "rules",
      );
      return <span data-testid="choice-limits">{choiceLimits}</span>;
    }

    render(
      <CharacterStoreProvider>
        <ChoiceLimitsProbe />
        <CreationPreferencesDialog open onClose={() => {}} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("switch", { name: "Flexible choices" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByTestId("choice-limits")).toHaveTextContent("flexible");
  });
});
