/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Spinner } from "@/src/components/atoms/Spinner";

describe("Spinner", () => {
  afterEach(cleanup);

  it("is announced as a status region when a label is provided", () => {
    render(<Spinner label="Loading spells" />);

    const spinner = screen.getByRole("status", { name: "Loading spells" });
    expect(spinner).toBeInTheDocument();
    expect(spinner).not.toHaveAttribute("aria-hidden");
  });

  it("is hidden from assistive technology when no label is provided", () => {
    const { container } = render(<Spinner />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("merges extra class names with the base spin classes", () => {
    const { container } = render(<Spinner className="text-accent" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("motion-safe:animate-spin");
    expect(svg).toHaveClass("text-accent");
  });
});
