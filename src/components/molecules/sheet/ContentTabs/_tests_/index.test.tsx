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

  it("renders the Sheet and Notes tabs", () => {
    expect(screen.getByRole("tab", { name: /sheet/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /notes/i })).toBeTruthy();
  });

  it("shows weapons as cards on the Actions tab by default", () => {
    expect(screen.getByText("Dagger")).toBeInTheDocument();
  });

  it("shows an intentional empty state on the Spells tab for a non-caster", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Spells/ }));
    expect(screen.getByText(/does not have spells|No spells/i)).toBeInTheDocument();
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
