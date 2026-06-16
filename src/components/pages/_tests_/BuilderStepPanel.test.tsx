/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderLanguages,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { BuilderStepPanel } from "@/src/components/pages/BuilderStepPanel";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const builderData = {
  species: getBuilderSpecies(),
  classes: getBuilderClasses(),
  backgrounds: getBuilderBackgrounds(),
  languages: getBuilderLanguages(),
  itemCatalog: getItemCatalog(),
};

describe("BuilderStepPanel", () => {
  afterEach(() => {
    cleanup();
    pushMock.mockClear();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("renders class cards with artwork, tags, resources, and footer actions", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.queryByText("Etapa válida.")).not.toBeInTheDocument();
    expect(screen.queryByText("Etapa inválida.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar classes")).toBeInTheDocument();
    expect(screen.getByText(/classes encontradas/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /fighter artwork/i })).toBeInTheDocument();
    expect(screen.getAllByText(/DADO DE VIDA/i)[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Recursos de Nível 1")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "SELECT" })[0]).toBeInTheDocument();
  });

  it("filters class cards by name, summary, source, and level one features", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.change(screen.getByLabelText("Filtrar classes"), {
      target: { value: "arcane recovery" },
    });

    expect(screen.getByRole("heading", { name: "Wizard" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Fighter" })).not.toBeInTheDocument();
    expect(screen.getByText("1 classe encontrada")).toBeInTheDocument();
  });

  it("renders an accessible empty state when no class matches the search", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.change(screen.getByLabelText("Filtrar classes"), {
      target: { value: "classe inexistente" },
    });

    expect(screen.getByText("Nenhuma classe encontrada")).toBeInTheDocument();
    expect(
      screen.getByText("Tente buscar por nome, fonte ou recurso inicial."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SELECT" })).not.toBeInTheDocument();
  });

  it("opens class details in the new class modal layout", () => {
    const firstClass = builderData.classes[0];

    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "DETAILS" })[0]);

    expect(screen.queryByText(/Progressao completa/i)).not.toBeInTheDocument();
    const detailsDialog = screen.getByRole("dialog", { name: firstClass.name });
    const detailsImage = within(detailsDialog).getByRole("img", {
      name: firstClass.image?.alt,
    });

    expect(detailsDialog).toBeInTheDocument();
    expect(detailsImage).toHaveClass("object-cover", "object-top");
    expect(screen.getByText("Identidade da classe")).toBeInTheDocument();
    expect(screen.getByText("Atributo Primario")).toBeInTheDocument();
    expect(screen.getByText("Dado de Vida")).toBeInTheDocument();
    expect(screen.getByText("Proficiencias Iniciais")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Descricao" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Progress.*Classe/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Fechar detalhes de ${firstClass.name}` }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selecionar Classe" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getAllByRole("button", { name: /Level 1:/i })[0]).toBeInTheDocument();
  });

  it("selects a class from the details modal and persists the builder advance", async () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "DETAILS" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Selecionar Classe" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Classe Selecionada" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    await waitFor(() => {
      const saves = JSON.parse(
        localStorage.getItem("forge-fate-character-saves:v1") ?? "{}",
      );

      expect(Object.values(saves)[0]).toMatchObject({
        draft: {
          currentStepSlug: "recursos-classe",
          maxUnlockedStepIndex: 1,
        },
      });
    });
  });

  it("persists the active build when advancing through a wizard step", async () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "SELECT" })[0]);

    await waitFor(() => {
      const saves = JSON.parse(
        localStorage.getItem("forge-fate-character-saves:v1") ?? "{}",
      );

      expect(Object.values(saves)[0]).toMatchObject({
        draft: {
          currentStepSlug: "recursos-classe",
          maxUnlockedStepIndex: 1,
        },
      });
    });
  });

  it("removes training level selects from class resources and shows initial proficiencies", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedClassInitializer />
        <BuilderStepPanel step="recursos-classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("PROFICIÊNCIAS INICIAIS DA CLASSE")).toBeInTheDocument();
    });
    expect(screen.queryByText("Nivel de treinamento")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Weapon Mastery/)[0]).toBeInTheDocument();
    expect(screen.getByText("Armaduras:")).toBeInTheDocument();
    expect(screen.getByText("Recursos Iniciais de Nível 1:")).toBeInTheDocument();
  });
  it("renders background cards with artwork, content, actions, and accessible bonus controls", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Acolyte" })).toBeInTheDocument();
    });
    expect(screen.getAllByRole("img", { name: /artwork/i })[0]).toBeInTheDocument();
    expect(screen.getAllByText("Talento de Origem")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Bonus de Atributo/i)[0]).toBeInTheDocument();
    expect(
      screen.getByLabelText("Acolyte: atributo com bonus +2"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Acolyte: atributo com bonus +1"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "SELECIONAR" })[0],
    ).toBeInTheDocument();
  });

  it("filters background cards by name, origin feat, and description", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Filtrar antecedentes")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Filtrar antecedentes"), {
      target: { value: "magic initiate cleric" },
    });

    expect(screen.getByRole("heading", { name: "Acolyte" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Soldier" })).not.toBeInTheDocument();
    expect(screen.getByText(/antecedente encontrado/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filtrar antecedentes"), {
      target: { value: "antecedente inexistente" },
    });

    expect(screen.getByText("Nenhum antecedente encontrado")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "SELECIONAR" }),
    ).not.toBeInTheDocument();
  });

  it("opens the background details modal with real rewards and an accessible close button", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    });

    const acolyteCard = screen
      .getByRole("heading", { name: "Acolyte" })
      .closest("article");

    expect(acolyteCard).not.toBeNull();
    fireEvent.click(within(acolyteCard as HTMLElement).getByRole("button", { name: "DETAILS" }));

    const dialog = screen.getByRole("dialog", { name: "Acolyte" });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Recompensas")).toBeInTheDocument();
    expect(within(dialog).getByText("Talento de Origem")).toBeInTheDocument();
    expect(within(dialog).getByText("Bonus de Atributo")).toBeInTheDocument();
    expect(within(dialog).getByText("Proficiencias")).toBeInTheDocument();
    expect(within(dialog).getByText("Equipamento Inicial")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Fechar detalhes" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Detalhes" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Ability Scores::/i)).not.toBeInTheDocument();
  });

  it("selects a background from the modal and advances only after valid bonuses", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundWithBonusesInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    });

    const acolyteCard = screen
      .getByRole("heading", { name: "Acolyte" })
      .closest("article");

    expect(acolyteCard).not.toBeNull();
    fireEvent.click(within(acolyteCard as HTMLElement).getByRole("button", { name: "DETAILS" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Acolyte" })).getByRole("button", {
        name: "SELECIONADO",
      }),
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/builder/especie");
    });

    await waitFor(() => {
      const saves = JSON.parse(
        localStorage.getItem("forge-fate-character-saves:v1") ?? "{}",
      );

      expect(Object.values(saves)[0]).toMatchObject({
        draft: {
          currentStepSlug: "especie",
          maxUnlockedStepIndex: 3,
        },
      });
    });
  });

  it("renders species cards with the class card visual system", () => {
    const firstSpecies = builderData.species.find(
      (entry) => entry.image && entry.traits.length > 0,
    ) ?? builderData.species[0];

    render(
      <CharacterStoreProvider>
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByLabelText("Filtrar especies")).toBeInTheDocument();
    expect(screen.getByText(/especies encontradas/i)).toBeInTheDocument();

    const speciesHeading = screen.getByRole("heading", { name: firstSpecies.name });
    const speciesCard = speciesHeading.closest("article");
    const speciesGrid = speciesCard?.parentElement;

    expect(speciesGrid).toHaveClass(
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
    );
    expect(screen.getAllByText(firstSpecies.source)[0]).toBeInTheDocument();
    expect(screen.getByText(firstSpecies.summary)).toHaveClass("line-clamp-2");
    expect(screen.getAllByText("Tamanho")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Deslocamento")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Tracos Raciais")[0]).toBeInTheDocument();
    if (firstSpecies.image) {
      expect(screen.getAllByRole("img", { name: firstSpecies.image.alt })[0]).toHaveClass(
        "object-cover",
        "object-top",
      );
    }

    const detailsButton = screen.getAllByRole("button", { name: "DETAILS" })[0];
    const selectButton = screen.getAllByRole("button", { name: "SELECT" })[0];

    expect(screen.queryByRole("button", { name: "Selecionar" })).not.toBeInTheDocument();
    expect(detailsButton.parentElement).toBe(selectButton.parentElement);
    expect(detailsButton.parentElement).toHaveClass("flex", "w-full", "gap-2");
    expect(detailsButton).toHaveClass("flex-1");
    expect(selectButton).toHaveClass("flex-1");
  });

  it("opens species details in the split-pane species modal layout", () => {
    const firstSpecies = builderData.species.find(
      (entry) => entry.image && entry.traits.length > 0,
    ) ?? builderData.species[0];

    render(
      <CharacterStoreProvider>
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "DETAILS" })[0]);

    const detailsDialog = screen.getByRole("dialog", { name: firstSpecies.name });

    expect(within(detailsDialog).getByRole("heading", { name: "Descricao" })).toBeInTheDocument();
    expect(
      within(detailsDialog).getByRole("heading", { name: "Tracos Raciais" }),
    ).toBeInTheDocument();
    expect(within(detailsDialog).getByText("Tamanho")).toBeInTheDocument();
    expect(within(detailsDialog).getByText("Deslocamento")).toBeInTheDocument();
    if (firstSpecies.image) {
      expect(within(detailsDialog).getByRole("img", { name: firstSpecies.image.alt })).toHaveClass(
        "object-cover",
        "object-top",
      );
    }
    expect(
      within(detailsDialog).getByRole("button", { name: "Selecionar Raça" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("selects a species from the details modal without changing the wizard route", async () => {
    render(
      <CharacterStoreProvider>
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "DETAILS" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Selecionar Raça" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Espécie Selecionada" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("lists rare and exotic languages in species details", async () => {
    render(
      <CharacterStoreProvider>
        <SpeciesDetailsInitializer />
        <BuilderStepPanel step="detalhes-especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Raros e Exoticos")).toBeInTheDocument();
    });
    expect(screen.getByText("Abyssal")).toBeInTheDocument();
  });

  it("renders description as its own unlocked step", async () => {
    render(
      <CharacterStoreProvider>
        <UnlockedDescriptionInitializer />
        <BuilderStepPanel step="descricao" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Descricao" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.queryByText("Etapa válida.")).not.toBeInTheDocument();
  });
});

function SelectedClassInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const unlockStep = useCharacterStore((state) => state.unlockStep);
  const setClassFeatureChoice = useCharacterStore(
    (state) => state.setClassFeatureChoice,
  );

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics", "Perception"]);
    setClassFeatureChoice("weapon-mastery", getFighterWeaponMasteries());
    unlockStep(1);
  }, [selectClass, setClassSkillProficiencies, setClassFeatureChoice, unlockStep]);

  return null;
}

function SelectedBackgroundInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const setClassFeatureChoice = useCharacterStore(
    (state) => state.setClassFeatureChoice,
  );
  const selectBackground = useCharacterStore((state) => state.selectBackground);
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics", "Perception"]);
    setClassFeatureChoice("weapon-mastery", getFighterWeaponMasteries());
    selectBackground("acolyte-xphb");
    unlockStep(2);
  }, [
    selectClass,
    setClassSkillProficiencies,
    setClassFeatureChoice,
    selectBackground,
    unlockStep,
  ]);

  return null;
}

function SelectedBackgroundWithBonusesInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const setClassFeatureChoice = useCharacterStore(
    (state) => state.setClassFeatureChoice,
  );
  const selectBackground = useCharacterStore((state) => state.selectBackground);
  const setBackgroundAbilityBonuses = useCharacterStore(
    (state) => state.setBackgroundAbilityBonuses,
  );
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics", "Perception"]);
    setClassFeatureChoice("weapon-mastery", getFighterWeaponMasteries());
    selectBackground("acolyte-xphb");
    setBackgroundAbilityBonuses({ inteligencia: 2, sabedoria: 1 });
    unlockStep(2);
  }, [
    selectClass,
    setClassSkillProficiencies,
    setClassFeatureChoice,
    selectBackground,
    setBackgroundAbilityBonuses,
    unlockStep,
  ]);

  return null;
}

function SpeciesDetailsInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const setClassFeatureChoice = useCharacterStore(
    (state) => state.setClassFeatureChoice,
  );
  const selectBackground = useCharacterStore((state) => state.selectBackground);
  const setBackgroundAbilityBonuses = useCharacterStore(
    (state) => state.setBackgroundAbilityBonuses,
  );
  const selectSpecies = useCharacterStore((state) => state.selectSpecies);
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics", "Perception"]);
    setClassFeatureChoice("weapon-mastery", getFighterWeaponMasteries());
    selectBackground("acolyte-xphb");
    setBackgroundAbilityBonuses({ inteligencia: 2, sabedoria: 1 });
    selectSpecies("human-xphb");
    unlockStep(4);
  }, [
    selectClass,
    setClassSkillProficiencies,
    setClassFeatureChoice,
    selectBackground,
    setBackgroundAbilityBonuses,
    selectSpecies,
    unlockStep,
  ]);

  return null;
}

function UnlockedSpeciesInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const setClassFeatureChoice = useCharacterStore(
    (state) => state.setClassFeatureChoice,
  );
  const selectBackground = useCharacterStore((state) => state.selectBackground);
  const setBackgroundAbilityBonuses = useCharacterStore(
    (state) => state.setBackgroundAbilityBonuses,
  );
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics", "Perception"]);
    setClassFeatureChoice("weapon-mastery", getFighterWeaponMasteries());
    selectBackground("acolyte-xphb");
    setBackgroundAbilityBonuses({ inteligencia: 2, sabedoria: 1 });
    unlockStep(3);
  }, [
    selectClass,
    setClassSkillProficiencies,
    setClassFeatureChoice,
    selectBackground,
    setBackgroundAbilityBonuses,
    unlockStep,
  ]);

  return null;
}

function UnlockedDescriptionInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const setClassFeatureChoice = useCharacterStore(
    (state) => state.setClassFeatureChoice,
  );
  const selectBackground = useCharacterStore((state) => state.selectBackground);
  const setBackgroundAbilityBonuses = useCharacterStore(
    (state) => state.setBackgroundAbilityBonuses,
  );
  const selectSpecies = useCharacterStore((state) => state.selectSpecies);
  const setSpeciesLanguages = useCharacterStore((state) => state.setSpeciesLanguages);
  const setAttributeGenerationMethod = useCharacterStore(
    (state) => state.setAttributeGenerationMethod,
  );
  const setEquipmentSourceMode = useCharacterStore(
    (state) => state.setEquipmentSourceMode,
  );
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics", "Perception"]);
    setClassFeatureChoice("weapon-mastery", getFighterWeaponMasteries());
    selectBackground("acolyte-xphb");
    setBackgroundAbilityBonuses({ inteligencia: 2, sabedoria: 1 });
    selectSpecies("human-xphb");
    setSpeciesLanguages(["Common", "Draconic"]);
    setAttributeGenerationMethod("standard-array");
    setEquipmentSourceMode("class", "gold");
    unlockStep(7);
  }, [
    selectClass,
    setClassSkillProficiencies,
    setClassFeatureChoice,
    selectBackground,
    setBackgroundAbilityBonuses,
    selectSpecies,
    setSpeciesLanguages,
    setAttributeGenerationMethod,
    setEquipmentSourceMode,
    unlockStep,
  ]);

  return null;
}

function getFighterWeaponMasteries(): string[] {
  const fighter = builderData.classes.find((entry) => entry.id === "fighter-xphb");

  return fighter?.featureChoiceGroups[0]?.options
    .slice(0, 3)
    .map((option) => option.value) ?? [];
}
