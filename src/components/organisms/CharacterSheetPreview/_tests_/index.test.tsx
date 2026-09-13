/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";

describe("CharacterSheetPreview", () => {
  it("shows the derived Alert initiative and source-aware HP explanation", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().selectSpecies("dwarf-xphb");
    store.getState().selectBackground("criminal-xphb");
    store.getState().setDestreza(14);
    render(<CharacterStoreProvider store={store}><CharacterSheetPreview /></CharacterStoreProvider>);
    const initiative = screen.getByText("Initiative").parentElement!;
    expect(within(initiative).getByText("+4")).toBeInTheDocument();
    expect(screen.getByText("Dwarven Toughness (+1 × 1)")).toBeInTheDocument();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders the live sheet without triggering an external-store render loop", () => {
    render(
      <CharacterStoreProvider>
        <CharacterSheetPreview />
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("complementary", { name: "Unnamed Hero" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Ability Scores" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Pending Items" })).toBeInTheDocument();
  });
});
