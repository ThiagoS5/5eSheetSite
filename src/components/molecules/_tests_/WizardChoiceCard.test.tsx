/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WizardChoiceCard } from "@/src/components/molecules/WizardChoiceCard";

describe("WizardChoiceCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("anchors artwork to the top while preserving cover cropping", () => {
    render(
      <WizardChoiceCard
        title="Barbarian"
        subtitle="XPHB"
        imageSrc="https://example.com/barbarian.webp"
        imageAlt="Barbarian artwork"
        isActive={false}
        onClickDetails={vi.fn()}
        onClickSelect={vi.fn()}
      >
        <p>Class summary</p>
      </WizardChoiceCard>,
    );

    expect(screen.getByRole("img", { name: "Barbarian artwork" })).toHaveClass(
      "object-cover",
      "object-top",
    );
  });

  it("renders summary subtitles without the eyebrow treatment", () => {
    render(
      <WizardChoiceCard
        title="Human"
        subtitle="Humans are adaptable, ambitious, and found across every realm."
        subtitleVariant="summary"
        imageSrc="https://example.com/human.webp"
        imageAlt="Human artwork"
        isActive={false}
        onClickDetails={vi.fn()}
        onClickSelect={vi.fn()}
      >
        <p>Species summary</p>
      </WizardChoiceCard>,
    );

    const subtitle = screen.getByText(
      "Humans are adaptable, ambitious, and found across every realm.",
    );

    expect(subtitle).toHaveClass("line-clamp-2", "text-sm");
    expect(subtitle).not.toHaveClass("uppercase");
  });
});
