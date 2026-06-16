/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import type { BuilderClass } from "@/types/builder";

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
      ],
    },
  ],
  detail: "",
};

describe("EquipmentChecklist", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders an isolated class card with selectable Option A", () => {
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );
    expect(screen.getByText("EQUIPAMENTO DA CLASSE")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("calls onSourceOptionChange with the source and option id when a kit is clicked", () => {
    const onSourceOptionChange = vi.fn();
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: null } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={onSourceOptionChange}
      />,
    );
    fireEvent.click(screen.getByText("Option A"));
    expect(onSourceOptionChange).toHaveBeenCalledWith("class", "A");
  });
});
