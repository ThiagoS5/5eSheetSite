/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroChoiceCard } from "@/src/components/molecules/HeroChoiceCard";

function renderCard(overrides: Partial<Parameters<typeof HeroChoiceCard>[0]> = {}) {
  const props = {
    title: "Fighter",
    badges: ["Martial", "d10"],
    description: "A master of martial combat.",
    isActive: false,
    onClickDetails: vi.fn(),
    onClickSelect: vi.fn(),
    ...overrides,
  };
  render(<HeroChoiceCard {...props} />);
  return props;
}

describe("HeroChoiceCard", () => {
  afterEach(cleanup);

  it("renders title, badges, and description", () => {
    renderCard();

    expect(screen.getByText("Fighter")).toBeInTheDocument();
    expect(screen.getByText("Martial")).toBeInTheDocument();
    expect(screen.getByText("d10")).toBeInTheDocument();
    expect(screen.getByText("A master of martial combat.")).toBeInTheDocument();
  });

  it("fires the details and select handlers from their buttons", () => {
    const props = renderCard();

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const button of buttons) fireEvent.click(button);

    expect(props.onClickDetails).toHaveBeenCalled();
    expect(props.onClickSelect).toHaveBeenCalled();
  });
});
