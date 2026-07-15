/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";

describe("CharacterSheetPreview", () => {
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
