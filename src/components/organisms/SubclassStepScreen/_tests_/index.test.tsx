/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubclassStepScreen } from "@/src/components/organisms/SubclassStepScreen";
import type { BuilderClass } from "@/src/types/builder";

const wizardClass: BuilderClass = {
  id: "wizard",
  name: "Wizard",
  source: "XPHB",
  ruleset: "2024",
  level: 1,
  hitDie: 6,
  summary: "A scholar of arcane magic.",
  description: "",
  descriptionBlocks: [],
  primaryAbility: ["Intelligence"],
  savingThrows: ["Intelligence", "Wisdom"],
  armorProficiencies: [],
  weaponProficiencies: [],
  toolProficiencies: [],
  progressionRows: [],
  skillChoices: { chooseFrom: [], count: 0 },
  languageChoiceCount: 0,
  featureChoiceGroups: [],
  levelOneFeatures: [],
  allFeatures: [{ name: "Subclass", description: "", level: 3, grantsSubclass: true }],
  startingEquipment: [],
  startingEquipmentGold: "110 GP",
  startingEquipmentPackages: [],
  detail: "",
  subclasses: [
    {
      id: "evoker",
      name: "Evoker",
      shortName: "Evoker",
      source: "XPHB",
      features: [
        {
          name: "Sculpt Spells",
          description: "Protect allies from your evocations.",
          level: 3,
        },
      ],
    },
    {
      id: "illusionist",
      name: "Illusionist",
      shortName: "Illusionist",
      source: "XPHB",
      features: [],
    },
  ],
};

describe("SubclassStepScreen", () => {
  afterEach(cleanup);

  it("asks for a class before rendering subclass options", () => {
    render(
      <SubclassStepScreen
        level={3}
        selectedSubclassId=""
        activeSources={["XPHB"]}
        disabled={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "No class selected" })).toBeInTheDocument();
  });

  it("filters subclass options and selects the visible card", () => {
    const onSelect = vi.fn();
    render(
      <SubclassStepScreen
        characterClass={wizardClass}
        level={3}
        selectedSubclassId=""
        activeSources={["XPHB"]}
        disabled={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.change(screen.getByLabelText("Filter subclasses"), {
      target: { value: "evoker" },
    });
    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    expect(screen.getByText("1 subclass found")).toBeInTheDocument();
    expect(screen.getByText("Evoker")).toBeInTheDocument();
    expect(screen.queryByText("Illusionist")).not.toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledWith("evoker");
  });
});
