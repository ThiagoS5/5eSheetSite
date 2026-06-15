/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
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
          <div>Builder content</div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "FORGE & FATE" }),
    ).toBeInTheDocument();

    const shell = document.querySelector("main");

    expect(shell).toHaveClass("pt-16");
    const builderTitle = screen.getByRole("heading", { name: "Forge & Fate" });
    const builderSection = screen.getByRole("region", { name: "Forge & Fate" });

    expect(builderTitle.parentElement).toBe(builderSection);
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
});
