/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/src/components/organisms/Header";

describe("Header", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the global navigation with an accessible mobile action", () => {
    const onOpenMenu = vi.fn();
    render(<Header onOpenMenu={onOpenMenu} />);

    expect(screen.getByRole("banner")).toHaveClass("fixed", "top-0", "h-16");
    expect(
      screen.getByRole("heading", { name: "FORGE & FATE" }),
    ).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(navigation).toHaveClass("hidden", "md:flex");
    expect(screen.getByRole("link", { name: "Vault" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Sheet" })).toHaveAttribute("href", "/sheet");

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveClass(
      "md:hidden",
    );
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onOpenMenu).toHaveBeenCalledOnce();
    expect(screen.queryByTitle(/barra lateral/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /profile/i })).not.toBeInTheDocument();
  });
});
