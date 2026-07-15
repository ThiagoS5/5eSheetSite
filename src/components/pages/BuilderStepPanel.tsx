"use client";

import { memo, useCallback, useMemo, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Footprints,
  Lock,
  PlusCircle,
  Ruler,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  classQuizPitches,
  createClassQuizSession,
  getClassQuizRecommendation,
  type ClassQuizQuestion,
  type ClassQuizRecommendation,
} from "@/src/data/classQuiz";
import {
  backgroundQuizPitches,
  createBackgroundQuizSession,
  createSpeciesQuizSession,
  getBackgroundQuizRecommendation,
  getSpeciesQuizRecommendation,
  speciesQuizPitches,
  type GuidedChoiceQuizQuestion,
  type GuidedChoiceQuizRecommendation,
} from "@/src/data/guidedChoiceQuiz";
import {
  getRequiredLanguageCount,
  validateBuilderStep,
} from "@/rules/builderValidation";
import { getClassChangeImpact } from "@/rules/classChangeImpact";
import { ClassChangeDiffDialog } from "@/src/components/organisms/ClassChangeDiffDialog";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState, SkillTrainingLevel } from "@/src/store/characterStore.types";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderClassFeatureChoiceGroup,
  CatalogItem,
  BuilderLanguage,
  BuilderSpecies,
  BuilderStepSlug,
} from "@/src/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/src/types/dnd";
import type { CharacterSpellcastingChoices } from "@/src/types/spells";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";
import {
  FontAwesomeIcon,
  getHitDieIconClass,
} from "@/src/components/atoms/FontAwesomeIcon";
import { BackgroundCard } from "@/src/components/molecules/BackgroundCard";
import { ChoiceCounter } from "@/src/components/molecules/ChoiceCounter";
import { FeatureTagList } from "@/src/components/molecules/FeatureTagList";
import { RulesTextView } from "@/src/components/molecules/RulesTextView";
import { parseRulesText } from "@/src/adapters/rulesTextAst";
import type { RulesTextNode } from "@/src/types/rulesText";
import { StartingLevelStepper } from "@/src/components/molecules/StartingLevelStepper";
import { StepIntroCard } from "@/src/components/molecules/StepIntroCard";
import { SpellCatalogPicker } from "@/src/components/organisms/spells/SpellCatalogPicker";
import { getHighestSpellLevelAvailable } from "@/rules/spellcastingRules";
import type { ConceptId } from "@/src/data/conceptGlossary";
import {
  CLASS_DIFFICULTY_LABELS,
  getClassDifficulty,
  type ClassDifficulty,
} from "@/src/data/classDifficulty";
import {
  HeroChoiceCard,
  type HeroChoiceTheme,
} from "@/src/components/molecules/HeroChoiceCard";
import { WizardStepHeader } from "@/src/components/molecules/WizardStepHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { AttributeEditor } from "@/src/components/organisms/AttributeEditor";
import { PersonalDetailsEditor } from "@/src/components/organisms/PersonalDetailsEditor";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import { InventoryManager } from "@/src/components/organisms/InventoryManager";
import {
  getClassBannerIconClass,
  getHeroClassTheme,
} from "@/src/components/molecules/heroClassTheme";
import { SubclassStepScreen } from "@/src/components/organisms/SubclassStepScreen";
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { deriveBuilderPendencies } from "@/rules/pendencyRules";
import type { Pendency } from "@/src/types/builder";
import { CharacterSheetView } from "@/src/components/pages/CharacterSheetView";

const BEGINNER_STEP_GUIDES: Partial<
  Record<BuilderStepSlug, { conceptId: ConceptId; title: string }>
> = {
  "recursos-classe": { conceptId: "proficiency", title: "What are class features?" },
  subclasse: { conceptId: "subclass", title: "What is a subclass?" },
  antecedente: { conceptId: "background", title: "What is a background?" },
  especie: { conceptId: "species", title: "What is a species?" },
  "detalhes-especie": { conceptId: "species", title: "Species Details" },
  atributos: { conceptId: "attribute", title: "What are ability scores?" },
  equipamento: { conceptId: "starting-equipment", title: "What is starting equipment?" },
};

const DEFAULT_ACTIVE_SOURCES = ["XPHB"];

interface BuilderStepPanelProps {
  step: BuilderStepSlug;
  species: BuilderSpecies[];
  classes: BuilderClass[];
  backgrounds: BuilderBackground[];
  languages: BuilderLanguage[];
  itemCatalog: CatalogItem[];
}

interface PendingReplacement {
  title: string;
  description: string;
  changes: string[];
  onConfirm: () => void;
}

export function BuilderStepPanel({
  step,
  species,
  classes,
  backgrounds,
  languages,
  itemCatalog,
}: BuilderStepPanelProps) {
  const router = useRouter();
  const characterState = useCharacterBuilderState();
  const actions = useCharacterBuilderActions();
  const [pendingReplacement, setPendingReplacement] =
    useState<PendingReplacement | null>(null);
  const [pendingClassChange, setPendingClassChange] = useState<{
    classId: string;
    items: string[];
  } | null>(null);
  const messages = useMemo(
    () => validateBuilderStep(step, characterState),
    [step, characterState],
  );
  const currentStepIndex = getStepIndex(step);
  const nextStep = builderStepNavigation[currentStepIndex + 1];
  const previousStep = builderStepNavigation[currentStepIndex - 1];
  const isStepUnlocked = currentStepIndex <= characterState.maxUnlockedStepIndex;
  const previousStepsValid = useMemo(
    () => arePreviousStepsValid(step, characterState),
    [step, characterState],
  );
  const canUseCurrentStep = (isStepUnlocked || previousStepsValid) && previousStepsValid;
  const canAdvance = canUseCurrentStep && messages.length === 0 && Boolean(nextStep);
  const nextBlockerMessage =
    nextStep && !canAdvance
      ? messages[0] ?? "Complete this step's pending items to continue."
      : "";
  const selectedClass = classes.find(
    (entry) => entry.id === characterState.selectedClassId,
  );
  const selectedBackground = backgrounds.find(
    (entry) => entry.id === characterState.selectedBackgroundId,
  );
  const selectedSpecies = species.find(
    (entry) => entry.id === characterState.selectedSpeciesId,
  );
  const languageLimit = getRequiredLanguageCount(characterState);

  const unlockAndGo = useCallback(
    async (stepIndex: number) => {
      const target = builderStepNavigation[stepIndex];

      if (!target) {
        return;
      }

      await actions.commitCurrentBuild(target.slug, stepIndex);
      router.push(target.href);
    },
    [actions, router],
  );

  const requestClassSelection = useCallback(
    (classId: string) => {
      const impact = getClassChangeImpact({
        state: characterState,
        currentClass: selectedClass,
      });

      if (
        characterState.selectedClassId &&
        characterState.selectedClassId !== classId &&
        impact.items.length > 0
      ) {
        setPendingClassChange({ classId, items: impact.items });
        return;
      }

      actions.selectClass(classId);
      void unlockAndGo(getStepIndex("recursos-classe"));
    },
    [actions, characterState, selectedClass, unlockAndGo],
  );

  const requestSpeciesSelection = useCallback(
    (speciesId: string) => {
      const changes = getSpeciesReplacementChanges(characterState);

      if (
        characterState.selectedSpeciesId &&
        characterState.selectedSpeciesId !== speciesId &&
        changes.length > 0
      ) {
        setPendingReplacement({
          title: "Change species",
          description:
            "Changing species resets internal choices and languages tied to it.",
          changes,
          onConfirm: () => {
            actions.selectSpecies(speciesId);
            void unlockAndGo(getStepIndex("detalhes-especie"));
          },
        });
        return;
      }

      actions.selectSpecies(speciesId);
      void unlockAndGo(getStepIndex("detalhes-especie"));
    },
    [actions, characterState, unlockAndGo],
  );

  if (!canUseCurrentStep) {
    const blockingPendencies = deriveBuilderPendencies({
      state: characterState,
      characterClass: selectedClass,
    }).filter((pendency) => pendency.severity === "blocking");

    return (
      <LockedStepPanel
        pendencies={blockingPendencies}
        onGoToStep={(href) => router.push(href)}
      />
    );
  }

  function confirmClassChange() {
    if (!pendingClassChange) {
      return;
    }

    actions.selectClass(pendingClassChange.classId);
    setPendingClassChange(null);
    void unlockAndGo(getStepIndex("recursos-classe"));
  }

  function requestBackgroundSelection(
    backgroundId: string,
    afterSelect?: () => void,
  ) {
    const changes = getBackgroundReplacementChanges(characterState);

    if (
      characterState.selectedBackgroundId &&
      characterState.selectedBackgroundId !== backgroundId &&
      changes.length > 0
    ) {
      setPendingReplacement({
        title: "Change background",
        description:
          "Changing background resets origin choices that depend on it.",
        changes,
        onConfirm: () => {
          actions.selectBackground(backgroundId);
          afterSelect?.();
        },
      });
      return;
    }

    actions.selectBackground(backgroundId);
    afterSelect?.();
  }

  const stepGuide = step !== "classe" ? BEGINNER_STEP_GUIDES[step] : undefined;

  return (
    <div className="grid gap-5">
      {Boolean(characterState.beginnerMode) && stepGuide ? (
        <StepIntroCard
          conceptId={stepGuide.conceptId}
          title={stepGuide.title}
          beginnerMode={Boolean(characterState.beginnerMode)}
        />
      ) : null}

      {step === "classe" ? (
        <ClassStep
          classes={classes}
          selectedClassId={characterState.selectedClassId}
          beginnerMode={Boolean(characterState.beginnerMode)}
          disabled={!canUseCurrentStep}
          onSelectClass={requestClassSelection}
        />
      ) : null}

      {step === "recursos-classe" ? (
        <ClassFeaturesStep
          selectedClass={selectedClass}
          characterLevel={characterState.level}
          selectedSkills={characterState.classSkillProficiencies}
          selectedFeatureChoices={characterState.classFeatureChoices}
          spellcastingChoices={characterState.spellcasting}
          activeSources={characterState.creationPreferences?.activeSources ?? DEFAULT_ACTIVE_SOURCES}
          disabled={!canUseCurrentStep}
          onSelectedSkillsChange={actions.setClassSkillProficiencies}
          onSkillTrainingChange={actions.setSkillTraining}
          onClassFeatureChoiceChange={actions.setClassFeatureChoice}
          onSpellcastingChoicesChange={actions.setSpellcastingChoices}
        />
      ) : null}

      {step === "subclasse" ? (
        <SubclassStepScreen
          characterClass={selectedClass}
          level={characterState.level}
          selectedSubclassId={characterState.selectedSubclassId}
          activeSources={characterState.creationPreferences?.activeSources ?? DEFAULT_ACTIVE_SOURCES}
          disabled={!canUseCurrentStep}
          onSelect={(subclassId) => {
            actions.selectSubclass(subclassId);
            void unlockAndGo(getStepIndex("antecedente"));
          }}
        />
      ) : null}

      {step === "antecedente" ? (
        <BackgroundStep
          backgrounds={backgrounds}
          selectedBackgroundId={characterState.selectedBackgroundId}
          selectedBonuses={characterState.backgroundAbilityBonuses}
          beginnerMode={Boolean(characterState.beginnerMode)}
          disabled={!canUseCurrentStep}
          onSelectBackground={requestBackgroundSelection}
          onSetBonuses={actions.setBackgroundAbilityBonuses}
          onCommitBackground={() => {
            void unlockAndGo(getStepIndex("especie"));
          }}
        />
      ) : null}

      {step === "especie" ? (
        <SpeciesStep
          species={species}
          selectedSpeciesId={characterState.selectedSpeciesId}
          beginnerMode={Boolean(characterState.beginnerMode)}
          disabled={!canUseCurrentStep}
          onSelectSpecies={requestSpeciesSelection}
        />
      ) : null}

      {step === "detalhes-especie" ? (
        <SpeciesDetailsStep
          selectedSpecies={selectedSpecies}
          languages={languages}
          languageLimit={languageLimit}
          selectedChoices={characterState.speciesChoices}
          selectedLanguages={characterState.speciesLanguages}
          disabled={!canUseCurrentStep}
          onSpeciesChoiceChange={actions.setSpeciesChoice}
          onSpeciesLanguagesChange={actions.setSpeciesLanguages}
        />
      ) : null}

      {step === "atributos" ? (
        <AttributeEditor
          method={characterState.attributeGenerationMethod}
          baseAttributes={characterState.baseAttributes}
          backgroundBonuses={characterState.backgroundAbilityBonuses}
          onMethodChange={actions.setAttributeGenerationMethod}
          onAttributeChange={getAttributeChangeHandler({
            forca: actions.setForca,
            destreza: actions.setDestreza,
            constituicao: actions.setConstituicao,
            inteligencia: actions.setInteligencia,
            sabedoria: actions.setSabedoria,
            carisma: actions.setCarisma,
          })}
        />
      ) : null}

      {step === "equipamento" ? (
        <>
          <EquipmentChecklist
            selectedClass={selectedClass}
            selectedBackground={selectedBackground}
            selectedSpecies={selectedSpecies}
            choicesBySource={characterState.equipmentChoicesBySource}
            equippedItemIds={characterState.equippedItemIds}
            onToggleEquipped={actions.toggleEquippedItem}
            onSourceModeChange={actions.setEquipmentSourceMode}
            onSourceOptionChange={actions.setEquipmentSourceOption}
          />
          <InventoryManager
            catalog={itemCatalog}
            inventory={characterState.inventory}
            equippedItemIds={characterState.equippedItemIds}
            onAddItem={actions.addInventoryItem}
            onSetQuantity={actions.setInventoryQuantity}
            onRemoveItem={actions.removeInventoryItem}
            onToggleEquipped={actions.toggleEquippedItem}
          />
        </>
      ) : null}

      {step === "descricao" ? (
        <PersonalDetailsEditor
          beginnerMode={Boolean(characterState.beginnerMode)}
          selectedBackground={selectedBackground}
          selectedClass={selectedClass}
          selectedSpecies={selectedSpecies}
        />
      ) : null}

      {step === "conclusao" ? <CharacterSheetView embedded /> : null}

      {nextStep || previousStep ? (
        <div className="sticky bottom-0 z-10 border-t border-white/[0.06] bg-surface-nested/95 py-4 backdrop-blur">
          <div className="grid grid-cols-2 items-center gap-3">
            {previousStep ? (
              <ActionBtn
                intent="secondary"
                size="sm"
                className="justify-self-start"
                onClick={() => router.push(previousStep.href)}
              >
                Back
              </ActionBtn>
            ) : (
              <span aria-hidden="true" />
            )}
            {nextStep ? (
              <ActionBtn
                size="sm"
                className="justify-self-end"
                aria-describedby={
                  nextBlockerMessage ? "builder-next-blocker" : undefined
                }
                disabled={!canAdvance}
                onClick={() => {
                  void unlockAndGo(currentStepIndex + 1);
                }}
              >
                Next
              </ActionBtn>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
          {nextBlockerMessage ? (
            <p
              id="builder-next-blocker"
              className="mt-3 text-right text-xs leading-5 text-accent"
            >
              {nextBlockerMessage}
            </p>
          ) : null}
        </div>
      ) : null}
      <DependentReplacementDialog
        replacement={pendingReplacement}
        onOpenChange={(open) => {
          if (!open) {
            setPendingReplacement(null);
          }
        }}
      />
      <ClassChangeDiffDialog
        open={Boolean(pendingClassChange)}
        items={pendingClassChange?.items ?? []}
        onConfirm={confirmClassChange}
        onCancel={() => setPendingClassChange(null)}
      />
    </div>
  );
}

/**
 * Painel de etapa bloqueada recuperável: em vez de um beco sem saída, mostra a
 * moldura ornada com o checklist exato de decisões que faltam (reaproveitando os
 * pendencies já derivados) e ações de reparo diretas para a primeira etapa pendente.
 */
function LockedStepPanel({
  pendencies,
  onGoToStep,
}: {
  pendencies: Pendency[];
  onGoToStep: (href: string) => void;
}) {
  const groups = builderStepNavigation
    .map((step) => ({
      step,
      items: pendencies.filter((pendency) => pendency.stepSlug === step.slug),
    }))
    .filter((group) => group.items.length > 0);

  const firstStep = groups[0]?.step ?? builderStepNavigation[0];
  const startStep = builderStepNavigation[0];

  return (
    <div className="grid gap-5">
      <section
        aria-labelledby="locked-step-title"
        className="relative overflow-hidden rounded-xl border border-brand-gold-alt/25 bg-card shadow-[0_0_28px_rgba(0,0,0,0.35)]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-gold-alt/80 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-brand-gold-alt/40"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-brand-gold-alt/40"
        />

        <div className="grid gap-6 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-gold-alt/40 bg-brand-gold-alt/10 text-brand-gold-alt"
            >
              <Lock className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2
                id="locked-step-title"
                className="font-serif text-2xl font-bold text-foreground"
              >
                This step is sealed
              </h2>
              <p className="mt-1 text-sm leading-6 text-subdued">
                It unlocks once you make the earlier decisions it builds on — your
                progress is safe.
              </p>
            </div>
          </div>

          {groups.length ? (
            <div className="rounded-lg border border-white/[0.08] bg-surface-nested/60 p-4 sm:p-5">
              <p className="mb-4 text-sm font-semibold text-foreground">
                Finish these to continue:
              </p>
              <ul className="grid gap-4">
                {groups.map((group) => (
                  <li key={group.step.slug} className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => onGoToStep(group.step.href)}
                      className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-brand-gold-alt outline-none transition hover:text-amber-200 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
                    >
                      {group.step.label}
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                    <ul className="grid gap-2">
                      {group.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start gap-2.5 text-sm leading-6 text-subdued"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => onGoToStep(startStep.href)}
              className="text-sm font-semibold text-muted-foreground underline underline-offset-4 outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
            >
              Back to the start
            </button>
            <ActionBtn onClick={() => onGoToStep(firstStep.href)}>
              Continue from {firstStep.label}
              <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </ActionBtn>
          </div>
        </div>
      </section>
    </div>
  );
}

function DependentReplacementDialog({
  replacement,
  onOpenChange,
}: {
  replacement: PendingReplacement | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={Boolean(replacement)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <Dialog.Content className="w-full max-w-md rounded-xl border border-white/[0.08] bg-surface-nested p-5 text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
            <Dialog.Title className="font-serif text-xl font-bold text-foreground">
              {replacement?.title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-subdued">
              {replacement?.description}
            </Dialog.Description>
            {replacement?.changes.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-accent">
                {replacement.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-5 flex justify-end gap-3">
              <Dialog.Close asChild>
                <ActionBtn intent="secondary">Cancel</ActionBtn>
              </Dialog.Close>
              <ActionBtn
                onClick={() => {
                  replacement?.onConfirm();
                  onOpenChange(false);
                }}
              >
                Confirm change
              </ActionBtn>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClassStep({
  classes,
  selectedClassId,
  beginnerMode,
  disabled,
  onSelectClass,
}: {
  classes: BuilderClass[];
  selectedClassId: string;
  beginnerMode: boolean;
  disabled: boolean;
  onSelectClass: (classId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    ClassDifficulty | "all"
  >("all");
  const [quizQuestions, setQuizQuestions] = useState<ClassQuizQuestion[] | null>(
    null,
  );
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const filteredClasses = useMemo(
    () =>
      classes.filter(
        (entry) =>
          matchesClassSearch(entry, searchQuery) &&
          (difficultyFilter === "all" ||
            getClassDifficulty(entry.id) === difficultyFilter),
      ),
    [classes, searchQuery, difficultyFilter],
  );
  const quizRecommendation = useMemo(
    () =>
      quizQuestions
        ? getClassQuizRecommendation(quizQuestions, quizAnswers)
        : null,
    [quizQuestions, quizAnswers],
  );
  const getRecommendationTier = (
    classId: string,
  ): "primary" | "secondary" | null => {
    if (!beginnerMode || !quizRecommendation) {
      return null;
    }
    if (quizRecommendation.primaryClassId === classId) {
      return "primary";
    }
    return quizRecommendation.secondaryClassId === classId ? "secondary" : null;
  };
  const resultCountLabel =
    filteredClasses.length === 1
      ? "1 class found"
      : `${filteredClasses.length} classes found`;

  return (
    <section aria-labelledby="class-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow="Level 1"
        title="Choose a Class"
        description="Class defines Hit Die, proficiencies, saving throws, and features."
        id="class-options-title"
        searchId="class-filter"
        searchLabel="Filter classes"
        searchValue={searchQuery}
        searchPlaceholder="Name, source, or feature..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="class-difficulty-filter"
          className="text-[10px] font-bold uppercase tracking-[0.14em] text-subdued"
        >
          Difficulty
        </label>
        <select
          id="class-difficulty-filter"
          value={difficultyFilter}
          onChange={(event) =>
            setDifficultyFilter(event.target.value as ClassDifficulty | "all")
          }
          className="min-h-9 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-foreground outline-none transition hover:border-white/20 focus:border-brand-gold-alt focus:ring-2 focus:ring-brand-gold-alt/40"
        >
          <option value="all">All</option>
          <option value="facil">{CLASS_DIFFICULTY_LABELS.facil}</option>
          <option value="medio">{CLASS_DIFFICULTY_LABELS.medio}</option>
          <option value="dificil">{CLASS_DIFFICULTY_LABELS.dificil}</option>
        </select>
      </div>

      {beginnerMode ? (
        <>
          <StepIntroCard
            conceptId="class"
            title="What is a class?"
            beginnerMode={beginnerMode}
          />
          <section
            aria-labelledby="class-quiz-title"
            className="rounded-lg border border-white/[0.08] bg-card p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3
                  id="class-quiz-title"
                  className="flex items-center gap-2 font-serif text-lg font-bold text-foreground"
                >
                  <Sparkles
                    aria-hidden="true"
                    className="h-4 w-4 text-brand-gold-alt"
                  />
                  Not sure where to start?
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Answer 7 questions as the character you want to build. At
                  the end, we highlight the 2 classes that fit best and explain
                  why each one works. The choice is still yours, and the
                  questions change each attempt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuizQuestions((current) =>
                    current ? null : createClassQuizSession(),
                  );
                  setQuizAnswers([]);
                }}
                className="shrink-0 rounded-md border border-brand-gold-alt/50 px-4 py-2 text-sm font-bold text-foreground outline-none transition hover:bg-brand-gold-alt/10 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                {quizQuestions ? "Close guide" : "Help me choose"}
              </button>
            </div>

            {quizQuestions ? (
              <ClassGuideQuiz
                questions={quizQuestions}
                answers={quizAnswers}
                recommendation={quizRecommendation}
                classes={classes}
                onAnswer={(optionId) =>
                  setQuizAnswers((current) =>
                    current.length >= quizQuestions.length
                      ? current
                      : [...current, optionId],
                  )
                }
                onUndo={() =>
                  setQuizAnswers((current) => current.slice(0, -1))
                }
                onRestart={() => {
                  setQuizQuestions(createClassQuizSession());
                  setQuizAnswers([]);
                }}
              />
            ) : null}
          </section>
        </>
      ) : null}

      <div className="mb-4">
        <StartingLevelStepper />
      </div>

      {filteredClasses.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredClasses.map((entry) => {
            const tier = getRecommendationTier(entry.id);

            return (
              <div key={entry.id} className="relative">
                {tier ? <ChoiceRecommendationFrame tier={tier} /> : null}
                {tier ? <RecommendationFlag tier={tier} /> : null}
                <ClassOptionCard
                  classEntry={entry}
                  selected={selectedClassId === entry.id}
                  disabled={disabled}
                  onSelect={onSelectClass}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            No class found
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Try searching by name, source, or starting feature.
          </p>
        </div>
      )}
    </section>
  );
}

/**
 * Recommendation outline starts where the visual card starts (top-11), so it
 * never wraps the card's layout padding or empty desktop offset.
 */
function ChoiceRecommendationFrame({
  tier,
}: {
  tier: "primary" | "secondary" | "tertiary";
}) {
  const tierClass =
    tier === "primary"
      ? "border-emerald-400/95 shadow-[0_0_24px_rgba(52,211,153,0.25)]"
      : tier === "secondary"
        ? "border-amber-400/95 shadow-[0_0_24px_rgba(251,191,36,0.22)]"
        : "border-brand-gold-alt/90 shadow-[0_0_24px_rgba(235,193,98,0.2)]";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 top-11 z-[2] rounded-xl border-4 ${tierClass}`}
    />
  );
}

/**
 * Ribbon on the class card frame showing the guided quiz recommendation:
 * green for the primary pick, amber for the secondary pick.
 */
function RecommendationFlag({ tier }: { tier: "primary" | "secondary" }) {
  const isPrimary = tier === "primary";

  return (
    <span
      data-testid={`recommendation-flag-${tier}`}
      className={`absolute right-4 top-11 z-[3] flex items-center gap-1.5 px-2.5 pb-3 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-lg [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-8px),0_100%)] ${
        isPrimary
          ? "bg-emerald-500 text-emerald-950"
          : "bg-amber-400 text-amber-950"
      }`}
    >
      {isPrimary ? (
        <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
      ) : (
        <Star aria-hidden="true" className="h-3.5 w-3.5" />
      )}
      {isPrimary ? "Recommended" : "2nd option"}
    </span>
  );
}

function ClassGuideQuiz({
  questions,
  answers,
  recommendation,
  classes,
  onAnswer,
  onUndo,
  onRestart,
}: {
  questions: ClassQuizQuestion[];
  answers: string[];
  recommendation: ClassQuizRecommendation | null;
  classes: BuilderClass[];
  onAnswer: (optionId: string) => void;
  onUndo: () => void;
  onRestart: () => void;
}) {
  const currentQuestion = recommendation ? undefined : questions[answers.length];
  const findClass = (classId: string) =>
    classes.find((entry) => entry.id === classId);

  return (
    <div className="mt-4 border-t border-white/[0.08] pt-4">
      {currentQuestion ? (
        <fieldset className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-alt">
              Question {answers.length + 1} of {questions.length}
            </span>
            <div aria-hidden="true" className="flex gap-1.5">
              {questions.map((question, index) => (
                <span
                  key={question.id}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    index < answers.length
                      ? "bg-brand-gold-alt"
                      : index === answers.length
                        ? "bg-brand-gold-alt/50"
                        : "bg-white/[0.12]"
                  }`}
                />
              ))}
            </div>
          </div>
          <legend className="font-serif text-lg font-bold leading-7 text-foreground">
            {currentQuestion.prompt}
          </legend>
          <p className="text-sm leading-6 text-muted-foreground">
            {currentQuestion.helper}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                type="button"
                data-testid="quiz-option"
                onClick={() => onAnswer(option.id)}
                className="rounded-lg border border-white/[0.08] bg-muted p-3 text-left outline-none transition hover:border-brand-gold-alt/60 hover:bg-brand-gold-alt/5 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <span className="block text-sm font-semibold text-foreground">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {option.flavor}
                </span>
              </button>
            ))}
          </div>
          {answers.length > 0 ? (
            <button
              type="button"
              onClick={onUndo}
              className="justify-self-start text-xs font-semibold text-muted-foreground underline-offset-4 outline-none transition hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
            >
              Back to previous question
            </button>
          ) : null}
        </fieldset>
      ) : null}

      {recommendation ? (
        <div aria-live="polite" className="grid gap-3">
          <p className="text-sm leading-6 text-muted-foreground">
            These are the 2 classes that best matched your answers. They are
            marked in the list below. Compare the cards and use &quot;Learn More&quot;
            before deciding.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <QuizResultCard
              tier="primary"
              classEntry={findClass(recommendation.primaryClassId)}
              reasons={recommendation.reasons[recommendation.primaryClassId] ?? []}
            />
            <QuizResultCard
              tier="secondary"
              classEntry={findClass(recommendation.secondaryClassId)}
              reasons={
                recommendation.reasons[recommendation.secondaryClassId] ?? []
              }
            />
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="justify-self-start rounded-md border border-brand-gold-alt/50 px-4 py-2 text-sm font-bold text-foreground outline-none transition hover:bg-brand-gold-alt/10 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
          >
            Retake with new questions
          </button>
        </div>
      ) : null}
    </div>
  );
}

function QuizResultCard({
  tier,
  classEntry,
  reasons,
}: {
  tier: "primary" | "secondary";
  classEntry?: BuilderClass;
  reasons: string[];
}) {
  if (!classEntry) {
    return null;
  }

  const isPrimary = tier === "primary";

  return (
    <article
      className={`rounded-lg border p-4 ${
        isPrimary
          ? "border-emerald-500/60 bg-emerald-500/10"
          : "border-amber-400/60 bg-amber-400/10"
      }`}
    >
      <p
        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] ${
          isPrimary ? "text-emerald-400" : "text-amber-400"
        }`}
      >
        {isPrimary ? (
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Star aria-hidden="true" className="h-4 w-4" />
        )}
        {isPrimary ? "Recommended" : "Second option"}
      </p>
      <h4 className="mt-2 font-serif text-2xl font-bold text-foreground">
        {classEntry.name}
      </h4>
      <p className="mt-2 text-sm leading-6 text-subdued">
        {classQuizPitches[classEntry.id] ?? classEntry.summary}
      </p>
      {reasons.length ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          <strong className="font-semibold text-foreground">
            Matches your answers:
          </strong>{" "}
          {reasons.map((reason) => `“${reason}”`).join(", ")}
        </p>
      ) : null}
    </article>
  );
}

type GuidedChoiceItem = BuilderSpecies | BuilderBackground;
type RecommendationTier = "primary" | "secondary" | "tertiary";

const recommendationTierLabels: Record<RecommendationTier, string> = {
  primary: "Recommended",
  secondary: "Second option",
  tertiary: "Third option",
};

function getRecommendationTier(
  recommendation: GuidedChoiceQuizRecommendation | null,
  itemId: string,
): RecommendationTier | null {
  const index = recommendation?.recommendedIds.indexOf(itemId) ?? -1;

  if (index === 0) {
    return "primary";
  }

  if (index === 1) {
    return "secondary";
  }

  if (index === 2) {
    return "tertiary";
  }

  return null;
}

function ScopedRecommendationFlag({
  scope,
  tier,
}: {
  scope: "species" | "background";
  tier: RecommendationTier;
}) {
  const tierClass =
    tier === "primary"
      ? "bg-emerald-500 text-emerald-950"
      : tier === "secondary"
        ? "bg-amber-400 text-amber-950"
        : "bg-brand-gold-alt text-background";

  return (
    <span
      data-testid={`${scope}-recommendation-flag-${tier}`}
      className={`absolute right-4 top-[60px] z-[3] flex items-center gap-1.5 px-2.5 pb-3 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-lg [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-8px),0_100%)] ${tierClass}`}
    >
      {tier === "primary" ? (
        <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
      ) : (
        <Star aria-hidden="true" className="h-3.5 w-3.5" />
      )}
      {tier === "primary" ? "Recommended" : tier === "secondary" ? "2nd option" : "3rd option"}
    </span>
  );
}

function GuidedChoiceQuizSection<TItem extends GuidedChoiceItem>({
  scope,
  title,
  description,
  buttonLabel,
  closeLabel,
  resultLabel,
  resultSummary,
  questions,
  answers,
  recommendation,
  items,
  pitches,
  onStart,
  onClose,
  onAnswer,
  onUndo,
  onRestart,
}: {
  scope: "species" | "background";
  title: string;
  description: string;
  buttonLabel: string;
  closeLabel: string;
  resultLabel: string;
  resultSummary: string;
  questions: GuidedChoiceQuizQuestion[] | null;
  answers: string[];
  recommendation: GuidedChoiceQuizRecommendation | null;
  items: TItem[];
  pitches: Record<string, string>;
  onStart: () => void;
  onClose: () => void;
  onAnswer: (optionId: string) => void;
  onUndo: () => void;
  onRestart: () => void;
}) {
  const findItem = (itemId: string) =>
    items.find((entry) => entry.id === itemId);

  return (
    <section
      aria-labelledby={`${scope}-guided-quiz-title`}
      className="rounded-lg border border-white/[0.08] bg-card p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            id={`${scope}-guided-quiz-title`}
            className="flex items-center gap-2 font-serif text-lg font-bold text-foreground"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4 text-brand-gold-alt" />
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={questions ? onClose : onStart}
          className="shrink-0 rounded-md border border-brand-gold-alt/50 px-4 py-2 text-sm font-bold text-foreground outline-none transition hover:bg-brand-gold-alt/10 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
        >
          {questions ? closeLabel : buttonLabel}
        </button>
      </div>

      {questions ? (
        <div className="mt-4 border-t border-white/[0.08] pt-4">
          <GuidedChoiceQuizBody
            questions={questions}
            answers={answers}
            recommendation={recommendation}
            onAnswer={onAnswer}
            onUndo={onUndo}
          />

          {recommendation ? (
            <div aria-live="polite" className="mt-4 grid gap-3">
              <p className="text-sm leading-6 text-muted-foreground">
                {resultSummary}
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {recommendation.recommendedIds.map((itemId, index) => {
                  const item = findItem(itemId);
                  const tier = (["primary", "secondary", "tertiary"] as const)[index];

                  return item ? (
                    <GuidedChoiceResultCard
                      key={item.id}
                      label={resultLabel}
                      tier={tier}
                      item={item}
                      pitch={pitches[item.id] ?? item.summary}
                      reasons={recommendation.reasons[item.id] ?? []}
                    />
                  ) : null;
                })}
              </div>
              <button
                type="button"
                onClick={onRestart}
                className="justify-self-start rounded-md border border-brand-gold-alt/50 px-4 py-2 text-sm font-bold text-foreground outline-none transition hover:bg-brand-gold-alt/10 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                Retake with new questions
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function GuidedChoiceQuizBody({
  questions,
  answers,
  recommendation,
  onAnswer,
  onUndo,
}: {
  questions: GuidedChoiceQuizQuestion[];
  answers: string[];
  recommendation: GuidedChoiceQuizRecommendation | null;
  onAnswer: (optionId: string) => void;
  onUndo: () => void;
}) {
  const currentQuestion = recommendation ? undefined : questions[answers.length];

  return (
    <div className="grid gap-3">
      <p className="text-sm leading-6 text-subdued">
        Answer 7 questions as the character you want to build. Choose the
        answer that best matches their beliefs, instincts, and past.
      </p>

      {currentQuestion ? (
        <fieldset className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-gold-alt">
              Question {answers.length + 1} of {questions.length}
            </span>
            <div aria-hidden="true" className="flex gap-1.5">
              {questions.map((question, index) => (
                <span
                  key={question.id}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    index < answers.length
                      ? "bg-brand-gold-alt"
                      : index === answers.length
                        ? "bg-brand-gold-alt/50"
                        : "bg-white/[0.12]"
                  }`}
                />
              ))}
            </div>
          </div>
          <legend className="font-serif text-lg font-bold leading-7 text-foreground">
            {currentQuestion.prompt}
          </legend>
          <p className="text-sm leading-6 text-muted-foreground">
            {currentQuestion.helper}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                type="button"
                data-testid="guided-quiz-option"
                onClick={() => onAnswer(option.id)}
                className="rounded-lg border border-white/[0.08] bg-muted p-3 text-left outline-none transition hover:border-brand-gold-alt/60 hover:bg-brand-gold-alt/5 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <span className="block text-sm font-semibold text-foreground">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {option.flavor}
                </span>
              </button>
            ))}
          </div>
          {answers.length > 0 ? (
            <button
              type="button"
              onClick={onUndo}
              className="justify-self-start text-xs font-semibold text-muted-foreground underline-offset-4 outline-none transition hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
            >
              Back to previous question
            </button>
          ) : null}
        </fieldset>
      ) : null}
    </div>
  );
}

function GuidedChoiceResultCard<TItem extends GuidedChoiceItem>({
  label,
  tier,
  item,
  pitch,
  reasons,
}: {
  label: string;
  tier: RecommendationTier;
  item: TItem;
  pitch: string;
  reasons: string[];
}) {
  const isPrimary = tier === "primary";
  const toneClass =
    tier === "primary"
      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
      : tier === "secondary"
        ? "border-amber-400/60 bg-amber-400/10 text-amber-400"
        : "border-brand-gold-alt/60 bg-brand-gold-alt/10 text-brand-gold-alt";

  return (
    <article className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em]">
        {isPrimary ? (
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Star aria-hidden="true" className="h-4 w-4" />
        )}
        {label}
      </p>
      <h4
        translate="no"
        className="notranslate mt-2 font-serif text-2xl font-bold text-foreground"
      >
        {item.name}
      </h4>
      <p className="mt-2 text-sm leading-6 text-subdued">{pitch}</p>
      {reasons.length ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          <strong className="font-semibold text-foreground">
            Matches your answers:
          </strong>{" "}
          {reasons.map((reason) => `"${reason}"`).join(", ")}
        </p>
      ) : null}
      <span className="sr-only">{recommendationTierLabels[tier]}</span>
    </article>
  );
}

const ClassOptionCard = memo(function ClassOptionCard({
  classEntry,
  selected,
  disabled,
  onSelect,
}: {
  classEntry: BuilderClass;
  selected: boolean;
  disabled: boolean;
  onSelect: (classId: string) => void;
}) {
  const tags = getClassTags(classEntry);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const primaryAbility = formatList(classEntry.primaryAbility);
  const handleSelect = useCallback(() => onSelect(classEntry.id), [onSelect, classEntry.id]);

  return (
    <>
      <HeroChoiceCard
        title={classEntry.name}
        badges={[classEntry.source, tags[0], primaryAbility].filter(Boolean)}
        description={classEntry.summary}
        imageSrc={classEntry.image?.src}
        imageAlt={classEntry.image?.alt}
        imageSize={classEntry.image?.cardBackgroundSize}
        imagePosition={classEntry.image?.cardBackgroundPosition}
        icon={
          <FontAwesomeIcon iconClassName={getClassBannerIconClass(classEntry)} />
        }
        theme={getHeroClassTheme(classEntry)}
        isActive={selected}
        disabled={disabled}
        onClickDetails={() => setDetailsOpen(true)}
        onClickSelect={handleSelect}
      >
        <div className="grid gap-2 rounded-lg bg-black/40 p-3 backdrop-blur-[2px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              Hit Die
            </span>
            <span translate="no" className="notranslate flex items-center gap-1.5 font-mono text-sm font-bold text-white">
              <FontAwesomeIcon
                iconClassName={getHitDieIconClass(classEntry.hitDie)}
                className="text-[var(--hero-accent)]"
              />
              d{classEntry.hitDie}
            </span>
          </div>
          <HeroCardDetailLine label="Primary Ability" value={primaryAbility} />
          <HeroCardDetailLine
            label="Saving Throws"
            value={formatList(classEntry.savingThrows)}
          />
          <div>
            <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              Level 1 Features
            </h4>
            <FeatureTagList
              features={classEntry.levelOneFeatures}
              emptyLabel="None"
              ariaLabel="Level 1 Features"
            />
          </div>
        </div>
      </HeroChoiceCard>

      <ClassDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        classEntry={classEntry}
        selected={selected}
        disabled={disabled}
        onSelect={handleSelect}
      />
    </>
  );
});


function HeroCardDetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-5 text-white/90">
      <strong className="font-semibold text-white">{label}:</strong>{" "}
      <span translate="no" className="notranslate">{value || "-"}</span>
    </p>
  );
}

function matchesClassSearch(classEntry: BuilderClass, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return matchesNormalizedSearchText(
    [
      classEntry.name,
      classEntry.summary,
      classEntry.source,
      ...classEntry.levelOneFeatures.map((feature) => feature.name),
    ].join(" "),
    normalizedQuery,
  );
}

function getClassTags(classEntry: BuilderClass): string[] {
  const combatRole = classEntry.spellcastingAbility ? "Spellcaster" : "Martial";
  const armorRole = classEntry.armorProficiencies.some((entry) =>
    normalizeSearchText(entry).includes("heavy"),
  )
    ? "Frontline"
    : classEntry.spellcastingAbility
      ? classEntry.spellcastingAbility
      : "Specialist";

  return [combatRole, armorRole].filter(Boolean).slice(0, 2);
}

/**
 * Temas por espécie acompanhando a paleta da arte de cada card
 * (fallback esverdeado neutro para espécies fora do mapa).
 */
const heroSpeciesFallbackTheme: HeroChoiceTheme = {
  theme: "#1F3226",
  accent: "#7BAF6C",
};

const heroSpeciesThemes: Array<{ keyword: string; theme: HeroChoiceTheme }> = [
  { keyword: "aasimar", theme: { theme: "#1E3D3A", accent: "#8FD6C8" } },
  { keyword: "changeling", theme: { theme: "#2E2A33", accent: "#B9AFC9" } },
  { keyword: "dragonborn", theme: { theme: "#4A2410", accent: "#E8833A" } },
  { keyword: "draconato", theme: { theme: "#4A2410", accent: "#E8833A" } },
  { keyword: "dwarf", theme: { theme: "#3D2B12", accent: "#E0A93E" } },
  { keyword: "anao", theme: { theme: "#3D2B12", accent: "#E0A93E" } },
  { keyword: "elf", theme: { theme: "#24391C", accent: "#9BC97A" } },
  { keyword: "elfo", theme: { theme: "#24391C", accent: "#9BC97A" } },
  { keyword: "gnome", theme: { theme: "#3A2C1C", accent: "#E2B15C" } },
  { keyword: "gnomo", theme: { theme: "#3A2C1C", accent: "#E2B15C" } },
  { keyword: "goliath", theme: { theme: "#2A3540", accent: "#9FB9CC" } },
  { keyword: "golias", theme: { theme: "#2A3540", accent: "#9FB9CC" } },
  { keyword: "halfling", theme: { theme: "#3B3A14", accent: "#D6C75A" } },
  { keyword: "human", theme: { theme: "#3C1F1A", accent: "#D98A4B" } },
  { keyword: "humano", theme: { theme: "#3C1F1A", accent: "#D98A4B" } },
  { keyword: "orc", theme: { theme: "#26331D", accent: "#7FA653" } },
  { keyword: "tiefling", theme: { theme: "#3A1230", accent: "#C75B8B" } },
  { keyword: "shifter", theme: { theme: "#33261A", accent: "#C08A4E" } },
  { keyword: "warforged", theme: { theme: "#2C3136", accent: "#A9B4BD" } },
  { keyword: "kalashtar", theme: { theme: "#243247", accent: "#8FB3E8" } },
];

function getHeroSpeciesTheme(species: BuilderSpecies): HeroChoiceTheme {
  const normalizedName = normalizeSearchText(species.name);
  const match = heroSpeciesThemes.find((entry) =>
    normalizedName.includes(entry.keyword),
  );

  return match?.theme ?? heroSpeciesFallbackTheme;
}

function getClassTone(classEntry: BuilderClass) {
  const normalizedName = normalizeSearchText(classEntry.name);

  if (normalizedName.includes("wizard") || normalizedName.includes("sorcerer")) {
    return classToneByName.arcane;
  }

  if (normalizedName.includes("rogue") || normalizedName.includes("ranger")) {
    return classToneByName.green;
  }

  if (normalizedName.includes("cleric") || normalizedName.includes("paladin")) {
    return classToneByName.gold;
  }

  return classToneByName.crimson;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesNormalizedSearchText(value: string, normalizedQuery: string): boolean {
  const normalizedValue = normalizeSearchText(value);
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTerms.every((term) => normalizedValue.includes(term));
}

const classToneByName = {
  crimson: {
    topBorder: "via-primary",
    selectedBorder: "border-primary",
    selectedShadow: "shadow-[0_0_24px_rgba(230,28,35,0.28)]",
    activeBadge: "bg-primary",
    activeButton:
      "border-primary bg-primary shadow-[0_0_15px_rgba(230,28,35,0.35)]",
    fallbackGradient: "via-tone-crimson-deep",
    statAccent: "border-primary/30 bg-destructive/20 text-primary",
  },
  arcane: {
    topBorder: "via-tone-arcane",
    selectedBorder: "border-tone-arcane",
    selectedShadow: "shadow-[0_0_24px_rgba(164,201,255,0.2)]",
    activeBadge: "bg-tone-arcane-deep",
    activeButton:
      "border-tone-arcane bg-tone-arcane-deep shadow-[0_0_15px_rgba(164,201,255,0.22)]",
    fallbackGradient: "via-tone-arcane-deepest",
    statAccent: "border-tone-arcane/30 bg-tone-arcane-deep/20 text-tone-arcane",
  },
  green: {
    topBorder: "via-brand-green",
    selectedBorder: "border-brand-green",
    selectedShadow: "shadow-[0_0_24px_rgba(80,200,120,0.18)]",
    activeBadge: "bg-tone-druid-deep",
    activeButton:
      "border-brand-green bg-tone-druid-deep shadow-[0_0_15px_rgba(80,200,120,0.22)]",
    fallbackGradient: "via-tone-druid-deepest",
    statAccent: "border-brand-green/30 bg-tone-druid-deep/20 text-brand-green",
  },
  gold: {
    topBorder: "via-brand-gold-alt",
    selectedBorder: "border-brand-gold-alt",
    selectedShadow: "shadow-[0_0_24px_rgba(235,193,98,0.18)]",
    activeBadge: "bg-tone-gold-deep",
    activeButton:
      "border-brand-gold-alt bg-tone-gold-deep shadow-[0_0_15px_rgba(235,193,98,0.22)]",
    fallbackGradient: "via-tone-gold-deepest",
    statAccent: "border-brand-gold-alt/30 bg-tone-gold-deep/20 text-brand-gold-alt",
  },
} as const;

function ClassFeaturesStep({
  selectedClass,
  characterLevel,
  selectedSkills,
  selectedFeatureChoices,
  spellcastingChoices,
  activeSources,
  disabled,
  onSelectedSkillsChange,
  onSkillTrainingChange,
  onClassFeatureChoiceChange,
  onSpellcastingChoicesChange,
}: {
  selectedClass?: BuilderClass;
  characterLevel: number;
  selectedSkills: string[];
  selectedFeatureChoices: Record<string, string[]>;
  spellcastingChoices?: CharacterSpellcastingChoices;
  activeSources: string[];
  disabled: boolean;
  onSelectedSkillsChange: (skills: string[]) => void;
  onSkillTrainingChange: (skill: string, level: SkillTrainingLevel) => void;
  onClassFeatureChoiceChange: (choiceId: string, values: string[]) => void;
  onSpellcastingChoicesChange: (choices: CharacterSpellcastingChoices) => void;
}) {
  if (!selectedClass) {
    return (
      <section className="rounded-lg border border-white/[0.06] bg-card p-4 text-sm text-subdued">
        Choose a class before configuring features.
      </section>
    );
  }

  const maxSkills = selectedClass.skillChoices.count;
  const levelIndex = Math.max(0, Math.min(19, characterLevel - 1));
  const cantripLimit =
    selectedClass.spellcastingProgression?.cantripsKnown[levelIndex] ?? 0;
  const preparedLimit =
    selectedClass.spellcastingProgression?.preparedSpells[levelIndex] ?? 0;
  const knownLimit =
    selectedClass.spellcastingProgression?.knownSpells[levelIndex] ?? 0;
  const spellMode = preparedLimit > 0 ? "prepared" : "known";
  const spellLimit = spellMode === "prepared" ? preparedLimit : knownLimit;
  const maxSpellLevel = getHighestSpellLevelAvailable(selectedClass, characterLevel);

  function toggleSkill(skill: string) {
    if (selectedSkills.includes(skill)) {
      onSelectedSkillsChange(selectedSkills.filter((entry) => entry !== skill));
      return;
    }

    if (selectedSkills.length >= maxSkills) {
      return;
    }

    onSelectedSkillsChange([...selectedSkills, skill]);
    onSkillTrainingChange(skill, "proficient");
  }

  return (
    <section aria-labelledby="class-features-title" className="grid gap-5">
      <StepHeader
        eyebrow={selectedClass.name}
        title="Class Features"
        description="Choose the class's starting skills. Proficiency, half proficiency, and expertise stay separate for later calculations."
        id="class-features-title"
      />
      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="rounded-lg border border-white/[0.06] bg-card p-4">
          <legend className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Class skills</span>
            <ChoiceCounter
              selected={selectedSkills.length}
              total={maxSkills}
              label="skills chosen"
            />
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {selectedClass.skillChoices.chooseFrom.map((skill) => {
              const checked = selectedSkills.includes(skill);

              return (
                <label
                  key={skill}
                  className={`grid cursor-pointer grid-cols-[auto_1fr] gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-brand-crimson-alt bg-brand-crimson-alt/10 text-foreground"
                      : "border-white/[0.08] bg-white/[0.03] text-subdued"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || (!checked && selectedSkills.length >= maxSkills)}
                    onChange={() => toggleSkill(skill)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-surface-nested accent-brand-crimson-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-crimson-alt"
                  />
                  <span>{skill}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <section className="rounded-lg border border-white/[0.06] bg-card p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            STARTING CLASS PROFICIENCIES
          </h3>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-subdued">
            <ClassSummaryLine
              label="Armor"
              value={formatList(selectedClass.armorProficiencies)}
            />
            <ClassSummaryLine
              label="Weapons"
              value={formatList(selectedClass.weaponProficiencies)}
            />
            <ClassSummaryLine
              label="Tools"
              value={formatList(selectedClass.toolProficiencies)}
            />
          </div>
        </section>
      </div>
      {selectedClass.featureChoiceGroups.map((group) => (
        <ClassFeatureChoiceFieldset
          key={group.id}
          group={group}
          selectedValues={selectedFeatureChoices[group.id] ?? []}
          disabled={disabled}
          onChange={(values) => onClassFeatureChoiceChange(group.id, values)}
        />
      ))}
      {selectedClass.spellcastingAbility ? (
        <SpellCatalogPicker
          className={selectedClass.name}
          activeSources={activeSources}
          value={spellcastingChoices}
          cantripLimit={cantripLimit}
          spellLimit={spellLimit}
          spellMode={spellMode}
          maxSpellLevel={maxSpellLevel}
          disabled={disabled}
          onChange={onSpellcastingChoicesChange}
        />
      ) : null}
      <section className="rounded-lg border border-white/[0.06] bg-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Starting Level 1 Features:
        </h3>
        <div className="mt-4">
          <FeatureTagList
            features={selectedClass.levelOneFeatures}
            emptyLabel="Starting Level 1 Features"
          />
        </div>
      </section>
    </section>
  );
}

function ClassFeatureChoiceFieldset({
  group,
  selectedValues,
  disabled,
  onChange,
}: {
  group: BuilderClassFeatureChoiceGroup;
  selectedValues: string[];
  disabled: boolean;
  onChange: (values: string[]) => void;
}) {
  function toggleValue(value: string) {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((entry) => entry !== value));
      return;
    }

    if (selectedValues.length >= group.count) {
      return;
    }

    onChange([...selectedValues, value]);
  }

  return (
    <fieldset className="rounded-lg border border-white/[0.06] bg-card p-4">
      <legend className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <span>{group.label}</span>
        <ChoiceCounter
          selected={selectedValues.length}
          total={group.count}
          label="chosen"
        />
      </legend>
      <p className="mb-4 text-sm leading-6 text-subdued">
        {group.description}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {group.options.map((option) => {
          const checked = selectedValues.includes(option.value);

          return (
            <label
              key={option.value}
              className={`grid cursor-pointer grid-cols-[auto_1fr] gap-2 rounded-md border px-3 py-2 text-sm transition ${
                checked
                  ? "border-brand-crimson-alt bg-brand-crimson-alt/10 text-foreground"
                  : "border-white/[0.08] bg-white/[0.03] text-subdued"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={
                  disabled || (!checked && selectedValues.length >= group.count)
                }
                onChange={() => toggleValue(option.value)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-surface-nested accent-brand-crimson-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-crimson-alt"
              />
              <span>
                <span className="block font-semibold">{option.label}</span>
                {option.description ? (
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function BackgroundStep({
  backgrounds,
  selectedBackgroundId,
  selectedBonuses,
  beginnerMode,
  disabled,
  onSelectBackground,
  onSetBonuses,
  onCommitBackground,
}: {
  backgrounds: BuilderBackground[];
  selectedBackgroundId: string;
  selectedBonuses: AttributeBonuses;
  beginnerMode: boolean;
  disabled: boolean;
  onSelectBackground: (backgroundId: string, afterSelect?: () => void) => void;
  onSetBonuses: (bonuses: AttributeBonuses) => void;
  onCommitBackground: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<
    GuidedChoiceQuizQuestion[] | null
  >(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const filteredBackgrounds = useMemo(
    () =>
      backgrounds.filter((entry) =>
        matchesBackgroundSearch(entry, searchQuery),
      ),
    [backgrounds, searchQuery],
  );
  const quizRecommendation = useMemo(
    () =>
      quizQuestions
        ? getBackgroundQuizRecommendation(quizQuestions, quizAnswers)
        : null,
    [quizQuestions, quizAnswers],
  );
  const resultCountLabel =
    filteredBackgrounds.length === 1
      ? "1 background found"
      : `${filteredBackgrounds.length} backgrounds found`;

  return (
    <section aria-labelledby="background-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow="Origin Rules"
        title="Choose Your Background"
        description="The past shapes fate. Choose the origin that defined your journey before you took up weapons or magic."
        id="background-options-title"
        searchId="background-filter"
        searchLabel="Filter backgrounds"
        searchValue={searchQuery}
        searchPlaceholder="Name, feat, or description..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      {beginnerMode ? (
        <GuidedChoiceQuizSection
          scope="background"
          title="Not sure which past fits?"
          description="Answer 7 questions as the character you want to build. The guide will suggest 3 backgrounds that best match the life they had before adventuring."
          buttonLabel="Help me choose a background"
          closeLabel="Close background guide"
          resultLabel="Recommended Background"
          resultSummary="These 3 backgrounds matched the character you described. The cards are marked below, but you can still choose any background."
          questions={quizQuestions}
          answers={quizAnswers}
          recommendation={quizRecommendation}
          items={backgrounds}
          pitches={backgroundQuizPitches}
          onStart={() => {
            setQuizQuestions(createBackgroundQuizSession());
            setQuizAnswers([]);
          }}
          onClose={() => {
            setQuizQuestions(null);
            setQuizAnswers([]);
          }}
          onAnswer={(optionId) =>
            setQuizAnswers((current) =>
              quizQuestions && current.length < quizQuestions.length
                ? [...current, optionId]
                : current,
            )
          }
          onUndo={() => setQuizAnswers((current) => current.slice(0, -1))}
          onRestart={() => {
            setQuizQuestions(createBackgroundQuizSession());
            setQuizAnswers([]);
          }}
        />
      ) : null}

      {filteredBackgrounds.length ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredBackgrounds.map((entry) => {
            const tier = getRecommendationTier(quizRecommendation, entry.id);

            return (
              <div key={entry.id} className="relative">
                {tier ? <ChoiceRecommendationFrame tier={tier} /> : null}
                {tier ? (
                  <ScopedRecommendationFlag scope="background" tier={tier} />
                ) : null}
                <BackgroundCard
                  background={entry}
                  selected={selectedBackgroundId === entry.id}
                  selectedBonuses={selectedBackgroundId === entry.id ? selectedBonuses : {}}
                  disabled={disabled}
                  onSelect={() => onSelectBackground(entry.id)}
                  onBonusesChange={(bonuses) => {
                    onSelectBackground(entry.id, () => onSetBonuses(bonuses));
                  }}
                  onCommit={onCommitBackground}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            No background found
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Try searching by name, origin feat, or description.
          </p>
        </div>
      )}
    </section>
  );
}

function matchesBackgroundSearch(
  background: BuilderBackground,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return matchesNormalizedSearchText(
    [
      background.name,
      background.summary,
      background.description,
      background.source,
      background.originFeat,
      background.equipmentSummary,
      ...background.skillProficiencies,
      ...background.toolProficiencies,
    ].join(" "),
    normalizedQuery,
  );
}

function matchesSpeciesSearch(species: BuilderSpecies, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return matchesNormalizedSearchText(
    [
      species.name,
      species.summary,
      species.description,
      species.source,
      species.size,
      `${species.speed}`,
      ...species.traits.flatMap((trait) => [trait.name, trait.description]),
    ].join(" "),
    normalizedQuery,
  );
}

function SpeciesStep({
  species,
  selectedSpeciesId,
  beginnerMode,
  disabled,
  onSelectSpecies,
}: {
  species: BuilderSpecies[];
  selectedSpeciesId: string;
  beginnerMode: boolean;
  disabled: boolean;
  onSelectSpecies: (speciesId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<
    GuidedChoiceQuizQuestion[] | null
  >(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const filteredSpecies = useMemo(
    () => species.filter((entry) => matchesSpeciesSearch(entry, searchQuery)),
    [species, searchQuery],
  );
  const quizRecommendation = useMemo(
    () =>
      quizQuestions
        ? getSpeciesQuizRecommendation(quizQuestions, quizAnswers)
        : null,
    [quizQuestions, quizAnswers],
  );
  const resultCountLabel =
    filteredSpecies.length === 1
      ? "1 species found"
      : `${filteredSpecies.length} species found`;

  return (
    <section aria-labelledby="species-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow="Rules 2024"
        title="Choose a Species"
        description="2024 species provide traits, size, speed, senses, and resistances."
        id="species-options-title"
        searchId="species-filter"
        searchLabel="Filter species"
        searchValue={searchQuery}
        searchPlaceholder="Name, source, or trait..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      {beginnerMode ? (
        <GuidedChoiceQuizSection
          scope="species"
          title="Not sure which species fits?"
          description="Answer 7 questions as the character you want to build. The guide will suggest the species that best supports that fantasy."
          buttonLabel="Help me choose a species"
          closeLabel="Close species guide"
          resultLabel="Recommended Species"
          resultSummary="This species best matched the character you described. Its card is marked below, but you can still choose any species."
          questions={quizQuestions}
          answers={quizAnswers}
          recommendation={quizRecommendation}
          items={species}
          pitches={speciesQuizPitches}
          onStart={() => {
            setQuizQuestions(createSpeciesQuizSession());
            setQuizAnswers([]);
          }}
          onClose={() => {
            setQuizQuestions(null);
            setQuizAnswers([]);
          }}
          onAnswer={(optionId) =>
            setQuizAnswers((current) =>
              quizQuestions && current.length < quizQuestions.length
                ? [...current, optionId]
                : current,
            )
          }
          onUndo={() => setQuizAnswers((current) => current.slice(0, -1))}
          onRestart={() => {
            setQuizQuestions(createSpeciesQuizSession());
            setQuizAnswers([]);
          }}
        />
      ) : null}

      {filteredSpecies.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredSpecies.map((entry) => {
            const tier = getRecommendationTier(quizRecommendation, entry.id);

            return (
              <div key={entry.id} className="relative">
                {tier ? <ChoiceRecommendationFrame tier={tier} /> : null}
                {tier ? (
                  <ScopedRecommendationFlag scope="species" tier={tier} />
                ) : null}
                <SpeciesOptionCard
                  species={entry}
                  selected={selectedSpeciesId === entry.id}
                  disabled={disabled}
                  onSelect={onSelectSpecies}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            No species found
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Try searching by name, source, or species trait.
          </p>
        </div>
      )}
    </section>
  );
}

const SpeciesOptionCard = memo(function SpeciesOptionCard({
  species,
  selected,
  disabled,
  onSelect,
}: {
  species: BuilderSpecies;
  selected: boolean;
  disabled: boolean;
  onSelect: (speciesId: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const handleSelect = useCallback(() => onSelect(species.id), [onSelect, species.id]);

  return (
    <>
      <HeroChoiceCard
        title={species.name}
        badges={[species.source].filter(Boolean)}
        description={species.summary}
        imageSrc={species.image?.src}
        imageAlt={species.image?.alt}
        icon={<FontAwesomeIcon iconClassName="fa-solid fa-dragon" />}
        theme={getHeroSpeciesTheme(species)}
        isActive={selected}
        disabled={disabled}
        onClickDetails={() => setDetailsOpen(true)}
        onClickSelect={handleSelect}
      >
        <div className="grid gap-2 rounded-lg bg-black/40 p-3 backdrop-blur-[2px]">
          <HeroCardDetailLine label="Size" value={species.size} />
          <HeroCardDetailLine
            label="Speed"
            value={`${species.speed} ft.`}
          />
          <div>
            <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              Species Traits
            </h4>
            <FeatureTagList
              features={species.traits}
              emptyLabel="No species trait"
              ariaLabel="Species Traits"
            />
          </div>
        </div>
      </HeroChoiceCard>

      <SpeciesDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        species={species}
        selected={selected}
        disabled={disabled}
        onSelect={handleSelect}
      />
    </>
  );
});

function SpeciesDetailsDialog({
  open,
  onOpenChange,
  species,
  selected,
  disabled,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  species: BuilderSpecies;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100svh] w-full min-w-0 flex-col overflow-y-auto border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,920px)] md:max-w-6xl md:flex-row md:overflow-hidden md:rounded-xl">
            <Dialog.Title className="sr-only">{species.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {`Details for ${species.name}: ${species.summary}`}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Close details for ${species.name}`}
                className="absolute right-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none backdrop-blur transition hover:border-brand-gold-alt/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <SpeciesDetailsSidebar
              species={species}
              selected={selected}
              disabled={disabled}
              onSelect={onSelect}
            />
            <SpeciesDetailsMain species={species} />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SpeciesDetailsSidebar({
  species,
  selected,
  disabled,
  onSelect,
}: {
  species: BuilderSpecies;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col overflow-visible border-b border-white/[0.06] bg-muted md:h-full md:w-80 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="relative h-48 shrink-0 overflow-hidden bg-card sm:h-56 md:h-[300px]">
        {species.image ? (
          <Image
            unoptimized
            src={species.image.src}
            alt={species.image.alt}
            fill
            sizes="(min-width: 768px) 20rem, 100vw"
            className="object-cover object-top opacity-85 saturate-[0.8] transition duration-500 hover:opacity-95 hover:saturate-100"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-gradient-to-br from-muted via-tone-crimson-deepest to-card"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-muted via-muted/25 to-transparent"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded border border-border bg-black/45 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-subdued backdrop-blur">
              {species.source}
            </span>
            <span className="rounded border border-border bg-black/45 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-subdued backdrop-blur">
              {species.ruleset}
            </span>
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            {species.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-subdued">
            {species.summary}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-4">
        <section aria-labelledby={`${species.id}-biology-title`} className="grid gap-3">
          <h3
            id={`${species.id}-biology-title`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Species Biology
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ClassDetailStat
              icon={<Ruler aria-hidden="true" className="h-4 w-4" />}
              label="Size"
              value={species.size}
              description="Creature size"
              compact
            />
            <ClassDetailStat
              icon={<Footprints aria-hidden="true" className="h-4 w-4" />}
              label="Speed"
              value={`${species.speed} ft.`}
              description="Walking"
              compact
            />
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-white/[0.06] bg-surface-nested/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          aria-pressed={selected}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-serif text-lg font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 disabled:cursor-not-allowed disabled:opacity-50 ${
            selected
              ? "border-accent bg-accent text-surface-nested"
              : "border-destructive/70 bg-destructive shadow-[0_0_18px_rgba(230,28,35,0.2)] hover:border-primary hover:bg-primary"
          }`}
        >
          {selected ? (
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
          ) : (
            <PlusCircle aria-hidden="true" className="h-5 w-5" />
          )}
          {selected ? "Species Selected" : "Select Species"}
        </button>
      </div>
    </aside>
  );
}

function SpeciesDetailsMain({ species }: { species: BuilderSpecies }) {
  return (
    <main className="min-h-0 min-w-0 flex-1 bg-surface-nested scroll-smooth md:overflow-y-auto">
      <div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6 lg:p-8">
        <section aria-labelledby={`${species.id}-description-title`}>
          <ClassSectionHeading
            id={`${species.id}-description-title`}
            icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
          >
            Description
          </ClassSectionHeading>
          <ContentBlocks
            blocks={
              species.descriptionBlocks.length
                ? species.descriptionBlocks
                : parseRulesText(species.description)
            }
          />
        </section>

        <section aria-labelledby={`${species.id}-traits-title`}>
          <ClassSectionHeading
            id={`${species.id}-traits-title`}
            icon={<ScrollText aria-hidden="true" className="h-5 w-5" />}
            withRule
          >
            Species Traits
          </ClassSectionHeading>
          <div className="grid gap-4">
            {species.traits.map((trait) => (
              <article
                key={trait.name}
                className="rounded-lg border border-white/[0.08] bg-muted p-4"
              >
                <h4 className="font-serif text-lg font-bold text-foreground">
                  {trait.name}
                </h4>
                <div className="mt-3">
                  <FeatureBlocks feature={trait} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SpeciesDetailsStep({
  selectedSpecies,
  languages,
  languageLimit,
  selectedChoices,
  selectedLanguages,
  disabled,
  onSpeciesChoiceChange,
  onSpeciesLanguagesChange,
}: {
  selectedSpecies?: BuilderSpecies;
  languages: BuilderLanguage[];
  languageLimit: number;
  selectedChoices: Record<string, string>;
  selectedLanguages: string[];
  disabled: boolean;
  onSpeciesChoiceChange: (choiceId: string, value: string) => void;
  onSpeciesLanguagesChange: (languages: string[]) => void;
}) {
  if (!selectedSpecies) {
    return (
      <section className="rounded-lg border border-white/[0.06] bg-card p-4 text-sm text-subdued">
        Choose a species before configuring details.
      </section>
    );
  }

  function toggleLanguage(language: string) {
    if (selectedLanguages.includes(language)) {
      onSpeciesLanguagesChange(selectedLanguages.filter((entry) => entry !== language));
      return;
    }

    if (selectedLanguages.length >= languageLimit) {
      return;
    }

    onSpeciesLanguagesChange([...selectedLanguages, language]);
  }

  return (
    <section aria-labelledby="species-details-title" className="grid gap-5">
      <StepHeader
        eyebrow={selectedSpecies.name}
        title="Species Details"
        description="Choose internal species options and standard languages."
        id="species-details-title"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {selectedSpecies.choiceGroups.map((group) => (
          <fieldset
            key={group.id}
            className="rounded-lg border border-white/[0.06] bg-card p-4"
          >
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </legend>
            <div className="grid gap-2">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className={`grid cursor-pointer grid-cols-[auto_1fr] gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    selectedChoices[group.id] === option.value
                      ? "border-brand-crimson-alt bg-brand-crimson-alt/10 text-foreground"
                      : "border-white/[0.08] bg-white/[0.03] text-subdued"
                  }`}
                >
                  <input
                    type="radio"
                    name={group.id}
                    checked={selectedChoices[group.id] === option.value}
                    disabled={disabled}
                    onChange={() => onSpeciesChoiceChange(group.id, option.value)}
                    className="mt-1 h-4 w-4 border-white/20 bg-surface-nested accent-brand-crimson-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-crimson-alt"
                  />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    {option.description ? (
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <fieldset className="rounded-lg border border-white/[0.06] bg-card p-4">
          <legend className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Languages</span>
            <ChoiceCounter
              selected={selectedLanguages.length}
              total={languageLimit}
              label="languages chosen"
            />
          </legend>
          <div className="grid gap-5">
            <LanguageGroup
              title="Common"
              languages={languages.filter((language) => language.type === "standard")}
              selectedLanguages={selectedLanguages}
              languageLimit={languageLimit}
              disabled={disabled}
              onToggleLanguage={toggleLanguage}
            />
            <LanguageGroup
              title="Rare and Exotic"
              languages={languages.filter((language) =>
                language.type === "rare" || language.type === "exotic",
              )}
              selectedLanguages={selectedLanguages}
              languageLimit={languageLimit}
              disabled={disabled}
              onToggleLanguage={toggleLanguage}
            />
          </div>
        </fieldset>
      </div>
    </section>
  );
}

function LanguageGroup({
  title,
  languages,
  selectedLanguages,
  languageLimit,
  disabled,
  onToggleLanguage,
}: {
  title: string;
  languages: BuilderLanguage[];
  selectedLanguages: string[];
  languageLimit: number;
  disabled: boolean;
  onToggleLanguage: (language: string) => void;
}) {
  if (!languages.length) {
    return null;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {languages.map((language) => {
          const checked = selectedLanguages.includes(language.name);

          return (
            <label
              key={language.name}
              className={`grid cursor-pointer grid-cols-[auto_1fr] gap-2 rounded-md border px-3 py-2 text-sm transition ${
                checked
                  ? "border-brand-crimson-alt bg-brand-crimson-alt/10 text-foreground"
                  : "border-white/[0.08] bg-white/[0.03] text-subdued"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={
                  disabled || (!checked && selectedLanguages.length >= languageLimit)
                }
                onChange={() => onToggleLanguage(language.name)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-surface-nested accent-brand-crimson-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-crimson-alt"
              />
              <span>{language.name}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function ClassDetailsDialog({
  open,
  onOpenChange,
  classEntry,
  selected,
  disabled,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classEntry: BuilderClass;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const tone = getClassTone(classEntry);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100svh] w-full min-w-0 flex-col overflow-y-auto border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,920px)] md:max-w-6xl md:flex-row md:overflow-hidden md:rounded-xl">
            <Dialog.Title className="sr-only">{classEntry.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {`${classEntry.name} details: ${classEntry.summary}`}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Close ${classEntry.name} details`}
                className="absolute right-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none backdrop-blur transition hover:border-brand-gold-alt/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <ClassDetailsSidebar
              classEntry={classEntry}
              selected={selected}
              disabled={disabled}
              tone={tone}
              onSelect={onSelect}
            />
            <ClassDetailsMain classEntry={classEntry} />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClassDetailsSidebar({
  classEntry,
  selected,
  disabled,
  tone,
  onSelect,
}: {
  classEntry: BuilderClass;
  selected: boolean;
  disabled: boolean;
  tone: ReturnType<typeof getClassTone>;
  onSelect: () => void;
}) {
  const tags = getClassTags(classEntry);

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-visible border-b border-white/[0.06] bg-muted md:h-full md:w-80 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="relative h-48 shrink-0 overflow-hidden bg-card sm:h-56 md:h-[300px]">
        {classEntry.image ? (
          <Image
            unoptimized
            src={classEntry.image.src}
            alt={classEntry.image.alt}
            fill
            sizes="(min-width: 768px) 20rem, 100vw"
            className="object-cover object-top opacity-85 saturate-[0.8] transition duration-500 hover:opacity-95 hover:saturate-100"
          />
        ) : (
          <div
            aria-hidden="true"
            className={`h-full w-full bg-gradient-to-br from-muted ${tone.fallbackGradient} to-card`}
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-muted via-muted/25 to-transparent"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-border bg-black/45 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-subdued backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-foreground">
            {classEntry.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-subdued">
            {classEntry.summary}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-4">
        <section aria-labelledby={`${classEntry.id}-identity-title`} className="grid gap-3">
          <h3
            id={`${classEntry.id}-identity-title`}
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Class Identity
          </h3>
          <ClassDetailStat
            icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
            label="Primary Ability"
            value={formatList(classEntry.primaryAbility)}
            description="Basis for the class's main mechanics."
            accentClassName={tone.statAccent}
          />
          <div className="grid grid-cols-2 gap-3">
            <ClassDetailStat
              icon={
                <FontAwesomeIcon
                  iconClassName={getHitDieIconClass(classEntry.hitDie)}
                  className="text-base"
                />
              }
              label="Hit Die"
              value={`d${classEntry.hitDie}`}
              description="Per level"
              compact
            />
            <ClassDetailStat
              icon={<Shield aria-hidden="true" className="h-4 w-4" />}
              label="Saving Throws"
              value={formatList(classEntry.savingThrows)}
              description="Save proficiencies"
              compact
            />
          </div>
        </section>

        <section>
          <h3 className="border-b border-white/[0.06] pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Starting Proficiencies
          </h3>
          <dl className="mt-3 grid gap-3 text-sm leading-6">
            <ClassProficiencyLine
              label="Armor"
              value={formatList(classEntry.armorProficiencies)}
            />
            <ClassProficiencyLine
              label="Weapons"
              value={formatList(classEntry.weaponProficiencies)}
            />
            <ClassProficiencyLine
              label="Tools"
              value={formatList(classEntry.toolProficiencies)}
            />
          </dl>
        </section>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-white/[0.06] bg-surface-nested/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={onSelect}
          disabled={disabled}
          aria-pressed={selected}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-serif text-lg font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 disabled:cursor-not-allowed disabled:opacity-50 ${
            selected
              ? tone.activeButton
              : "border-destructive/70 bg-destructive shadow-[0_0_18px_rgba(230,28,35,0.2)] hover:border-primary hover:bg-primary"
          }`}
        >
          {selected ? (
            <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
          ) : (
            <PlusCircle aria-hidden="true" className="h-5 w-5" />
          )}
          {selected ? "Class Selected" : "Select Class"}
        </button>
      </div>
    </aside>
  );
}

function ClassDetailsMain({ classEntry }: { classEntry: BuilderClass }) {
  return (
    <main className="min-h-0 min-w-0 flex-1 bg-surface-nested scroll-smooth md:overflow-y-auto">
      <div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6 lg:p-8">
        <section aria-labelledby={`${classEntry.id}-description-title`}>
          <ClassSectionHeading
            id={`${classEntry.id}-description-title`}
            icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
          >
            Description
          </ClassSectionHeading>
          <ContentBlocks
            blocks={
              classEntry.descriptionBlocks.length
                ? classEntry.descriptionBlocks
                : parseRulesText(classEntry.description)
            }
          />
        </section>

        <ClassProgressionTable classEntry={classEntry} />

        {classEntry.spellcastingAbility ? (
          <section className="rounded-lg border border-accent/25 bg-accent/10 p-4">
            <ClassSectionHeading
              icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
              toneClassName="text-accent"
            >
              Spellcasting
            </ClassSectionHeading>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-accent">
              <ClassSummaryLine
                label="Spellcasting Ability"
                value={classEntry.spellcastingAbility}
              />
              <ClassSummaryLine
                label="Spell Save DC"
                value={`8 + Proficiency Bonus + ${classEntry.spellcastingAbility} modifier`}
              />
              <ClassSummaryLine
                label="Spell Attack"
                value={`Proficiency Bonus + ${classEntry.spellcastingAbility} modifier`}
              />
            </div>
          </section>
        ) : null}

        <section aria-labelledby={`${classEntry.id}-features-title`}>
          <ClassSectionHeading
            id={`${classEntry.id}-features-title`}
            icon={<ScrollText aria-hidden="true" className="h-5 w-5" />}
            withRule
          >
            Class Features
          </ClassSectionHeading>
          <Accordion type="single" collapsible className="rounded-lg border border-white/[0.08] bg-muted px-4">
            {classEntry.allFeatures.map((feature) => (
              <AccordionItem key={`${feature.level}-${feature.name}`} value={`${feature.level}-${feature.name}`}>
                <AccordionTrigger>
                  Level {feature.level}: {feature.name}
                </AccordionTrigger>
                <AccordionContent>
                  <FeatureBlocks feature={feature} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </main>
  );
}

function ClassDetailStat({
  icon,
  label,
  value,
  description,
  accentClassName = "border-border bg-card text-subdued",
  compact = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  accentClassName?: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-white/[0.06] bg-surface-nested p-3 ${compact ? "" : "grid grid-cols-[auto_1fr] gap-3"}`}>
      <div
        className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md border ${accentClassName} ${compact ? "" : "mb-0"}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-mono text-base font-bold text-foreground">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ClassProficiencyLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="text-subdued">{value}</dd>
    </div>
  );
}

function ClassSectionHeading({
  id,
  icon,
  children,
  toneClassName = "text-primary",
  withRule = false,
}: {
  id?: string;
  icon: ReactNode;
  children: ReactNode;
  toneClassName?: string;
  withRule?: boolean;
}) {
  return (
    <h3
      id={id}
      className={`mb-4 flex items-center gap-2 font-serif text-xl font-bold text-foreground ${withRule ? "border-b border-border pb-2" : ""}`}
    >
      <span className={toneClassName}>{icon}</span>
      {children}
    </h3>
  );
}

function ClassProgressionTable({ classEntry }: { classEntry: BuilderClass }) {
  const hasSpellSlots = classEntry.progressionRows.some(
    (row) => row.spellSlots.length > 0,
  );

  return (
    <section className="min-w-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Class Progression
      </h3>
      <div className="max-w-full overflow-x-auto rounded-lg border border-white/[0.08]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-3">Level</th>
              <th scope="col" className="px-3 py-3">Proficiency Bonus</th>
              <th scope="col" className="px-3 py-3">Features</th>
              {hasSpellSlots ? <th scope="col" className="px-3 py-3">Spell Slots</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {classEntry.progressionRows.map((row) => (
              <tr key={row.level} className="align-top">
                <td className="px-3 py-3 font-semibold text-foreground">Level {row.level}</td>
                <td className="px-3 py-3 text-subdued">{row.proficiencyBonus}</td>
                <td className="px-3 py-3 text-subdued">
                  {formatList(row.features)}
                </td>
                {hasSpellSlots ? (
                  <td className="px-3 py-3 text-subdued">
                    {row.spellSlots.length ? row.spellSlots.join(" / ") : "-"}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FeatureBlocks({ feature }: { feature: BuilderClass["allFeatures"][number] | BuilderSpecies["traits"][number] }) {
  const blocks = feature.blocks?.length
    ? feature.blocks
    : parseRulesText(feature.description);

  return <ContentBlocks blocks={blocks} />;
}

function ContentBlocks({ blocks }: { blocks: RulesTextNode[] }) {
  return <RulesTextView nodes={blocks} className="grid gap-1" />;
}

function ClassSummaryLine({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <p>
        <strong className="font-semibold text-foreground">{label}:</strong>
        {value ? <span className="text-subdued"> {value}</span> : null}
      </p>
      {children ? <div>{children}</div> : null}
    </div>
  );
}

function formatList(items: readonly string[]): string {
  return items.length ? items.join(", ") : "-";
}

function StepHeader({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-1 font-serif text-xl font-bold tracking-wide text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function getAttributeChangeHandler(
  actions: Record<AttributeKey, (value: number) => void>,
): (attribute: AttributeKey, value: number) => void {
  return (attribute, value) => {
    actions[attribute](value);
  };
}

function getSpeciesReplacementChanges(state: CharacterBuilderState): string[] {
  const changes: string[] = [];
  const speciesChoiceCount = Object.keys(state.speciesChoices).length;

  if (speciesChoiceCount > 0) {
    changes.push(
      formatCount(
        speciesChoiceCount,
        "escolha de especie",
        "escolhas de especie",
      ),
    );
  }

  if (state.speciesLanguages.length > 0) {
    changes.push(
      formatCount(
        state.speciesLanguages.length,
        "species language",
        "species languages",
      ),
    );
  }

  return changes;
}

function getBackgroundReplacementChanges(state: CharacterBuilderState): string[] {
  const bonusCount = Object.keys(state.backgroundAbilityBonuses).length;

  return bonusCount > 0
    ? [formatCount(bonusCount, "ability score bonus", "ability score bonuses")]
    : [];
}

function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getStepIndex(step: BuilderStepSlug): number {
  return builderStepNavigation.findIndex((entry) => entry.slug === step);
}

function arePreviousStepsValid(
  step: BuilderStepSlug,
  state: CharacterBuilderState,
): boolean {
  const currentIndex = getStepIndex(step);
  const previousSteps = builderStepNavigation.slice(0, currentIndex);

  return previousSteps.every(
    (entry) => validateBuilderStep(entry.slug, state).length === 0,
  );
}

function useCharacterBuilderActions() {
  const selectSpecies = useCharacterStore((state) => state.selectSpecies);
  const selectClass = useCharacterStore((state) => state.selectClass);
  const selectSubclass = useCharacterStore((state) => state.selectSubclass);
  const selectBackground = useCharacterStore((state) => state.selectBackground);
  const addInventoryItem = useCharacterStore((state) => state.addInventoryItem);
  const setInventoryQuantity = useCharacterStore((state) => state.setInventoryQuantity);
  const removeInventoryItem = useCharacterStore((state) => state.removeInventoryItem);
  const toggleEquippedItem = useCharacterStore((state) => state.toggleEquippedItem);
  const setEquipmentSourceMode = useCharacterStore((state) => state.setEquipmentSourceMode);
  const setEquipmentSourceOption = useCharacterStore((state) => state.setEquipmentSourceOption);
  const unlockStep = useCharacterStore((state) => state.unlockStep);
  const commitCurrentBuild = useCharacterStore((state) => state.commitCurrentBuild);
  const setPendingChoiceIds = useCharacterStore((state) => state.setPendingChoiceIds);
  const setClassSkillProficiencies = useCharacterStore(
    (state) => state.setClassSkillProficiencies,
  );
  const setSkillTraining = useCharacterStore((state) => state.setSkillTraining);
  const setClassFeatureChoice = useCharacterStore((state) => state.setClassFeatureChoice);
  const setSpellcastingChoices = useCharacterStore((state) => state.setSpellcastingChoices);
  const setSpeciesChoice = useCharacterStore((state) => state.setSpeciesChoice);
  const setSpeciesLanguages = useCharacterStore((state) => state.setSpeciesLanguages);
  const setAttributeGenerationMethod = useCharacterStore(
    (state) => state.setAttributeGenerationMethod,
  );
  const setBackgroundAbilityBonuses = useCharacterStore(
    (state) => state.setBackgroundAbilityBonuses,
  );
  const setDescriptionField = useCharacterStore((state) => state.setDescriptionField);
  const setForca = useCharacterStore((state) => state.setForca);
  const setDestreza = useCharacterStore((state) => state.setDestreza);
  const setConstituicao = useCharacterStore((state) => state.setConstituicao);
  const setInteligencia = useCharacterStore((state) => state.setInteligencia);
  const setSabedoria = useCharacterStore((state) => state.setSabedoria);
  const setCarisma = useCharacterStore((state) => state.setCarisma);

  return useMemo(
    () => ({
      selectSpecies,
      selectClass,
      selectSubclass,
      selectBackground,
      addInventoryItem,
      setInventoryQuantity,
      removeInventoryItem,
      toggleEquippedItem,
      setEquipmentSourceMode,
      setEquipmentSourceOption,
      unlockStep,
      commitCurrentBuild,
      setPendingChoiceIds,
      setClassSkillProficiencies,
      setSkillTraining,
      setClassFeatureChoice,
      setSpellcastingChoices,
      setSpeciesChoice,
      setSpeciesLanguages,
      setAttributeGenerationMethod,
      setBackgroundAbilityBonuses,
      setDescriptionField,
      setForca,
      setDestreza,
      setConstituicao,
      setInteligencia,
      setSabedoria,
      setCarisma,
    }),
    [
      selectSpecies,
      selectClass,
      selectSubclass,
      selectBackground,
      addInventoryItem,
      setInventoryQuantity,
      removeInventoryItem,
      toggleEquippedItem,
      setEquipmentSourceMode,
      setEquipmentSourceOption,
      unlockStep,
      commitCurrentBuild,
      setPendingChoiceIds,
      setClassSkillProficiencies,
      setSkillTraining,
      setClassFeatureChoice,
      setSpellcastingChoices,
      setSpeciesChoice,
      setSpeciesLanguages,
      setAttributeGenerationMethod,
      setBackgroundAbilityBonuses,
      setDescriptionField,
      setForca,
      setDestreza,
      setConstituicao,
      setInteligencia,
      setSabedoria,
      setCarisma,
    ],
  );
}
