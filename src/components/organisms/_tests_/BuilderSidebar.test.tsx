/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/builder/recursos-classe",
}));

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: <T,>(selector: (state: CharacterBuilderState) => T) =>
    selector({
      ruleset: "2024",
      level: 1,
      selectedSpeciesId: "",
      selectedClassId: "fighter-xphb",
      selectedSubclassId: "",
      selectedBackgroundId: "",
      inventory: [],
      equipmentChoicesBySource: {},
      maxUnlockedStepIndex: 8,
      pendingChoiceIds: [],
      classSkillProficiencies: [],
      skillTraining: {},
      classFeatureChoices: {},
      asiOrFeatByLevel: {},
      speciesChoices: {},
      speciesLanguages: [],
      attributeGenerationMethod: "standard-array",
      baseAttributes: {
        forca: 15,
        destreza: 14,
        constituicao: 13,
        inteligencia: 12,
        sabedoria: 10,
        carisma: 8,
      },
      backgroundAbilityBonuses: {},
      description: {
        nome: "",
        alinhamento: "",
        faith: "",
        lifestyle: "",
        age: "",
        height: "",
        weight: "",
        eyes: "",
        skin: "",
        hair: "",
        gender: "",
        aparencia: "",
        personalidade: "",
        tracos: "",
        notas: "",
      },
      money: { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 },
      moneyTouched: false,
      carriedLoadKg: 0,
      skillModifierOverrides: {},
      hpRollByLevel: {},
    }),
}));

describe("BuilderSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the DDB-inspired builder steps as keyboard-accessible links", () => {
    renderSidebar();

    fireEvent.click(screen.getByRole("button", { name: "Raca/Especie" }));

    expect(
      screen.getByRole("navigation", { name: "Etapas do Character Builder" }),
    ).toBeInTheDocument();

    const links = screen.getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toStrictEqual([
      "/builder/classe",
      "/builder/recursos-classe",
      "/builder/antecedente",
      "/builder/especie",
      "/builder/detalhes-especie",
      "/builder/atributos",
      "/builder/equipamento",
      "/builder/descricao",
      "/builder/conclusao",
    ]);
  });

  it("marks the current step with aria-current", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Recursos de Classe" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByRole("link", { name: "Classe" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders grouped shadcn sidebar sections with progress and guide lines", () => {
    renderSidebar();

    expect(screen.getByTitle("Fechar barra lateral (Ctrl+B)")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /Progresso do wizard/i }),
    ).toHaveAttribute("aria-valuenow", "22.22222222222222");
    expect(screen.getByRole("button", { name: "Classe" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Raca/Especie" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(document.querySelector('[data-sidebar="menu-sub"]')).toHaveClass(
      "border-l",
      "border-border",
      "ml-3",
      "pl-3",
    );
  });

  it("uses real store status for completed child items", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Classe" })).toHaveClass(
      "text-brand-green",
    );
    expect(document.querySelector(".fa-check")).toBeInTheDocument();
  });

  it("marks available steps with typed pendencies as warnings", () => {
    renderSidebar();

    const backgroundLink = screen.getByRole("link", { name: /Antecedente/ });
    expect(backgroundLink).toHaveClass("text-accent");
    expect(backgroundLink).toHaveTextContent("1 pendencias");
    expect(document.querySelector(".fa-triangle-exclamation")).toBeInTheDocument();
  });

  it("renders mapped FontAwesome icons for builder steps", () => {
    renderSidebar();

    expect(document.querySelector(".fa-wand")).toBeInTheDocument();
    expect(document.querySelector(".fa-scroll-old")).toBeInTheDocument();
    expect(document.querySelector(".fa-dragon")).toBeInTheDocument();
    expect(document.querySelector(".fa-dice-d20")).toBeInTheDocument();
    expect(document.querySelector(".fa-backpack")).toBeInTheDocument();
    expect(document.querySelector(".fa-feather-pointed")).toBeInTheDocument();
    expect(document.querySelector(".fa-flag-pennant")).toBeInTheDocument();
  });

  it("uses icon collapsible mode without rendering the old internal toggle", () => {
    renderSidebar(true);

    expect(screen.getByTitle("Abrir barra lateral (Ctrl+B)")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-collapsible",
      "icon",
    );
    expect(
      screen.queryByRole("button", { name: /Recolher sidebar|Expandir sidebar/i }),
    ).not.toBeInTheDocument();
  });

  it("renders without the 'hidden' wrapper class when variant is drawer", () => {
    render(
      <SidebarProvider open>
        <BuilderSidebar variant="drawer" />
      </SidebarProvider>,
    );

    const asideElement = screen
      .getByRole("navigation", { name: "Etapas do Character Builder" })
      .closest("aside");

    expect(asideElement).not.toHaveClass("hidden");
    expect(asideElement).toHaveClass("flex");
    expect(screen.getByText("FORGE & FATE")).toBeInTheDocument();
  });

  it("keeps the desktop variant byte-identical (hidden until xl breakpoint)", () => {
    renderSidebar();

    const asideElement = screen
      .getByRole("navigation", { name: "Etapas do Character Builder" })
      .closest("aside");

    expect(asideElement).toHaveClass("hidden", "xl:flex");
  });
});

function renderSidebar(collapsed = false) {
  return render(
    <SidebarProvider open={!collapsed}>
      <BuilderSidebar />
    </SidebarProvider>,
  );
}
