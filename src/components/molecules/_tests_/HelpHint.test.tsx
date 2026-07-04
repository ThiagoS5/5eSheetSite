/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HelpHint } from "@/src/components/molecules/HelpHint";

describe("HelpHint", () => {
  it("renders a real button linked to a glossary concept", () => {
    render(<HelpHint conceptId="armor-class" beginnerMode />);

    const button = screen.getByRole("button", {
      name: "What is Armor Class?",
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("text-brand-gold-alt");
  });
});
