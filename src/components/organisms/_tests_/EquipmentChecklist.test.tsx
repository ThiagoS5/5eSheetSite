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
  descriptionBlocks: [{ type: "paragraph", text: "Rogue class description." }],
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

    expect(screen.getByText("EQUIPAMENTO DA CLASSE")).toBeInTheDocument();
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

  it("clicking Itens Oferecidos tab calls both onSourceModeChange and onSourceOptionChange with first kit", () => {
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

    fireEvent.click(screen.getByRole("button", { name: /Itens Oferecidos/i }));

    expect(onSourceModeChange).toHaveBeenCalledWith("class", "items");
    expect(onSourceOptionChange).toHaveBeenCalledWith("class", "A");
  });

  it("renders a gold-value item as 'X GP' instead of quantity and label", () => {
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("15 GP")).toBeInTheDocument();
    expect(screen.queryByText("Gold")).toBeNull();
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

  it("renders background items from equipmentItemsA as a structured list", () => {
    render(
      <EquipmentChecklist
        selectedBackground={selectedBackground}
        choicesBySource={{ background: { mode: "items", selectedOptionId: "background-kit" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("EQUIPAMENTO DO ANTECEDENTE")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
    expect(screen.getByText("16 GP")).toBeInTheDocument();
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

    // Option A is parsed from the "Choose A or B" summary; the combined
    // "Choose A or B …" string and option B (gold) are not shown in items mode.
    expect(screen.getByText("Dagger, 16 GP")).toBeInTheDocument();
    expect(screen.queryByText(/Choose A or B/)).not.toBeInTheDocument();
  });
});
