/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import type { BuilderClass, BuilderBackground } from "@/src/types/builder";

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

    expect(screen.queryByRole("button", { name: /Option A/i })).toBeNull();
  });

  it("lets offered class items be equipped without adding them manually", () => {
    const onToggleEquipped = vi.fn();
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        equippedItemIds={[]}
        onToggleEquipped={onToggleEquipped}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Equip Dagger" }));
    expect(onToggleEquipped).toHaveBeenCalledWith("dagger-xphb");
  });

  it("shows unequip state for equipped offered items", () => {
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        equippedItemIds={["dagger-xphb"]}
        onToggleEquipped={vi.fn()}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Unequip Dagger" })).toBeInTheDocument();
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


    expect(screen.queryByText("15 GP")).toBeNull();
    expect(screen.queryByText("Gold")).toBeNull();

    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
  });

  it("does not render class starting gold from an unselected offered-items fallback", () => {
    const classWithFallbackGold: BuilderClass = {
      ...selectedClass,
      startingEquipmentPackages: [
        {
          id: "A",
          label: "Option A",
          summary:
            "Studded Leather Armor, Dagger, Thieves' Tools, Tinker's Tools, Dungeoneer's Pack and 150 GP",
          goldValue: 15000,
          items: [],
        },
      ],
    };

    render(
      <EquipmentChecklist
        selectedClass={classWithFallbackGold}
        choicesBySource={{ class: { mode: "items", selectedOptionId: null } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText(/Dungeoneer's Pack/)).toBeInTheDocument();
    expect(screen.queryByText(/150 GP/)).toBeNull();
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

    expect(screen.queryByText("16 GP")).toBeNull();
    expect(screen.queryByText(/Choose A or B/)).toBeNull();
  });

  it("clicking background Offered Items stores the real background-kit option", () => {
    const onSourceModeChange = vi.fn();
    const onSourceOptionChange = vi.fn();
    render(
      <EquipmentChecklist
        selectedBackground={selectedBackground}
        choicesBySource={{ background: { mode: "gold", selectedOptionId: null } }}
        onSourceModeChange={onSourceModeChange}
        onSourceOptionChange={onSourceOptionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Offered Items/i }));

    expect(onSourceModeChange).toHaveBeenCalledWith("background", "items");
    expect(onSourceOptionChange).toHaveBeenCalledWith("background", "background-kit");
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



    expect(screen.getByText("Dagger")).toBeInTheDocument();
    expect(screen.getByText("16 GP")).toBeInTheDocument();
    expect(screen.queryByText(/Choose A or B/)).not.toBeInTheDocument();
  });

  it("filters out gold entries from the items list (Change B)", () => {

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


    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();

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


    expect(activeButton).toHaveClass("bg-brand-crimson-alt");

    expect(inactiveButton).not.toHaveClass("bg-brand-crimson-alt");
  });
});
