/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveCharacter } from "@/src/services/characterService";
import { readGlobalPreferences } from "@/src/services/preferencesService";
import { createEmptyCharacterBuild } from "@/src/store/characterBuildModel";
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
    push.mockClear();
  });

  it("renders the empty state from local saves", async () => {
    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Forje Sua Alma" })).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "Nenhum heroi forjado ainda. Inicie sua jornada criando um novo personagem.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Criar Novo Personagem/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bem-vindo, Arquiteto")).not.toBeInTheDocument();
    expect(screen.queryByText("Aelarion Sunweaver")).not.toBeInTheDocument();
  });

  it("renders saved local characters and the add-new card when populated", async () => {
    await saveCharacter(createDashboardBuild());

    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Bem-vindo, Arquiteto" })).toBeInTheDocument();
    });
    expect(screen.getByText("Brienne")).toBeInTheDocument();
    expect(screen.getByText("Human / Fighter")).toBeInTheDocument();
    expect(screen.getByText("Level 4")).toBeInTheDocument();
    expect(screen.getByText("Novo Heroi")).toBeInTheDocument();
    expect(screen.queryByText("Shadow on the Wall")).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByText("Novo Heroi"));
    expect(push).toHaveBeenCalledWith("/builder/classe");
    expect(JSON.parse(localStorage.getItem("forge-fate-character-saves:v1") ?? "{}")).toBeTruthy();

    const continueButtons = screen.getAllByRole("button", { name: "Continuar" });

    fireEvent.click(continueButtons[continueButtons.length - 1]);
    expect(push).toHaveBeenCalledWith("/builder/equipamento");
  });

  it("asks for the creation mode before creating a character without saved beginner defaults", async () => {
    render(
      <CharacterStoreProvider>
        <Dashboard />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Criar Novo Personagem/i }));

    expect(
      screen.getByRole("dialog", {
        name: "E sua primeira vez jogando Dungeons & Dragons 5e?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Modo Guiado" }));

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

    fireEvent.click(screen.getByRole("button", { name: /Criar Novo Personagem/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/builder/classe");
    });
    expect(
      screen.queryByRole("dialog", {
        name: "E sua primeira vez jogando Dungeons & Dragons 5e?",
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
