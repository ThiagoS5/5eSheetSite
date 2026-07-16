/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CharacterSheetView } from "@/src/components/pages/CharacterSheetView";

const mocks = vi.hoisted(() => ({
  buildPdfDocument: vi.fn(() => "pdf-document"),
  createFoundryCharacterExport: vi.fn(() => ({ type: "foundry-export" })),
  pdf: vi.fn(() => ({
    toBlob: vi.fn(async () => new Blob(["%PDF"], { type: "application/pdf" })),
  })),
  serializeCharacterExport: vi.fn(() => "{\"format\":\"forge-fate.character\"}"),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Level Up</button>,
}));

vi.mock("@react-pdf/renderer", () => ({
  pdf: mocks.pdf,
}));

vi.mock("@/src/adapters/pdfAdapter", () => ({
  buildPdfDocument: mocks.buildPdfDocument,
}));

vi.mock("@/src/utils/foundryAdapter", () => ({
  createFoundryCharacterExport: mocks.createFoundryCharacterExport,
}));

vi.mock("@/src/utils/canonicalExport", () => ({
  serializeCharacterExport: mocks.serializeCharacterExport,
}));

vi.mock("@/src/store/useCharacterBuilderState", () => ({
  useCharacterBuilderState: () => ({ selectedClassId: "wizard-xphb", selectedBackgroundId: "sage-xphb" }),
}));
vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({
      description: { notas: "", nome: "Thalindra", historia: "" },
      characterBuild: { exportMetadata: { saveId: "sheet-test" } },
      setDescriptionField: () => {},
    }),
}));
vi.mock("@/src/store/characterSelectors", () => ({
  selectDerivedSheet: () => ({
    ruleset: "2024", name: "Thalindra", level: 5, className: "Wizard", speciesName: "High Elf",
    backgroundName: "Sage", armorClass: 13, initiative: 3, speedFeet: 30, currentHp: 27, maxHp: 27,
    proficiencyBonus: 3, attributes: [], skills: [], savingThrows: [], features: [], weapons: [],
    selectedEquipment: [], isSpellcaster: false, resistances: [], immunities: [], vulnerabilities: [],
    passives: { perception: 11, investigation: 11, insight: 13 }, senses: [], languages: [],
    inventory: [], money: { pc: 0, pp: 0, pe: 0, po: 12, pl: 0 }, carry: { currentKg: 0, maxKg: 75 },
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

  it("renders a single card: hero plus tabs, with Sheet and Notes tabs available", () => {
    render(<CharacterSheetView />);
    expect(screen.getByRole("tab", { name: /sheet/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /notes/i })).toBeInTheDocument();
  });

  it("renders the Sheet tab content only once (no duplicate loose panels)", () => {
    render(<CharacterSheetView />);
    fireEvent.click(screen.getByRole("tab", { name: /sheet/i }));
    expect(screen.getAllByText("Saving Throws")).toHaveLength(1);
  });

  it("downloads the printable PDF from the Export PDF action", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:sheet");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    render(<CharacterSheetView />);
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));

    await waitFor(() => {
      expect(mocks.buildPdfDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          summary: expect.objectContaining({ name: "Thalindra" }),
          description: expect.objectContaining({ nome: "Thalindra" }),
        }),
      );
      expect(click).toHaveBeenCalledTimes(1);
    });

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:sheet");
  });

  it("downloads Foundry JSON from the Foundry export action", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("thalindra-foundry-vtt.json");
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:foundry");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    render(<CharacterSheetView />);
    fireEvent.click(screen.getByRole("button", { name: "Export Foundry VTT JSON" }));

    expect(mocks.createFoundryCharacterExport).toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("downloads canonical Forge & Fate JSON from the canonical export action", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("thalindra-forge-fate.json");
    });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:forge-fate");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    render(<CharacterSheetView />);
    fireEvent.click(screen.getByRole("button", { name: "Export Forge & Fate JSON" }));

    expect(mocks.serializeCharacterExport).toHaveBeenCalledWith(
      expect.objectContaining({ exportMetadata: { saveId: "sheet-test" } }),
    );
    expect(click).toHaveBeenCalledTimes(1);
  });
});
