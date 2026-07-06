/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PersonalDetailsEditor } from "@/src/components/organisms/PersonalDetailsEditor";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";

describe("PersonalDetailsEditor portrait gallery", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("selects a portrait and persists portraitId in the store", async () => {
    const user = userEvent.setup();
    const store = createCharacterStore();
    render(
      <CharacterStoreProvider store={store}>
        <PersonalDetailsEditor />
      </CharacterStoreProvider>,
    );

    const option = screen.getByRole("radio", {
      name: /armored knight silhouette/i,
    });
    await user.click(option);

    expect(option).toHaveAttribute("aria-checked", "true");
    expect(store.getState().description.portraitId).toBe(
      "portrait-ember-knight",
    );
  });

  it("clicking the selected portrait clears the selection", async () => {
    const user = userEvent.setup();
    const store = createCharacterStore();
    render(
      <CharacterStoreProvider store={store}>
        <PersonalDetailsEditor />
      </CharacterStoreProvider>,
    );

    const option = screen.getByRole("radio", {
      name: /armored knight silhouette/i,
    });
    await user.click(option);
    await user.click(option);

    expect(store.getState().description.portraitId).toBe("");
  });
});
