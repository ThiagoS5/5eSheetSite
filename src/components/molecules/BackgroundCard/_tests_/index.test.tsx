/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackgroundCard } from "@/src/components/molecules/BackgroundCard";
import type { BuilderBackground } from "@/src/types/builder";

const background: BuilderBackground = {
  id: "sage",
  name: "Sage",
  source: "PHB",
  ruleset: "2024",
  summary: "A scholar of rare lore.",
  description: "You spent years learning the multiverse.",
  descriptionBlocks: [],
  abilityOptions: [
    {
      mode: "+2/+1",
      attributes: ["inteligencia", "sabedoria", "carisma"],
    },
    {
      mode: "+1/+1/+1",
      attributes: ["inteligencia", "sabedoria", "carisma"],
    },
  ],
  originFeat: "Magic Initiate",
  skillProficiencies: ["Arcana", "History"],
  toolProficiencies: ["Calligrapher's Supplies"],
  languageChoiceCount: 1,
  equipmentSummary: "Scholar's Pack",
  rewardSummary: [],
  detail: "Sage detail",
};

function renderCard(overrides: Partial<Parameters<typeof BackgroundCard>[0]> = {}) {
  const props = {
    background,
    selected: false,
    selectedBonuses: {},
    disabled: false,
    onSelect: vi.fn(),
    onBonusesChange: vi.fn(),
    onCommit: vi.fn(),
    ...overrides,
  };

  render(<BackgroundCard {...props} />);
  return props;
}

describe("BackgroundCard", () => {
  afterEach(cleanup);

  it("renders the background summary and origin rewards", () => {
    renderCard();

    expect(screen.getByText("Sage")).toBeInTheDocument();
    expect(screen.getByText("A scholar of rare lore.")).toBeInTheDocument();
    expect(screen.getByText("Magic Initiate")).toBeInTheDocument();
    expect(screen.getByText(/Skills: Arcana, History/i)).toBeInTheDocument();
  });

  it("emits ability bonus changes from the split bonus controls", () => {
    const props = renderCard();

    fireEvent.change(
      screen.getByLabelText("Sage: ability score with +2 bonus"),
      { target: { value: "inteligencia" } },
    );

    expect(props.onBonusesChange).toHaveBeenCalledWith({ inteligencia: 2 });
  });

  it("commits immediately when the selected background already has complete bonuses", () => {
    const props = renderCard({
      selected: true,
      selectedBonuses: { inteligencia: 2, sabedoria: 1 },
    });

    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(props.onSelect).toHaveBeenCalledTimes(1);
    expect(props.onCommit).toHaveBeenCalledTimes(1);
  });
});
