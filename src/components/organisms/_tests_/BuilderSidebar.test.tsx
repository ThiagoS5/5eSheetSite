/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/builder/recursos-classe",
}));

vi.mock("@/store/useCharacterStore", () => ({
  useCharacterStore: <T,>(selector: (state: { maxUnlockedStepIndex: number }) => T) =>
    selector({ maxUnlockedStepIndex: 8 }),
}));

describe("BuilderSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the DDB-inspired builder steps as keyboard-accessible links", () => {
    render(<BuilderSidebar />);

    expect(
      screen.getByRole("navigation", { name: "Etapas do Character Builder" }),
    ).toBeInTheDocument();

    const links = screen.getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toStrictEqual([
      "/builder/classe",
      "/builder/recursos-classe",
      "/builder/antecedente",
      "/builder/especie",
      "/builder/detalhes-especie",
      "/builder/atributos",
      "/builder/equipamento",
      "/builder/descricao",
      "/builder/conclusao",
    ]);
  });

  it("marks the current step with aria-current", () => {
    render(<BuilderSidebar />);

    expect(screen.getByRole("link", { name: "Recursos de Classe" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("link", { name: "Classe" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
