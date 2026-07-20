/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveCharacter } from "@/src/services/characterService";
import {
  CURRENT_GLOBAL_PREFERENCES_VERSION,
  readGlobalPreferences,
} from "@/src/services/preferencesService";
import { getBuilderBackgrounds, getBuilderClasses, getBuilderLanguages } from "@/src/services/ruleService";
import {
  createCharacterBuildFromLegacyState,
  createEmptyCharacterBuild,
} from "@/src/store/characterBuildModel";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";
import { Dashboard } from "@/src/components/pages/Dashboard";
import type { CharacterBuild } from "@/src/types/characterBuild";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

describe("Dashboard", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
    push.mockClear();
  });

  it("renders the empty state from local saves", async () => {
    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Create your first character" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        /The Vault stores drafts, living sheets, and characters ready for export./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Character/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Character Vault" })).not.toBeInTheDocument();
    expect(screen.queryByText("Aelarion Sunweaver")).not.toBeInTheDocument();
  });

  it("renders the import control in the empty state", async () => {
    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Create your first character" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/import foundry character file/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Import Sheet \(Foundry\)/i }),
    ).toBeInTheDocument();
  });

  it("renders saved local characters and the add-new card when populated", async () => {
    await saveCharacter(createDashboardBuild());

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Character Vault" })).toBeInTheDocument();
    });
    expect(screen.getByText("Brienne")).toBeInTheDocument();
    expect(screen.getByText("Fighter / Human / Background pending")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Export pending")).toBeInTheDocument();
    expect(screen.getByText("HP")).toBeInTheDocument();
    expect(screen.getByText("AC")).toBeInTheDocument();
    expect(screen.getAllByText("Create Character")).not.toHaveLength(0);
    expect(screen.queryByText("Shadow on the Wall")).not.toBeInTheDocument();
  });

  it("renders the import control in the populated state", async () => {
    await saveCharacter(createDashboardBuild());

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Character Vault" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/import foundry character file/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Import Sheet \(Foundry\)/i }),
    ).toBeInTheDocument();
  });

  it("creates a new local save and routes continue actions to the saved step", async () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        beginnerMode: false,
        creationDefaults: { activeSources: ["XPHB"], progressionMode: "xp" },
      }),
    );
    await saveCharacter(createDashboardBuild());

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Brienne")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: /Create Character/i })[0]);
    expect(push).toHaveBeenCalledWith("/builder/classe");
    expect(JSON.parse(localStorage.getItem("forge-fate-character-saves:v1") ?? "{}")).toBeTruthy();

    const continueButtons = screen.getAllByRole("button", { name: "Continue Creation" });

    fireEvent.click(continueButtons[continueButtons.length - 1]);
    expect(push).toHaveBeenCalledWith("/builder/equipamento");
  }, 15000);

  it("applies saved global source defaults to a new character", async () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
        beginnerMode: false,
        creationDefaults: {
          activeSources: ["XPHB"],
          progressionMode: "milestone",
        },
      }),
    );

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Character/i }));

    await waitFor(() => {
      const saves = JSON.parse(localStorage.getItem("forge-fate-character-saves:v1") ?? "{}");
      const savedBuild = Object.values(saves)[0] as CharacterBuild | undefined;
      expect(savedBuild?.choices.creationPreferences).toEqual({
        activeSources: ["XPHB"],
        progressionMode: "milestone",
        choiceLimits: "rules",
      });
    });
    expect(push).toHaveBeenCalledWith("/builder/classe");
  });

  it("applies saved global source defaults to quick builds", async () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        preferencesVersion: CURRENT_GLOBAL_PREFERENCES_VERSION,
        creationDefaults: {
          activeSources: ["XPHB"],
          progressionMode: "milestone",
        },
      }),
    );

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Character/i }));
    fireEvent.click(screen.getByRole("button", { name: "Martial Fighter" }));

    await waitFor(() => {
      const saves = JSON.parse(localStorage.getItem("forge-fate-character-saves:v1") ?? "{}");
      const savedBuild = Object.values(saves)[0] as CharacterBuild | undefined;
      expect(savedBuild?.choices.creationPreferences).toEqual({
        activeSources: ["XPHB"],
        progressionMode: "milestone",
        choiceLimits: "rules",
      });
    });
    expect(push).toHaveBeenCalledWith("/builder/descricao");
  });

  it("supports quick vault actions for saved characters", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await saveCharacter(createDashboardBuild());

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Brienne")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Duplicate Brienne" }));

    await waitFor(() => {
      expect(screen.getByText("Brienne (Copy)")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Brienne" }));

    await waitFor(() => {
      expect(screen.queryByText("Brienne")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Brienne (Copy)")).toBeInTheDocument();
  });

  it("exports a ready character as Forge & Fate JSON directly from the Vault", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("brienne-forge-fate.json");
    });
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:forge-fate");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    await saveCharacter(createExportReadyDashboardBuild());

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Brienne")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Export Forge & Fate JSON for Brienne" }));

    await waitFor(() => {
      expect(click).toHaveBeenCalledTimes(1);
    });
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(push).not.toHaveBeenCalledWith("/sheet");
  });

  it("asks for the creation mode before creating a character without saved beginner defaults", async () => {
    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Character/i }));

    expect(
      screen.getByRole("dialog", {
        name: "Is this your first time playing Dungeons & Dragons 5e?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Guided mode" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/builder/classe");
    });
    expect(readGlobalPreferences().beginnerMode).toBe(true);
    const saves = JSON.parse(localStorage.getItem("forge-fate-character-saves:v1") ?? "{}");
    const savedBuild = Object.values(saves)[0] as CharacterBuild;
    expect(savedBuild.choices.beginnerMode).toBe(true);
  });

  it("skips the creation mode dialog when beginner defaults already exist", async () => {
    localStorage.setItem(
      "forge-fate-preferences:v1",
      JSON.stringify({
        beginnerMode: false,
        creationDefaults: { activeSources: ["XPHB"], progressionMode: "xp" },
      }),
    );

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Create Character/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/builder/classe");
    });
    expect(
      screen.queryByRole("dialog", {
        name: "Is this your first time playing Dungeons & Dragons 5e?",
      }),
    ).not.toBeInTheDocument();
  });
});

function createDashboardBuild(): CharacterBuild {
  const build = createEmptyCharacterBuild({
    now: "2026-06-13T10:00:00.000Z",
    saveId: "save-brienne",
  });

  return {
    ...build,
    draft: {
      ...build.draft,
      currentStepSlug: "equipamento",
      description: {
        ...build.draft.description,
        nome: "Brienne",
      },
    },
    progression: {
      ...build.progression,
      level: 4,
    },
    choices: {
      ...build.choices,
      selectedClassId: "fighter-xphb",
      selectedSpeciesId: "human-xphb",
      baseAttributes: {
        forca: 15,
        destreza: 14,
        constituicao: 13,
        inteligencia: 12,
        sabedoria: 10,
        carisma: 8,
      },
    },
  };
}

function createExportReadyDashboardBuild(): CharacterBuild {
  const build = createEmptyCharacterBuild({
    now: "2026-06-13T10:00:00.000Z",
    saveId: "save-brienne-ready",
  });
  const fighter = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");
  const guard = getBuilderBackgrounds().find((entry) => entry.id === "guard-xphb");
  const languages = getBuilderLanguages().map((language) => language.name);

  if (!fighter || !guard) {
    throw new Error("expected fighter and guard fixtures to exist");
  }

  return createCharacterBuildFromLegacyState(
    {
      characterBuild: build,
      selectedClassId: fighter.id,
      selectedSpeciesId: "human-xphb",
      selectedBackgroundId: guard.id,
      maxUnlockedStepIndex: 9,
      selectedSubclassId: fighter.subclasses[0]?.id,
      classSkillProficiencies: fighter.skillChoices.chooseFrom.slice(0, fighter.skillChoices.count),
      classFeatureChoices: Object.fromEntries(
        fighter.featureChoiceGroups.map((group) => [
          group.id,
          group.options.slice(0, group.count).map((option) => option.value),
        ]),
      ),
      speciesLanguages: languages.slice(0, 2 + fighter.languageChoiceCount + guard.languageChoiceCount),
      attributeGenerationMethod: "standard-array",
      baseAttributes: {
        forca: 15,
        destreza: 14,
        constituicao: 13,
        inteligencia: 12,
        sabedoria: 10,
        carisma: 8,
      },
      backgroundAbilityBonuses: getTestBackgroundAbilityBonuses(guard),
      equipmentChoicesBySource: fighter.startingEquipmentPackages[0]
        ? {
            class: {
              mode: "items",
              selectedOptionId: fighter.startingEquipmentPackages[0].id,
            },
          }
        : {},
      description: {
        ...build.draft.description,
        nome: "Brienne",
      },
    },
    {
      createdAt: build.exportMetadata.createdAt,
      currentStepSlug: "conclusao",
      saveId: build.exportMetadata.saveId,
      updatedAt: build.exportMetadata.updatedAt,
    },
  );
}

function getTestBackgroundAbilityBonuses(
  background: ReturnType<typeof getBuilderBackgrounds>[number],
) {
  const option = background.abilityOptions[0];

  if (!option) {
    return {};
  }

  return Object.fromEntries(
    option.attributes.slice(0, option.mode === "+2/+1" ? 2 : 3).map((attribute, index) => [
      attribute,
      option.mode === "+2/+1" && index === 0 ? 2 : 1,
    ]),
  );
}
