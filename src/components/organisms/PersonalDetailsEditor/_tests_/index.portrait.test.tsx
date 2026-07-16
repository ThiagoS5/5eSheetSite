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
import { getBuilderBackgrounds, getBuilderSpecies } from "@/src/services/ruleService";
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

    // Test real user interaction by typing into the field
    await user.click(field);
    await user.keyboard("End");
    await user.type(field, " Edited.");
    expect(field.value).toContain("Edited.");
  });

  it("cycles through contextual personality suggestions", async () => {
    const user = userEvent.setup();
    const species = getBuilderSpecies().find((entry) => entry.id === "elf-xphb");
    const background = getBuilderBackgrounds().find((b) => b.id === "acolyte-xphb");
    const recommendations = getPersonalDetailsRecommendations({
      species,
      background,
      alignment: "Lawful Good",
    });
    const store = createCharacterStore();
    render(
      <CharacterStoreProvider store={store}>
        <PersonalDetailsEditor selectedSpecies={species} selectedBackground={background} />
      </CharacterStoreProvider>,
    );

    await user.selectOptions(screen.getByLabelText(/alignment/i), "Lawful Good");
    await user.click(
      screen.getByRole("button", { name: /suggest personality & mannerisms/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /suggest personality & mannerisms/i }),
    );

    const field = document.getElementById("pd-personalidade") as HTMLTextAreaElement;
    expect(field.value).toBe(recommendations.suggestions.personalidade[1]);
    expect(field.value.toLowerCase()).not.toMatch(/sleep|sleepwalk|sleepwalking/);
  });

  it("persists the Backstory field to notes-backstory history", async () => {
    const user = userEvent.setup();
    const store = createCharacterStore();
    render(
      <CharacterStoreProvider store={store}>
        <PersonalDetailsEditor />
      </CharacterStoreProvider>,
    );

    const backstory = screen.getByLabelText("Backstory");
    await user.type(backstory, "Raised on caravan roads.");
    await user.tab();

    expect(store.getState().description.historia).toBe("Raised on caravan roads.");
    expect(store.getState().description.tracos).toBe("");
  });
});
