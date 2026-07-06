/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";
import { BuilderShell } from "@/src/components/templates/BuilderShell";
import * as useMobileModule from "@/src/hooks/use-mobile";

vi.mock("next/navigation", () => ({
  usePathname: () => "/builder/classe",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("BuilderShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(screen.queryByTitle("Toggle sidebar (Ctrl+B)")).not.toBeInTheDocument();
    expect(screen.getByTitle("Close sidebar (Ctrl+B)")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Collapse sidebar|Expand sidebar/i }),
    ).not.toBeInTheDocument();

    const shell = document.querySelector("main");

    expect(shell).toHaveClass("pt-16");
    const builderTitle = screen.getByRole("heading", { name: "Forge & Fate" });
    const builderSection = screen.getByRole("region", { name: "Forge & Fate" });

    expect(builderSection).toContainElement(builderTitle);
    expect(builderSection.querySelector(".sticky.top-0")).not.toBeInTheDocument();

    const sidebar = screen
      .getByRole("navigation", { name: "Character Builder steps" })
      .closest("aside");
    const preview = screen
      .getByRole("complementary", { name: /Unnamed Hero/i })
      .closest("aside");

    expect(sidebar).toHaveClass("hidden", "xl:flex");
    expect(preview).toHaveClass("hidden", "xl:block");
    expect(screen.getByRole("status", { name: /Saved/i })).toBeInTheDocument();
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

  it("renders the mobile builder bar and hides the desktop sidebar on mobile", () => {
    vi.spyOn(useMobileModule, "useIsMobile").mockReturnValue(true);

    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <h1 id="builder-title">Forge & Fate</h1>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    expect(
      screen.getByRole("button", { name: /next/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Character Builder steps" }),
    ).not.toBeInTheDocument();
  });

  it("toggles beginner mode from the builder toolbar", () => {
    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <h1 id="builder-title">Forge & Fate</h1>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    const toggle = screen.getByRole("switch", { name: "Guided mode" });

    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("opens the live character sheet (not navigation) from the identity strip", () => {
    vi.spyOn(useMobileModule, "useIsMobile").mockReturnValue(true);

    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <h1 id="builder-title">Forge & Fate</h1>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open the live sheet/i }));


    expect(screen.getByText("Live Sheet")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: /Unnamed Hero/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("navigation", { name: "Character Builder steps" }),
    ).not.toBeInTheDocument();
  });

  it("opens the builder steps navigation from the step indicator", () => {
    vi.spyOn(useMobileModule, "useIsMobile").mockReturnValue(true);

    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <h1 id="builder-title">Forge & Fate</h1>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open builder steps/i }));

    expect(screen.getByText("Builder steps")).toBeInTheDocument();
    const drawerNav = screen.getByRole("navigation", {
      name: "Character Builder steps",
    });
    expect(drawerNav.closest("aside")).toHaveTextContent("FORGE & FATE");
  });

  it("does not render the mobile builder bar on desktop", () => {
    vi.spyOn(useMobileModule, "useIsMobile").mockReturnValue(false);

    render(
      <CharacterStoreProvider>
        <BuilderShell>
          <div>
            <h1 id="builder-title">Forge & Fate</h1>
          </div>
        </BuilderShell>
      </CharacterStoreProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /next/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Character Builder steps" }),
    ).toBeInTheDocument();
  });
});
