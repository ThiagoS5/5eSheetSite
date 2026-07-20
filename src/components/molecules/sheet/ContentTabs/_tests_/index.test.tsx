/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import type { CharacterSheetSummary, CharacterDescription } from "@/src/types/builder";

const adjustCoin = vi.fn();
const setCoin = vi.fn();
const setCarriedLoadKg = vi.fn();
const setInventoryQuantity = vi.fn();

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      description: { notas: "" },
      setDescriptionField: () => {},
      adjustCoin,
      setCoin,
      setCarriedLoadKg,
      setInventoryQuantity,
    }),
}));

vi.mock("@/src/components/organisms/sheet/NotesPanel", () => ({
  NotesPanel: () => <div>Notes workspace</div>,
}));

vi.mock("@/src/components/organisms/sheet/SessionLogPanel", () => ({
  SessionLogPanel: () => <div>Session Log workspace</div>,
}));

const summary = {
  isSpellcaster: false,
  weapons: [{ name: "Dagger", attackBonus: "+6", damage: "1d4+3 Piercing", notes: "Finesse" }],
  selectedEquipment: [
    { id: "sword", name: "Longsword", source: "Manual", sourceType: "manual", value: 15, category: "Weapon" },
  ],
  inventory: [
    { item: { id: "grimoire", name: "Spellbook", source: "Wizard", sourceType: "class", value: 50, category: "Wondrous" }, quantity: 1 },
    { item: { id: "sword", name: "Longsword", source: "Manual", sourceType: "manual", value: 15, category: "Weapon" }, quantity: 2 },
    {
      item: {
        id: "rope",
        name: "Hempen Rope",
        source: "Adventuring Gear",
        sourceType: "background",
        value: 100,
        category: "Other Gear",
        type: "gear",
        weightKg: 4.54,
        detail: "A sturdy 50-foot coil of hempen rope.",
      },
      quantity: 1,
    },
  ],
  features: [
    { name: "Spellcasting", description: "...", source: "class" },
    { name: "Darkvision", description: "...", source: "species" },
  ],
  money: { pc: 1, pp: 2, pe: 3, po: 4, pl: 5 },
  carry: { currentKg: 10, maxKg: 50 },
} as unknown as CharacterSheetSummary;

const description = {
  tracos: "",
  personalidade: "",
  historia: "",
  notas: "",
} as unknown as CharacterDescription;

describe("ContentTabs", () => {
  afterEach(cleanup);
  beforeEach(() => render(<ContentTabs summary={summary} description={description} />));

  it("renders Notes and Session Log as independent main tabs", () => {
    expect(screen.getByRole("tab", { name: /sheet/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /notes/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /session log/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: /notes/i }));
    expect(screen.getByText("Notes workspace")).toBeInTheDocument();
    expect(screen.queryByText("Session Log workspace")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /session log/i }));
    expect(screen.getByText("Session Log workspace")).toBeInTheDocument();
    expect(screen.queryByText("Notes workspace")).not.toBeInTheDocument();
  });

  it("supports Arrow, Home, and End keyboard navigation across main tabs", () => {
    const actionsTab = screen.getByRole("tab", { name: /actions/i });
    actionsTab.focus();

    fireEvent.keyDown(actionsTab, { key: "End" });
    const sessionLogTab = screen.getByRole("tab", { name: /session log/i });
    expect(sessionLogTab).toHaveAttribute("aria-selected", "true");
    expect(sessionLogTab).toHaveFocus();

    fireEvent.keyDown(sessionLogTab, { key: "Home" });
    expect(actionsTab).toHaveAttribute("aria-selected", "true");
    expect(actionsTab).toHaveFocus();

    fireEvent.keyDown(actionsTab, { key: "ArrowLeft" });
    expect(sessionLogTab).toHaveAttribute("aria-selected", "true");
  });

  it("shows weapons as cards on the Actions tab by default", () => {
    expect(screen.getByText("Dagger")).toBeInTheDocument();
  });

  it("shows an intentional empty state on the Spells tab for a non-caster", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Spells/ }));
    expect(screen.getByText(/does not have spells|No spells/i)).toBeInTheDocument();
  });

  it("groups and deduplicates spells with identical fixed columns for every present level", () => {
    cleanup();
    const spell = (id: string, name: string, level: number) => ({
      id,
      name,
      level,
      school: "Abjuration",
      source: "XPHB",
      castingTime: "1 action",
      range: "Self",
      duration: "1 round",
      components: "V, S",
      classNames: ["Wizard"],
      description: `${name} description`,
    });
    const mageHand = spell("mage-hand-xphb", "Mage Hand", 0);
    const shield = spell("shield-xphb", "Shield", 1);
    const mistyStep = spell("misty-step-xphb", "Misty Step", 2);
    const casterSummary = {
      ...summary,
      isSpellcaster: true,
      spellcasting: {
        ability: "inteligencia",
        abilityLabel: "Intelligence",
        spellSaveDc: 15,
        spellAttackBonus: 7,
        cantripsKnownLimit: 2,
        knownSpellLimit: 0,
        preparedSpellLimit: 3,
        selectedCantripCount: 1,
        selectedKnownCount: 0,
        selectedPreparedCount: 2,
        slots: [],
        cantrips: [mageHand],
        knownSpells: [shield],
        preparedSpells: [shield, mistyStep],
      },
    } as unknown as CharacterSheetSummary;
    render(<ContentTabs summary={casterSummary} description={description} />);

    fireEvent.click(screen.getByRole("tab", { name: /spells/i }));

    expect(screen.getByRole("heading", { name: "Cantrips" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Level 1 Spells" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Level 2 Spells" })).toBeInTheDocument();
    expect(screen.getAllByText("Shield")).toHaveLength(1);
    for (const table of screen.getAllByRole("table")) {
      expect(within(table).getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
        "Spell",
        "Level",
        "Casting",
        "Range",
        "Source",
      ]);
      expect(table).toHaveClass("table-fixed");
      expect(table.querySelectorAll("colgroup col")).toHaveLength(5);
    }
  });

  it("filters features by origin on the Features tab", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Features/ }));
    expect(screen.getByText("Spellcasting")).toBeInTheDocument();
    expect(screen.getByText("Darkvision")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Species" }));
    expect(screen.queryByText("Spellcasting")).not.toBeInTheDocument();
    expect(screen.getByText("Darkvision")).toBeInTheDocument();
  });

  it("opens the detail modal when a weapon card is clicked", () => {
    fireEvent.click(screen.getByText("Dagger"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("1d4+3 Piercing")).toBeInTheDocument();
  });

  it("has a fixed-height scrollable tabpanel container", () => {
    const panel = screen.getByRole("tabpanel");
    expect(panel.className).toMatch(/overflow-y-auto/);
  });

  it("shows five coin cards and a load card on the Inventory tab", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventory/ }));
    expect(screen.getByText("PP")).toBeInTheDocument();
    expect(screen.getByText("GP")).toBeInTheDocument();
    expect(screen.getByText("EP")).toBeInTheDocument();
    expect(screen.getByText("SP")).toBeInTheDocument();
    expect(screen.getByText("CP")).toBeInTheDocument();
    expect(screen.getByText("10 / 50 kg")).toBeInTheDocument();
  });

  it("calls adjustCoin when clicking the increase button for GP", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventory/ }));
    fireEvent.click(screen.getByRole("button", { name: "Increase GP" }));
    expect(adjustCoin).toHaveBeenCalledWith("po", 1);
  });

  it("filters inventory to weapons only via the Weapons chip", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventory/ }));
    expect(screen.getByRole("columnheader", { name: "Equipment" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Weight" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Quantity" })).toBeInTheDocument();
    expect(screen.getByText("Spellbook")).toBeInTheDocument();
    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getByText("Hempen Rope")).toBeInTheDocument();
    expect(within(screen.getByRole("row", { name: /Longsword/ })).getByText("2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Weapons" }));
    expect(screen.queryByText("Spellbook")).not.toBeInTheDocument();
    expect(screen.queryByText("Hempen Rope")).not.toBeInTheDocument();
    expect(screen.getByText("Longsword")).toBeInTheDocument();
  });

  it("filters inventory to utility gear via the Utility chip", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventory/ }));
    fireEvent.click(screen.getByRole("button", { name: "Utility" }));
    expect(screen.getByText("Hempen Rope")).toBeInTheDocument();
    expect(screen.queryByText("Longsword")).not.toBeInTheDocument();
    expect(screen.queryByText("Spellbook")).not.toBeInTheDocument();
  });

  it("opens inventory item details with real item metadata", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventory/ }));
    fireEvent.click(screen.getByRole("button", { name: "Open Hempen Rope" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Other Gear")).toBeInTheDocument();
    expect(within(dialog).getByText("Gear")).toBeInTheDocument();
    expect(within(dialog).getByText("1 GP")).toBeInTheDocument();
    expect(within(dialog).getByText("4.54 kg")).toBeInTheDocument();
    expect(within(dialog).getByText("A sturdy 50-foot coil of hempen rope.")).toBeInTheDocument();
  });
});
