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
import { getSpellById } from "@/src/services/spellService";
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

    expect(screen.queryByText("Step valid.")).not.toBeInTheDocument();
    expect(screen.queryByText("Step invalid.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Filter classes")).toBeInTheDocument();
    expect(screen.getByText(/classes found/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /fighter artwork/i })).toBeInTheDocument();
    expect(screen.getAllByText("Martial")[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Learn More" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Select" })[0]).toBeInTheDocument();
  });

  it("turns a locked step into a recoverable checklist with a repair action", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="atributos" {...builderData} />
      </CharacterStoreProvider>,
    );


    expect(screen.getByText("This step is sealed")).toBeInTheDocument();
    expect(screen.getByText("Finish these to continue:")).toBeInTheDocument();


    const continueButton = screen.getByRole("button", { name: /Continue from/i });
    expect(continueButton).toHaveTextContent("Class");
    fireEvent.click(continueButton);
    expect(pushMock).toHaveBeenCalledWith("/builder/classe");
  });

  it("shows the beginner class quiz only when guided mode is enabled", () => {
    render(
      <CharacterStoreProvider>
        <GuidedModeInitializer />
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByText("What is a class?")).toBeInTheDocument();
    expect(screen.getByText("Not sure where to start?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Help me choose" }));

    expect(
      screen.getAllByText(/Answer 7 questions as the character you want to build/i)
        .length,
    ).toBeGreaterThan(0);


    for (let questionIndex = 1; questionIndex <= 7; questionIndex += 1) {
      expect(
        screen.getByText(`Question ${questionIndex} of 7`),
      ).toBeInTheDocument();
      fireEvent.click(screen.getAllByTestId("quiz-option")[0]);
    }

    // Resultado: exatamente 2 classes — principal (verde) e segunda opção
    // (âmbar) — com flags sobre os cards correspondentes da lista.
    expect(screen.getAllByText("Recommended")).toHaveLength(2);
    expect(screen.getByText("Second option")).toBeInTheDocument();
    expect(
      screen.getByTestId("recommendation-flag-primary"),
    ).toHaveTextContent("Recommended");
    expect(
      screen.getByTestId("recommendation-flag-secondary"),
    ).toHaveTextContent("2nd option");
    expect(
      screen.getByRole("button", { name: "Retake with new questions" }),
    ).toBeInTheDocument();
  }, 15000);

  it("shows an inline choice counter for class skills", () => {
    render(
      <CharacterStoreProvider>
        <OneSkillSelectedInitializer />
        <BuilderStepPanel step="recursos-classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByText("1 of 2 skills chosen")).toBeInTheDocument();
  });

  it("explains why Next is disabled", () => {
    render(
      <CharacterStoreProvider>
        <ClassOnlyInitializer />
        <BuilderStepPanel step="recursos-classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveAttribute("aria-describedby", "builder-next-blocker");
    expect(screen.queryByText("Step 2/9")).not.toBeInTheDocument();
    expect(screen.getByText(/Choose 2 class skills to continue/i)).toHaveAttribute(
      "id",
      "builder-next-blocker",
    );
  });

  it("shows a dependent choice diff before replacing the selected class", () => {
    render(
      <CharacterStoreProvider>
        <SelectedClassInitializer />
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    const barbarianCard = screen.getByRole("heading", { name: "Barbarian" }).closest("article");

    expect(barbarianCard).not.toBeNull();
    fireEvent.click(
      within(barbarianCard as HTMLElement).getByRole("button", { name: "Select" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Change class" });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("2 class skills")).toBeInTheDocument();
    expect(within(dialog).getByText("Weapon Mastery")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  }, 15000);

  it("does not change selectedClassId until the class change diff is confirmed", async () => {
    function SelectedClassIdProbe() {
      const selectedClassId = useCharacterStore((state) => state.selectedClassId);
      return <span data-testid="selected-class-id">{selectedClassId}</span>;
    }

    render(
      <CharacterStoreProvider>
        <SelectedClassInitializer />
        <SelectedClassIdProbe />
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("selected-class-id")).toHaveTextContent("fighter-xphb");
    });

    const barbarianCard = screen.getByRole("heading", { name: "Barbarian" }).closest("article");

    expect(barbarianCard).not.toBeNull();
    fireEvent.click(
      within(barbarianCard as HTMLElement).getByRole("button", { name: "Select" }),
    );

    expect(screen.getByRole("dialog", { name: "Change class" })).toBeInTheDocument();
    expect(screen.getByTestId("selected-class-id")).toHaveTextContent("fighter-xphb");

    fireEvent.click(screen.getByRole("button", { name: "Change class" }));

    await waitFor(() => {
      expect(screen.getByTestId("selected-class-id")).toHaveTextContent("barbarian-xphb");
    });
  }, 15000);

  it("filters class cards by name, summary, source, and level one features", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.change(screen.getByLabelText("Filter classes"), {
      target: { value: "arcane recovery" },
    });

    expect(screen.getByRole("heading", { name: "Wizard" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Fighter" })).not.toBeInTheDocument();
    expect(screen.getByText("1 class found")).toBeInTheDocument();
  });

  it("filters class options by active sources", () => {
    const legacyClass = {
      ...builderData.classes[0],
      id: "legacy-fighter-phb",
      name: "Legacy Fighter",
      source: "PHB",
    };

    render(
      <CharacterStoreProvider>
        <OnlyXphbSourcesInitializer />
        <BuilderStepPanel
          step="classe"
          {...builderData}
          classes={[legacyClass, ...builderData.classes]}
        />
      </CharacterStoreProvider>,
    );

    expect(
      screen.queryByRole("heading", { name: "Legacy Fighter" }),
    ).not.toBeInTheDocument();
  });

  it("preserves selected choices from disabled sources with a warning", async () => {
    const legacyClass = {
      ...builderData.classes[0],
      id: "legacy-fighter-phb",
      name: "Legacy Fighter",
      source: "PHB",
    };

    render(
      <CharacterStoreProvider>
        <LegacySourceSelectionInitializer />
        <BuilderStepPanel
          step="classe"
          {...builderData}
          classes={[legacyClass, ...builderData.classes]}
        />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Legacy Fighter" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Disabled source choices")).toHaveTextContent(
      "Class: Legacy Fighter (PHB)",
    );
  });

  it("warns when a saved feat choice uses a disabled source", async () => {
    render(
      <CharacterStoreProvider>
        <DisabledSourceFeatInitializer featId="legacy-feat-efa" />
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Disabled source choices")).toHaveTextContent(
        "Feat: Legacy Feat (EFA)",
      );
    });
  });

  it("warns when a saved spell choice uses a disabled source", async () => {
    const disabledSpell = getSpellById("air-bubble-aag");

    if (!disabledSpell) {
      throw new Error("expected Air Bubble from AAG in the spell catalog");
    }

    render(
      <CharacterStoreProvider>
        <DisabledSourceSpellInitializer spellId={disabledSpell.id} />
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Disabled source choices")).toHaveTextContent(
        `Spell: ${disabledSpell.name} (${disabledSpell.source})`,
      );
    });
  });

  it("renders an accessible empty state when no class matches the search", () => {
    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.change(screen.getByLabelText("Filter classes"), {
      target: { value: "classe inexistente" },
    });

    expect(screen.getByText("No class found")).toBeInTheDocument();
    expect(
      screen.getByText("Try searching by name, source, or starting feature."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Select" })).not.toBeInTheDocument();
  });

  it("opens class details in the new class modal layout", () => {
    const firstClass = builderData.classes[0];

    if (!firstClass) {
      throw new Error("expected at least one active class");
    }

    render(
      <CharacterStoreProvider>
        <BuilderStepPanel step="classe" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Learn More" })[0]);

    expect(screen.queryByText(/Complete progression/i)).not.toBeInTheDocument();
    const detailsDialog = screen.getByRole("dialog", { name: firstClass.name });
    const detailsImage = within(detailsDialog).getByRole("img", {
      name: firstClass.image?.alt,
    });

    expect(detailsDialog).toBeInTheDocument();
    expect(detailsDialog).toHaveClass(
      "h-[100svh]",
      "overflow-y-auto",
      "md:overflow-hidden",
    );
    expect(detailsImage).toHaveClass("object-cover", "object-top");
    expect(screen.getByText("Class Identity")).toBeInTheDocument();
    expect(screen.getByText("Primary Ability")).toBeInTheDocument();
    expect(screen.getAllByText("Hit Die")[0]).toBeInTheDocument();
    expect(screen.getByText("Starting Proficiencies")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Description" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Class Progression/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Class Progression/i }).closest("section"),
    ).toHaveClass("min-w-0");
    expect(
      screen.getByRole("button", { name: `Close ${firstClass.name} details` }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select Class" })).toHaveAttribute(
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

    fireEvent.click(screen.getAllByRole("button", { name: "Learn More" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Select Class" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Class Selected" })).toHaveAttribute(
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

    fireEvent.click(screen.getAllByRole("button", { name: "Select" })[0]);

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
      expect(screen.getByText("STARTING CLASS PROFICIENCIES")).toBeInTheDocument();
    });
    expect(screen.queryByText("Training level")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Weapon Mastery/)[0]).toBeInTheDocument();
    expect(screen.getByText("Armor:")).toBeInTheDocument();
    expect(screen.getByText("Starting Level 1 Features:")).toBeInTheDocument();
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
    expect(screen.getAllByText(/Magic Initiate/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Ability Score Bonus/i)[0]).toBeInTheDocument();
    expect(
      screen.getByLabelText("Acolyte: ability score with +2 bonus"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Acolyte: ability score with +1 bonus"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Learn More" })[0]).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "Select" })[0],
    ).toBeInTheDocument();
  }, 15000);

  it("filters background cards by name, origin feat, and description", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Filter backgrounds")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Filter backgrounds"), {
      target: { value: "magic initiate cleric" },
    });

    expect(screen.getByRole("heading", { name: "Acolyte" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Soldier" })).not.toBeInTheDocument();
    expect(screen.getByText(/background found/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter backgrounds"), {
      target: { value: "antecedente inexistente" },
    });

    expect(screen.getByText("No background found")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select" }),
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
      expect(screen.getAllByRole("button", { name: "Learn More" })[0]).toBeInTheDocument();
    });

    const acolyteCard = screen
      .getByRole("heading", { name: "Acolyte" })
      .closest("article");

    expect(acolyteCard).not.toBeNull();
    fireEvent.click(within(acolyteCard as HTMLElement).getByRole("button", { name: "Learn More" }));

    const dialog = screen.getByRole("dialog", { name: "Acolyte" });

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass(
      "h-[100svh]",
      "overflow-y-auto",
      "md:overflow-hidden",
    );
    expect(within(dialog).getByText("Rewards")).toBeInTheDocument();
    expect(within(dialog).getByText("Origin Feat")).toBeInTheDocument();
    expect(within(dialog).getByText("Ability Score Bonus")).toBeInTheDocument();
    expect(within(dialog).getByText("Proficiencies")).toBeInTheDocument();
    expect(within(dialog).getByText("Starting Equipment")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Close details" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Details" })).not.toBeInTheDocument();
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
      expect(screen.getAllByRole("button", { name: "Learn More" })[0]).toBeInTheDocument();
    });

    const acolyteCard = screen
      .getByRole("heading", { name: "Acolyte" })
      .closest("article");

    expect(acolyteCard).not.toBeNull();
    fireEvent.click(within(acolyteCard as HTMLElement).getByRole("button", { name: "Learn More" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Acolyte" })).getByRole("button", {
        name: "SELECTED",
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
          // v14: o step "subclasse" entrou antes de "antecedente"; especie é 4.
          maxUnlockedStepIndex: 4,
        },
      });
    });
  }, 15000);

  it("keeps the newly picked bonus when choosing it on a background before selecting the card", async () => {
    render(
      <CharacterStoreProvider>
        <SelectedBackgroundWithBonusesInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Soldier" })).toBeInTheDocument();
    });

    const plusTwoSelect = screen.getByLabelText(
      "Soldier: ability score with +2 bonus",
    ) as HTMLSelectElement;
    const firstAttribute = Array.from(plusTwoSelect.options)
      .map((option) => option.value)
      .find(Boolean);

    expect(firstAttribute).toBeTruthy();

    // Escolher o bonus em um antecedente ainda nao selecionado deve trocar a
    // selecao (o antecedente atual ja tem bonus, entao abre o aviso de troca).
    fireEvent.change(plusTwoSelect, { target: { value: firstAttribute } });

    const dialog = screen.getByRole("dialog", { name: "Change background" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Confirm change" }),
    );

    // O bonus recem-escolhido nao pode ser descartado pela troca de card.
    await waitFor(() => {
      expect(
        (
          screen.getByLabelText(
            "Soldier: ability score with +2 bonus",
          ) as HTMLSelectElement
        ).value,
      ).toBe(firstAttribute);
    });

    expect(
      screen.getByRole("heading", { name: "Soldier" }).closest("article"),
    ).toContainElement(
      screen.getByRole("button", { name: "Selected" }),
    );
  }, 15000);

  it("shows the guided background quiz with three recommendations", () => {
    render(
      <CharacterStoreProvider>
        <GuidedModeInitializer />
        <SelectedBackgroundInitializer />
        <BuilderStepPanel step="antecedente" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByText("Not sure which past fits?")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Help me choose a background" }),
    );

    expect(
      screen.getAllByText(/Answer 7 questions as the character you want to build/i)
        .length,
    ).toBeGreaterThan(0);

    for (let questionIndex = 1; questionIndex <= 7; questionIndex += 1) {
      expect(
        screen.getByText(`Question ${questionIndex} of 7`),
      ).toBeInTheDocument();
      fireEvent.click(screen.getAllByTestId("guided-quiz-option")[0]);
    }

    expect(screen.getAllByText(/Recommended Background/i)).toHaveLength(3);
    expect(screen.getByTestId("background-recommendation-flag-primary")).toHaveTextContent(
      "Recommended",
    );
  }, 15000);

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

    expect(screen.getByLabelText("Filter species")).toBeInTheDocument();
    expect(screen.getByText(/species found/i)).toBeInTheDocument();

    const speciesHeading = screen.getByRole("heading", { name: firstSpecies.name });
    const speciesCard = speciesHeading.closest("article");
    const speciesGrid = speciesCard?.parentElement?.parentElement;

    expect(speciesGrid).toHaveClass(
      "grid-cols-1",
      "md:grid-cols-2",
      "2xl:grid-cols-3",
    );
    expect(speciesGrid).not.toHaveClass("lg:grid-cols-3");
    expect(speciesGrid).not.toHaveClass("xl:grid-cols-4");
    expect(screen.getAllByText(firstSpecies.source)[0]).toBeInTheDocument();
    expect(screen.getByText(firstSpecies.summary)).toHaveClass("line-clamp-3");
    expect(screen.getAllByText(/Size:/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Speed:/)[0]).toBeInTheDocument();
    if (firstSpecies.image) {
      expect(
        screen.getAllByRole("img", { name: firstSpecies.image.alt })[0],
      ).toBeInTheDocument();
    }

    const detailsButton = screen.getAllByRole("button", { name: "Learn More" })[0];
    const selectButton = screen.getAllByRole("button", { name: "Select" })[0];

    expect(detailsButton.parentElement).toBe(selectButton.parentElement);
    expect(detailsButton.parentElement).toHaveClass("flex", "gap-2");
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

    fireEvent.click(screen.getAllByRole("button", { name: "Learn More" })[0]);

    const detailsDialog = screen.getByRole("dialog", { name: firstSpecies.name });

    expect(within(detailsDialog).getByRole("heading", { name: "Description" })).toBeInTheDocument();
    expect(
      within(detailsDialog).getByRole("heading", { name: "Species Traits" }),
    ).toBeInTheDocument();
    // A descrição rica (AST) pode repetir "Size"/"Speed" em tabelas de lore,
    // então os stats da sidebar são assertados por presença, não unicidade.
    expect(within(detailsDialog).getAllByText("Size").length).toBeGreaterThan(0);
    expect(within(detailsDialog).getAllByText("Speed").length).toBeGreaterThan(0);
    if (firstSpecies.image) {
      expect(within(detailsDialog).getByRole("img", { name: firstSpecies.image.alt })).toHaveClass(
        "object-cover",
        "object-top",
      );
    }
    expect(
      within(detailsDialog).getByRole("button", { name: "Select Species" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("selects a species from the details modal and advances to species details", async () => {
    render(
      <CharacterStoreProvider>
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Learn More" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Select Species" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/builder/detalhes-especie");
    });
  }, 15000);

  it("selects a species via the card SELECT button and advances to species details", async () => {
    render(
      <CharacterStoreProvider>
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Select" })[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Select" })[0]);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/builder/detalhes-especie");
    });
  });

  it("shows the guided species quiz with one recommendation and marks its card", () => {
    render(
      <CharacterStoreProvider>
        <GuidedModeInitializer />
        <UnlockedSpeciesInitializer />
        <BuilderStepPanel step="especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    expect(screen.getByText("Not sure which species fits?")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Help me choose a species" }),
    );

    expect(
      screen.getAllByText(/Answer 7 questions as the character you want to build/i)
        .length,
    ).toBeGreaterThan(0);

    for (let questionIndex = 1; questionIndex <= 7; questionIndex += 1) {
      expect(
        screen.getByText(`Question ${questionIndex} of 7`),
      ).toBeInTheDocument();
      fireEvent.click(screen.getAllByTestId("guided-quiz-option")[0]);
    }

    expect(screen.getByText("Recommended Species")).toBeInTheDocument();
    expect(screen.getByTestId("species-recommendation-flag-primary")).toHaveTextContent(
      "Recommended",
    );
  }, 15000);

  it("lists rare and exotic languages in species details", async () => {
    render(
      <CharacterStoreProvider>
        <SpeciesDetailsInitializer />
        <BuilderStepPanel step="detalhes-especie" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Rare and Exotic")).toBeInTheDocument();
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
      expect(screen.getByRole("heading", { name: "Identity" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Character Name")).toBeInTheDocument();
    expect(screen.queryByText("Step valid.")).not.toBeInTheDocument();
  });

  it("shows guided help beside description inputs instead of a header explainer", async () => {
    render(
      <CharacterStoreProvider>
        <GuidedModeInitializer />
        <UnlockedDescriptionInitializer />
        <BuilderStepPanel step="descricao" {...builderData} />
      </CharacterStoreProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Identity" })).toBeInTheDocument();
    });

    expect(screen.queryByText("Bringing the character to life")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Help with Character Name" }));

    expect(screen.getByText(/Name ideas/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Think about the character you want to build/i),
    ).toBeInTheDocument();
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

function LegacySourceSelectionInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setCreationPreferences = useCharacterStore(
    (state) => state.setCreationPreferences,
  );

  useEffect(() => {
    setCreationPreferences({ activeSources: ["XPHB"], progressionMode: "xp" });
    selectClass("legacy-fighter-phb");
  }, [selectClass, setCreationPreferences]);

  return null;
}

function OnlyXphbSourcesInitializer() {
  const setCreationPreferences = useCharacterStore(
    (state) => state.setCreationPreferences,
  );

  useEffect(() => {
    setCreationPreferences({ activeSources: ["XPHB"], progressionMode: "xp" });
  }, [setCreationPreferences]);

  return null;
}

function DisabledSourceFeatInitializer({ featId }: { featId: string }) {
  const setCreationPreferences = useCharacterStore(
    (state) => state.setCreationPreferences,
  );
  const setLevel = useCharacterStore((state) => state.setLevel);
  const setLevelAsiOrFeat = useCharacterStore((state) => state.setLevelAsiOrFeat);

  useEffect(() => {
    setCreationPreferences({ activeSources: ["PHB"], progressionMode: "xp" });
    setLevel(4);
    setLevelAsiOrFeat(4, { mode: "feat", featId });
  }, [featId, setCreationPreferences, setLevel, setLevelAsiOrFeat]);

  return null;
}

function DisabledSourceSpellInitializer({ spellId }: { spellId: string }) {
  const setCreationPreferences = useCharacterStore(
    (state) => state.setCreationPreferences,
  );
  const setSpellcastingChoices = useCharacterStore(
    (state) => state.setSpellcastingChoices,
  );

  useEffect(() => {
    setCreationPreferences({ activeSources: ["PHB"], progressionMode: "xp" });
    setSpellcastingChoices({
      cantripIds: [spellId],
      knownSpellIds: [],
      preparedSpellIds: [],
    });
  }, [setCreationPreferences, setSpellcastingChoices, spellId]);

  return null;
}

function GuidedModeInitializer() {
  const setBeginnerMode = useCharacterStore((state) => state.setBeginnerMode);

  useEffect(() => {
    setBeginnerMode(true);
  }, [setBeginnerMode]);

  return null;
}

function OneSkillSelectedInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    setClassSkillProficiencies(["Athletics"]);
    unlockStep(1);
  }, [selectClass, setClassSkillProficiencies, unlockStep]);

  return null;
}

function ClassOnlyInitializer() {
  const selectClass = useCharacterStore((state) => state.selectClass);
  const unlockStep = useCharacterStore((state) => state.unlockStep);

  useEffect(() => {
    selectClass("fighter-xphb");
    unlockStep(1);
  }, [selectClass, unlockStep]);

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
