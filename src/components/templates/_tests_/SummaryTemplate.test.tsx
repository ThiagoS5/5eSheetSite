/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider } from "@/store/useCharacterStore";
import { SummaryTemplate } from "@/src/components/templates/SummaryTemplate";

describe("SummaryTemplate", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the conclusion dashboard and Foundry download action", () => {
    render(
      <CharacterStoreProvider>
        <SummaryTemplate />
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Conclusão/Resumo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download (Foundry VTT)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Atributos" })).toBeInTheDocument();
  });
});
