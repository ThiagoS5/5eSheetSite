/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";
import { BuilderShell } from "@/src/components/templates/BuilderShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/builder/classe",
}));

describe("BuilderShell", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders below the fixed header and hides sidebars until desktop", () => {
    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <p>Character Creation</p>
            <h1 id="builder-title">Forge & Fate</h1>
            <div>Builder content</div>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "FORGE & FATE" }),
    ).toBeInTheDocument();
    expect(screen.queryByTitle("Alternar barra lateral (Ctrl+B)")).not.toBeInTheDocument();
    expect(screen.getByTitle("Fechar barra lateral (Ctrl+B)")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Recolher sidebar|Expandir sidebar/i }),
    ).not.toBeInTheDocument();

    const shell = document.querySelector("main");

    expect(shell).toHaveClass("pt-16");
    const builderTitle = screen.getByRole("heading", { name: "Forge & Fate" });
    const builderSection = screen.getByRole("region", { name: "Forge & Fate" });

    expect(builderSection).toContainElement(builderTitle);
    expect(builderSection.querySelector(".sticky.top-16")).not.toBeInTheDocument();

    const sidebar = screen
      .getByRole("navigation", { name: "Etapas do Character Builder" })
      .closest("aside");
    const preview = screen
      .getByRole("complementary", { name: /sem nome/i })
      .closest("aside");

    expect(sidebar).toHaveClass("hidden", "xl:flex");
    expect(preview).toHaveClass("hidden", "xl:block");
  });

  it("toggles the sidebar icon state with Ctrl+B", () => {
    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <h1 id="builder-title">Forge & Fate</h1>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    const sidebar = document.querySelector('[data-slot="sidebar"]');

    expect(sidebar).not.toHaveAttribute("data-collapsible", "icon");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });

    expect(sidebar).toHaveAttribute("data-collapsible", "icon");
  });
});
