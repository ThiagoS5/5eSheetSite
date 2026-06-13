/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import type { BuilderClass, BuilderEquipmentOption } from "@/types/builder";

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

const equipment: BuilderEquipmentOption[] = [
  {
    id: "acid-xphb",
    name: "Acid",
    source: "XPHB",
    sourceType: "manual",
  },
];

describe("EquipmentChecklist", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows only the class item package when item mode is selected", () => {
    render(
      <EquipmentChecklist
        equipment={equipment}
        selectedClass={selectedClass}
        acquisitionMode="items"
        selectedEquipmentIds={[]}
        onAcquisitionModeChange={vi.fn()}
        onToggleEquipment={vi.fn()}
      />,
    );

    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.queryByText("O personagem usara a opcao de ouro inicial da classe selecionada.")).not.toBeInTheDocument();
    expect(screen.getByText("Adicionar Itens Opcionais / Equipamentos Extras")).toBeInTheDocument();
    expect(screen.getByText("Acid")).toBeInTheDocument();
  });

  it("shows only the gold option when gold mode is selected", () => {
    render(
      <EquipmentChecklist
        equipment={equipment}
        selectedClass={selectedClass}
        acquisitionMode="gold"
        selectedEquipmentIds={[]}
        onAcquisitionModeChange={vi.fn()}
        onToggleEquipment={vi.fn()}
      />,
    );

    expect(screen.queryByText("Option A")).not.toBeInTheDocument();
    expect(screen.getAllByText("150 GP")).toHaveLength(1);
    expect(screen.getByText("Adicionar Itens Opcionais / Equipamentos Extras")).toBeInTheDocument();
  });
});
