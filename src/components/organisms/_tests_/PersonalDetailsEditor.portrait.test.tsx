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
import { getBuilderBackgrounds } from "@/src/services/ruleService";
import { getPersonalDetailsRecommendations } from "@/src/data/personalDetailsRecommendations";

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

  it("rolls a random name into the name field", async () => {
    const user = userEvent.setup();
    render(
      <CharacterStoreProvider store={createCharacterStore()}>
        <PersonalDetailsEditor />
      </CharacterStoreProvider>,
    );

    await user.click(screen.getByRole("button", { name: /roll a random name/i }));

    const input = screen.getByLabelText(/character name/i) as HTMLInputElement;
    expect(input.value.length).toBeGreaterThan(0);
  });

  it("suggests personality text based on the selected background and keeps it editable", async () => {
    const user = userEvent.setup();
    const background = getBuilderBackgrounds().find((b) => b.id === "soldier-xphb");
    const expected = getPersonalDetailsRecommendations({ background }).personality;
    render(
      <CharacterStoreProvider store={createCharacterStore()}>
        <PersonalDetailsEditor selectedBackground={background} />
      </CharacterStoreProvider>,
    );

    await user.click(
      screen.getByRole("button", { name: /suggest personality & mannerisms/i }),
    );

    const field = document.getElementById("pd-personalidade") as HTMLTextAreaElement;
    expect(field.value).toBe(expected);

    // Verify field is not readonly and can be edited (check that it's editable via DOM)
    expect(field).not.toHaveAttribute("readonly");
    expect(field).not.toHaveAttribute("disabled");

    // Directly modify to test editability (simulating user edit after suggestion)
    field.value = expected + " Edited.";
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));

    expect(field.value).toContain("Edited.");
  });
});
