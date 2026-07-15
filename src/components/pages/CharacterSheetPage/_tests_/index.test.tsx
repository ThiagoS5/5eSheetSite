/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/components/pages/CharacterSheetView", () => ({
  CharacterSheetView: () => <main>Character sheet view</main>,
}));

import { CharacterSheetPage } from "@/src/components/pages/CharacterSheetPage";

describe("CharacterSheetPage", () => {
  afterEach(cleanup);

  it("renders the character sheet view page composition", () => {
    render(<CharacterSheetPage />);

    expect(screen.getByText("Character sheet view")).toBeInTheDocument();
  });
});
