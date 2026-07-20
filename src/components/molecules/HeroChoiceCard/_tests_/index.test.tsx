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

  it("renders badge titles for source abbreviations", () => {
    renderCard({
      badges: [{ label: "XPHB", title: "Player's Handbook 2024" }, "Martial"],
    });

    const badge = screen.getByText("XPHB");
    expect(badge).toHaveAttribute("title", "Player's Handbook 2024");
    expect(badge).toHaveAttribute("translate", "no");
    expect(badge).toHaveClass("notranslate");
  });

  it("fires the details and select handlers from their buttons", () => {
    const props = renderCard();

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const button of buttons) fireEvent.click(button);

    expect(props.onClickDetails).toHaveBeenCalled();
    expect(props.onClickSelect).toHaveBeenCalled();
  });

  it("stretches to the height of its grid cell", () => {
    const { container } = render(<HeroChoiceCard
      title="Aasimar"
      badges={["XPHB"]}
      description="Mortals with celestial sparks."
      isActive={false}
      onClickDetails={vi.fn()}
      onClickSelect={vi.fn()}
    />);

    expect(container.querySelector("article")).toHaveClass("h-full");
  });

  it("keeps SVG definition ids unique across multiple cards", () => {
    const { container } = render(
      <>
        <HeroChoiceCard
          title="Fighter"
          badges={["XPHB"]}
          description="A martial expert."
          isActive={false}
          onClickDetails={vi.fn()}
          onClickSelect={vi.fn()}
        />
        <HeroChoiceCard
          title="Wizard"
          badges={["XPHB"]}
          description="An arcane scholar."
          isActive={false}
          onClickDetails={vi.fn()}
          onClickSelect={vi.fn()}
        />
      </>,
    );

    const ids = Array.from(container.querySelectorAll("[id]"), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
