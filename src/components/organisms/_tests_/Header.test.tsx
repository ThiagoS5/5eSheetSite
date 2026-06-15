/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Header } from "@/src/components/organisms/Header";

describe("Header", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the global navigation with accessible mobile and profile actions", () => {
    render(<Header />);

    expect(screen.getByRole("banner")).toHaveClass("fixed", "top-0", "h-16");
    expect(
      screen.getByRole("heading", { name: "FORGE & FATE" }),
    ).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Navegacao principal",
    });

    expect(navigation).toHaveClass("hidden", "md:flex");
    expect(screen.getByRole("link", { name: "Vault" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Codex" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveClass(
      "md:hidden",
    );
    expect(screen.queryByTitle(/barra lateral/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Abrir perfil do usuario" }),
    ).toBeInTheDocument();
  });
});
