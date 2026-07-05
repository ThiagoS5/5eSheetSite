/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import type { BuilderClass, BuilderBackground } from "@/types/builder";

const selectedClass: BuilderClass = {
  id: "rogue-xphb",
  name: "Rogue",
  source: "XPHB",
  ruleset: "2024",
  level: 1,
  hitDie: 8,
  summary: "Rogue class summary.",
  description: "Rogue class description.",
  descriptionBlocks: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Rogue class description." }],
    },
  ],
  primaryAbility: ["Destreza"],
  savingThrows: ["Destreza", "Inteligencia"],
  armorProficiencies: ["light"],
  weaponProficiencies: ["simple", "martial weapons with finesse or light property"],
  toolProficiencies: ["Thieves' Tools"],
  progressionRows: [],
  skillChoices: { chooseFrom: [], count: 0 },
  languageChoiceCount: 0,
  featureChoiceGroups: [],
  levelOneFeatures: [],
  allFeatures: [],
  startingEquipment: [
    "Choose A or B: (A) Studded Leather Armor, Dagger, Thieves' Tools; or (B) 150 GP",
  ],
  startingEquipmentGold: "150 GP",
  startingEquipmentPackages: [
    {
      id: "A",
      label: "Option A",
      summary: "Studded Leather Armor, Dagger, Thieves' Tools",
      goldValue: 0,
      items: [
        { id: "studded-leather-armor-xphb", label: "Studded Leather Armor", quantity: 1 },
        { id: "dagger-xphb", label: "Dagger", quantity: 1 },
        { id: "gold-2", label: "Gold", quantity: 1, value: 1500 },
      ],
    },
  ],
  detail: "",
  subclasses: [],
};

describe("EquipmentChecklist", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders class equipment items as a display list when mode is items", () => {
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("CLASS EQUIPMENT")).toBeInTheDocument();
    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
    // Items are rendered as list elements, not clickable buttons
    expect(screen.queryByRole("button", { name: /Option A/i })).toBeNull();
  });

  it("only renders items from the selected kit when selectedOptionId is set", () => {
    const classWithTwoKits: BuilderClass = {
      ...selectedClass,
      startingEquipmentPackages: [
        {
          id: "A",
          label: "Option A",
          summary: "Studded Leather Armor, Dagger, Thieves' Tools",
          goldValue: 0,
          items: [
            { id: "studded-leather-armor-xphb", label: "Studded Leather Armor", quantity: 1 },
          ],
        },
        {
          id: "B",
          label: "Option B",
          summary: "Chain Mail, Longsword",
          goldValue: 0,
          items: [{ id: "chain-mail-xphb", label: "Chain Mail", quantity: 1 }],
        },
      ],
    };

    render(
      <EquipmentChecklist
        selectedClass={classWithTwoKits}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.queryByText("Chain Mail")).toBeNull();
  });

  it("clicking Offered Items tab calls both onSourceModeChange and onSourceOptionChange with first kit", () => {
    const onSourceModeChange = vi.fn();
    const onSourceOptionChange = vi.fn();
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "gold", selectedOptionId: null } }}
        onSourceModeChange={onSourceModeChange}
        onSourceOptionChange={onSourceOptionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Offered Items/i }));

    expect(onSourceModeChange).toHaveBeenCalledWith("class", "items");
    expect(onSourceOptionChange).toHaveBeenCalledWith("class", "A");
  });

  it("does not render gold-value items in items mode (they are filtered out)", () => {
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    // Gold items with value are filtered out in items mode
    expect(screen.queryByText("15 GP")).toBeNull();
    expect(screen.queryByText("Gold")).toBeNull();
    // Physical items still render
    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
  });

  const selectedBackground: BuilderBackground = {
    id: "aberrant-heir-xphb",
    name: "Aberrant Heir",
    source: "XPHB",
    ruleset: "2024",
    summary: "Aberrant Heir background.",
    description: "Aberrant Heir description.",
    descriptionBlocks: [],
    abilityOptions: [],
    originFeat: "",
    skillProficiencies: [],
    toolProficiencies: [],
    languageChoiceCount: 0,
    equipmentSummary: "Choose A or B: (A) Dagger, 16 GP; or (B) 50 GP",
    equipmentGold: "50 GP",
    equipmentItemsA: [
      { id: "dagger-xphb", label: "Dagger", quantity: 1 },
      { id: "gold-4", label: "Gold", quantity: 1, value: 1600 },
    ],
    rewardSummary: [],
    detail: "",
  };

  it("renders background items from equipmentItemsA as a structured list, filtering out gold entries", () => {
    render(
      <EquipmentChecklist
        selectedBackground={selectedBackground}
        choicesBySource={{ background: { mode: "items", selectedOptionId: "background-kit" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("BACKGROUND EQUIPMENT")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
    // Gold entries are filtered out in items mode
    expect(screen.queryByText("16 GP")).toBeNull();
    expect(screen.queryByText(/Choose A or B/)).toBeNull();
  });

  it("shows only option A (items) when a background lacks structured equipmentItemsA", () => {
    const bgNoItems: BuilderBackground = {
      ...selectedBackground,
      equipmentItemsA: undefined,
    };

    render(
      <EquipmentChecklist
        selectedBackground={bgNoItems}
        choicesBySource={{ background: { mode: "items", selectedOptionId: "background-kit" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    // Option A is parsed from the "Choose A or B" summary and rendered as a
    // structured list; the combined "Choose A or B …" string is not shown.
    expect(screen.getByText("Dagger")).toBeInTheDocument();
    expect(screen.getByText("16 GP")).toBeInTheDocument();
    expect(screen.queryByText(/Choose A or B/)).not.toBeInTheDocument();
  });

  it("filters out gold entries from the items list (Change B)", () => {
    // Kit with both physical items and a gold entry
    const classWithGoldEntry: BuilderClass = {
      ...selectedClass,
      startingEquipmentPackages: [
        {
          id: "A",
          label: "Option A",
          summary: "Studded Leather Armor, Dagger, 50 GP",
          goldValue: 0,
          items: [
            { id: "studded-leather-armor-xphb", label: "Studded Leather Armor", quantity: 1 },
            { id: "dagger-xphb", label: "Dagger", quantity: 1 },
            { id: "gold-50", label: "Gold", quantity: 1, value: 5000 },
          ],
        },
      ],
    };

    render(
      <EquipmentChecklist
        selectedClass={classWithGoldEntry}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    // Physical items should render
    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
    // Gold entry should NOT appear in items list
    expect(screen.queryByText("50 GP")).toBeNull();
  });

  it("shows gold in gold mode even when it contains value (Change B with gold mode)", () => {
    const classWithGoldEntry: BuilderClass = {
      ...selectedClass,
      startingEquipmentPackages: [
        {
          id: "A",
          label: "Option A",
          summary: "Choose A or B: (A) Studded Leather Armor, Dagger; or (B) 150 GP",
          goldValue: 0,
          items: [
            { id: "studded-leather-armor-xphb", label: "Studded Leather Armor", quantity: 1 },
            { id: "dagger-xphb", label: "Dagger", quantity: 1 },
            { id: "gold-50", label: "Gold", quantity: 1, value: 5000 },
          ],
        },
      ],
    };

    render(
      <EquipmentChecklist
        selectedClass={classWithGoldEntry}
        choicesBySource={{ class: { mode: "gold", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    // Gold mode should show the gold option (from the "Choose A or B" summary)
    expect(screen.getByText("150 GP")).toBeInTheDocument();
  });

  it("active mode button has bg-brand-crimson-alt (Change A)", () => {
    const onSourceModeChange = vi.fn();
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={onSourceModeChange}
        onSourceOptionChange={vi.fn()}
      />,
    );

    const activeButton = screen.getByRole("button", { name: /Offered Items/i });
    const inactiveButton = screen.getByRole("button", { name: /Starting Gold/i });

    // Active button should have the crimson class
    expect(activeButton).toHaveClass("bg-brand-crimson-alt");
    // Inactive button should NOT have the crimson class
    expect(inactiveButton).not.toHaveClass("bg-brand-crimson-alt");
  });
});
