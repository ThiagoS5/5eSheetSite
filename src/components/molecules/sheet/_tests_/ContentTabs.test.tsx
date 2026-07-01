/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import type { CharacterSheetSummary } from "@/types/builder";

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({ description: { notas: "" }, setDescriptionField: () => {} }),
}));

const summary = {
  isSpellcaster: false,
  weapons: [{ name: "Adaga", attackBonus: "+6", damage: "1d4+3 Perfurante", notes: "Acuidade" }],
  selectedEquipment: [
    { id: "grimoire", name: "Grimório", source: "Mago", sourceType: "class", value: 50 },
  ],
  features: [
    { name: "Conjuração", description: "…", source: "class" },
    { name: "Visão no Escuro", description: "…", source: "species" },
  ],
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
});
