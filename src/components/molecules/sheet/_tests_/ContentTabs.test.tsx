/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import type { CharacterSheetSummary } from "@/types/builder";

const adjustCoin = vi.fn();
const setCoin = vi.fn();
const setCarriedLoadKg = vi.fn();

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      description: { notas: "" },
      setDescriptionField: () => {},
      adjustCoin,
      setCoin,
      setCarriedLoadKg,
    }),
}));

const summary = {
  isSpellcaster: false,
  weapons: [{ name: "Adaga", attackBonus: "+6", damage: "1d4+3 Perfurante", notes: "Acuidade" }],
  selectedEquipment: [
    { id: "grimoire", name: "Grimório", source: "Mago", sourceType: "class", value: 50, category: "Wondrous" },
    { id: "sword", name: "Espada Longa", source: "Manual", sourceType: "manual", value: 15, category: "Weapon" },
  ],
  features: [
    { name: "Conjuração", description: "…", source: "class" },
    { name: "Visão no Escuro", description: "…", source: "species" },
  ],
  money: { pc: 1, pp: 2, pe: 3, po: 4, pl: 5 },
  carry: { currentKg: 10, maxKg: 50 },
} as unknown as CharacterSheetSummary;

describe("ContentTabs", () => {
  afterEach(cleanup);
  beforeEach(() => render(<ContentTabs summary={summary} />));

  it("shows weapons as cards on the Ações tab by default", () => {
    expect(screen.getByText("Adaga")).toBeInTheDocument();
  });

  it("shows an intentional empty state on the Magias tab for a non-caster", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Magias/ }));
    expect(screen.getByText(/não possui magias|Nenhuma magia/i)).toBeInTheDocument();
  });

  it("filters features by origin on the Características tab", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Características/ }));
    expect(screen.getByText("Conjuração")).toBeInTheDocument();
    expect(screen.getByText("Visão no Escuro")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Espécie" }));
    expect(screen.queryByText("Conjuração")).not.toBeInTheDocument();
    expect(screen.getByText("Visão no Escuro")).toBeInTheDocument();
  });

  it("opens the detail modal when a weapon card is clicked", () => {
    fireEvent.click(screen.getByText("Adaga"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("1d4+3 Perfurante")).toBeInTheDocument();
  });

  it("has a fixed-height scrollable tabpanel container", () => {
    const panel = screen.getByRole("tabpanel");
    expect(panel.className).toMatch(/overflow-y-auto/);
  });

  it("shows five coin cards and a carga card on the Inventário tab", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventário/ }));
    expect(screen.getByText("PL")).toBeInTheDocument();
    expect(screen.getByText("PO")).toBeInTheDocument();
    expect(screen.getByText("PE")).toBeInTheDocument();
    expect(screen.getByText("PP")).toBeInTheDocument();
    expect(screen.getByText("PC")).toBeInTheDocument();
    expect(screen.getByText("10 / 50 kg")).toBeInTheDocument();
  });

  it("calls adjustCoin when clicking the increase button for PO", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventário/ }));
    fireEvent.click(screen.getByRole("button", { name: "Aumentar PO" }));
    expect(adjustCoin).toHaveBeenCalledWith("po", 1);
  });

  it("filters inventory to weapons only via the Armas chip", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Inventário/ }));
    expect(screen.getByText("Grimório")).toBeInTheDocument();
    expect(screen.getByText("Espada Longa")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Armas" }));
    expect(screen.queryByText("Grimório")).not.toBeInTheDocument();
    expect(screen.getByText("Espada Longa")).toBeInTheDocument();
  });
});
