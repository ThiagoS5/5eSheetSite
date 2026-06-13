/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderEquipmentOptions,
  getBuilderLanguages,
  getBuilderSpecies,
} from "@/services/builderDataService";
import { CharacterStoreProvider, useCharacterStore } from "@/store/useCharacterStore";
import { BuilderStepPanel } from "@/src/components/pages/BuilderStepPanel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const builderData = {
  species: getBuilderSpecies(),
  classes: getBuilderClasses(),
  backgrounds: getBuilderBackgrounds(),
  equipment: getBuilderEquipmentOptions(),
  languages: getBuilderLanguages(),
};

describe("BuilderStepPanel", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("renders class cards with separated labels, values, and footer actions", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.queryByText("Etapa válida.")).not.toBeInTheDocument();
    expect(screen.queryByText("Etapa inválida.")).not.toBeInTheDocument();
    expect(screen.getAllByText("Primary Ability:")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Proficiências de Armadura:")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Recursos de Nível 1")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "SELECT" })[0]).toBeInTheDocument();
  });

  it("opens class details without the generic description and renders accordion items", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "DETAILS" })[0]);

    expect(screen.queryByText(/Progressao completa/i)).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Descricao")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Level 1:/i })[0]).toBeInTheDocument();
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
  it("renders background rewards before ability bonus controls", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("Recompensas")[0]).toBeInTheDocument();
    });
    expect(screen.getAllByText("Bonus de atributo")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "SELECT" })[0]).toBeInTheDocument();
  });

  it("opens background details without duplicated empty reward rows", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "DETAILS" })[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "DETAILS" })[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Lore")).toBeInTheDocument();
    expect(screen.getAllByText("Recompensas")[0]).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Detalhes" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Ability Scores::/i)).not.toBeInTheDocument();
  });

  it("renders species card actions in the footer like class cards", () => {
    render(
      <CharacterStoreProvider>
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    const detailsButton = screen.getAllByRole("button", { name: "DETAILS" })[0];
    const selectButton = screen.getAllByRole("button", { name: "SELECIONAR" })[0];

    expect(screen.queryByRole("button", { name: "Selecionar" })).not.toBeInTheDocument();
    expect(detailsButton.parentElement).toBe(selectButton.parentElement);
    expect(detailsButton.parentElement).toHaveClass("flex", "w-full", "gap-2");
    expect(detailsButton).toHaveClass("flex-1");
    expect(selectButton).toHaveClass("flex-1");
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
  const setEquipmentAcquisitionMode = useCharacterStore(
    (state) => state.setEquipmentAcquisitionMode,
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
    setEquipmentAcquisitionMode("gold");
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
    setEquipmentAcquisitionMode,
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
