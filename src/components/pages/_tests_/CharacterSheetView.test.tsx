/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CharacterSheetView } from "@/src/components/pages/CharacterSheetView";

afterEach(() => {
  cleanup();
});

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Level Up</button>,
}));

// Minimal store/selector fakes so the view renders in isolation.
vi.mock("@/src/store/useCharacterBuilderState", () => ({ useCharacterBuilderState: () => ({}) }));
vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({ description: { notas: "", nome: "Thalindra" }, setDescriptionField: () => {} }),
}));
vi.mock("@/src/store/characterSelectors", () => ({
  selectCharacterSheetSummary: () => ({
    ruleset: "2024", name: "Thalindra", level: 5, className: "Wizard", speciesName: "High Elf",
    backgroundName: "Sage", armorClass: 13, initiative: 3, speedFeet: 30, currentHp: 27, maxHp: 27,
    proficiencyBonus: 3, attributes: [], skills: [], savingThrows: [], features: [], weapons: [],
    selectedEquipment: [], isSpellcaster: false, resistances: [], immunities: [], vulnerabilities: [],
    passives: { perception: 11, investigation: 11, insight: 13 }, senses: [], languages: [],
  }),
}));

describe("CharacterSheetView", () => {
  it("renders the hero identity in standalone mode", () => {
    render(<CharacterSheetView />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
  });

  it("renders in embedded mode without throwing", () => {
    render(<CharacterSheetView embedded />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
  });
});
