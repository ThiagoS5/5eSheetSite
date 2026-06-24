"use client";

import { useMemo, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Footprints,
  PlusCircle,
  Ruler,
  ScrollText,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import {
  getRequiredLanguageCount,
  validateBuilderStep,
} from "@/rules/builderValidation";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState, SkillTrainingLevel } from "@/src/store/characterStore.types";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderClassFeatureChoiceGroup,
  CatalogItem,
  BuilderFeatureBlock,
  BuilderLanguage,
  BuilderSpecies,
  BuilderStepSlug,
} from "@/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/types/dnd";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";
import {
  FontAwesomeIcon,
  getHitDieIconClass,
} from "@/src/components/atoms/FontAwesomeIcon";
import { BackgroundCard } from "@/src/components/molecules/BackgroundCard";
import { FeatureTagList } from "@/src/components/molecules/FeatureTagList";
import { StartingLevelStepper } from "@/src/components/molecules/StartingLevelStepper";
import { WizardChoiceCard } from "@/src/components/molecules/WizardChoiceCard";
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
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { CharacterSheetView } from "@/src/components/pages/CharacterSheetView";

interface BuilderStepPanelProps {
  step: BuilderStepSlug;
  species: BuilderSpecies[];
  classes: BuilderClass[];
  backgrounds: BuilderBackground[];
  languages: BuilderLanguage[];
  itemCatalog: CatalogItem[];
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
  const messages = validateBuilderStep(step, characterState);
  const currentStepIndex = getStepIndex(step);
  const nextStep = builderStepNavigation[currentStepIndex + 1];
  const previousStep = builderStepNavigation[currentStepIndex - 1];
  const isStepUnlocked = currentStepIndex <= characterState.maxUnlockedStepIndex;
  const previousStepsValid = arePreviousStepsValid(step, characterState);
  const canUseCurrentStep = (isStepUnlocked || previousStepsValid) && previousStepsValid;
  const canAdvance = canUseCurrentStep && messages.length === 0 && Boolean(nextStep);
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

  if (!canUseCurrentStep) {
    return (
      <div className="grid gap-5">
        <section className="rounded-lg border border-white/[0.06] bg-card p-5">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Etapa bloqueada
          </h2>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Termine as etapas anteriores pelo botao Avancar para liberar este conteudo.
          </p>
        </section>
      </div>
    );
  }

  async function unlockAndGo(stepIndex: number) {
    const target = builderStepNavigation[stepIndex];

    if (!target) {
      return;
    }

    await actions.commitCurrentBuild(target.slug, stepIndex);
    router.push(target.href);
  }

  return (
    <div className="grid gap-5">
      {step === "classe" ? (
        <ClassStep
          classes={classes}
          selectedClassId={characterState.selectedClassId}
          disabled={!canUseCurrentStep}
          onSelectClass={(classId) => {
            actions.selectClass(classId);
            void unlockAndGo(1);
          }}
        />
      ) : null}

      {step === "recursos-classe" ? (
        <ClassFeaturesStep
          selectedClass={selectedClass}
          selectedSkills={characterState.classSkillProficiencies}
          selectedFeatureChoices={characterState.classFeatureChoices}
          disabled={!canUseCurrentStep}
          onSelectedSkillsChange={actions.setClassSkillProficiencies}
          onSkillTrainingChange={actions.setSkillTraining}
          onClassFeatureChoiceChange={actions.setClassFeatureChoice}
        />
      ) : null}

      {step === "antecedente" ? (
        <BackgroundStep
          backgrounds={backgrounds}
          selectedBackgroundId={characterState.selectedBackgroundId}
          selectedBonuses={characterState.backgroundAbilityBonuses}
          disabled={!canUseCurrentStep}
          onSelectBackground={actions.selectBackground}
          onSetBonuses={actions.setBackgroundAbilityBonuses}
          onCommitBackground={() => {
            void unlockAndGo(3);
          }}
        />
      ) : null}

      {step === "especie" ? (
        <SpeciesStep
          species={species}
          selectedSpeciesId={characterState.selectedSpeciesId}
          disabled={!canUseCurrentStep}
          onSelectSpecies={(speciesId) => {
            actions.selectSpecies(speciesId);
            void unlockAndGo(4);
          }}
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
            onSourceModeChange={actions.setEquipmentSourceMode}
            onSourceOptionChange={actions.setEquipmentSourceOption}
          />
          <InventoryManager
            catalog={itemCatalog}
            inventory={characterState.inventory}
            onAddItem={actions.addInventoryItem}
            onSetQuantity={actions.setInventoryQuantity}
            onRemoveItem={actions.removeInventoryItem}
          />
        </>
      ) : null}

      {step === "descricao" ? <PersonalDetailsEditor /> : null}

      {step === "conclusao" ? <CharacterSheetView embedded /> : null}

      {nextStep || previousStep ? (
        <div className="sticky bottom-0 z-10 flex justify-between gap-3 border-t border-white/[0.06] bg-surface-nested/95 py-4 backdrop-blur">
          {previousStep ? (
            <ActionBtn intent="secondary" onClick={() => router.push(previousStep.href)}>
              Voltar
            </ActionBtn>
          ) : (
            <span aria-hidden="true" />
          )}
          {nextStep ? (
            <ActionBtn
              disabled={!canAdvance}
              onClick={() => {
                void unlockAndGo(currentStepIndex + 1);
              }}
            >
              Avancar
            </ActionBtn>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ClassStep({
  classes,
  selectedClassId,
  disabled,
  onSelectClass,
}: {
  classes: BuilderClass[];
  selectedClassId: string;
  disabled: boolean;
  onSelectClass: (classId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredClasses = useMemo(
    () => classes.filter((entry) => matchesClassSearch(entry, searchQuery)),
    [classes, searchQuery],
  );
  const resultCountLabel =
    filteredClasses.length === 1
      ? "1 classe encontrada"
      : `${filteredClasses.length} classes encontradas`;

  return (
    <section aria-labelledby="class-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow="Level 1"
        title="Escolha uma Classe"
        description="Classe define dado de vida, proficiencias, salvaguardas e recursos."
        id="class-options-title"
        searchId="class-filter"
        searchLabel="Filtrar classes"
        searchValue={searchQuery}
        searchPlaceholder="Nome, fonte ou recurso..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      <div className="mb-4">
        <StartingLevelStepper />
      </div>

      {filteredClasses.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((entry) => (
            <ClassOptionCard
              key={entry.id}
              classEntry={entry}
              selected={selectedClassId === entry.id}
              disabled={disabled}
              onSelect={() => onSelectClass(entry.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            Nenhuma classe encontrada
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Tente buscar por nome, fonte ou recurso inicial.
          </p>
        </div>
      )}
    </section>
  );
}

function ClassOptionCard({
  classEntry,
  selected,
  disabled,
  onSelect,
}: {
  classEntry: BuilderClass;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const tone = getClassTone(classEntry);
  const tags = getClassTags(classEntry);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <WizardChoiceCard
        title={classEntry.name}
        subtitle={classEntry.source}
        imageSrc={classEntry.image?.src}
        imageAlt={classEntry.image?.alt}
        isActive={selected}
        disabled={disabled}
        onClickDetails={() => setDetailsOpen(true)}
        onClickSelect={onSelect}
        tone={tone}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-subdued"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="line-clamp-3 flex-1 text-base leading-relaxed text-subdued">
          {classEntry.summary}
        </p>

        <div className="mt-5 grid gap-3 border-t border-white/[0.06] pt-4">
          <div className="grid grid-cols-2 gap-3">
            <ClassMetric
              label="DADO DE VIDA"
              value={`d${classEntry.hitDie}`}
              iconClassName={getHitDieIconClass(classEntry.hitDie)}
            />
            <ClassMetric label="FONTE" value={classEntry.source} />
          </div>
          <ClassSummaryLine
            label="Atributo Primario"
            value={formatList(classEntry.primaryAbility)}
          />
          <ClassSummaryLine
            label="Salvaguardas"
            value={formatList(classEntry.savingThrows)}
          />
          <div>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-subdued">
              Recursos de Nível 1
            </h4>
            <FeatureTagList
              features={classEntry.levelOneFeatures}
              emptyLabel="Nenhum"
              ariaLabel="Recursos de Nível 1"
            />
          </div>
        </div>
      </WizardChoiceCard>

      <ClassDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        classEntry={classEntry}
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
      />
    </>
  );
}

function ClassMetric({
  label,
  value,
  iconClassName,
}: {
  label: string;
  value: string;
  iconClassName?: string;
}) {
  return (
    <div className="rounded border border-white/[0.06] bg-muted px-3 py-2">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {iconClassName ? (
          <FontAwesomeIcon iconClassName={iconClassName} className="text-primary" />
        ) : null}
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-bold text-foreground">
        {value || "-"}
      </p>
    </div>
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
  const combatRole = classEntry.spellcastingAbility ? "Conjurador" : "Marcial";
  const armorRole = classEntry.armorProficiencies.some((entry) =>
    normalizeSearchText(entry).includes("heavy"),
  )
    ? "Linha de frente"
    : classEntry.spellcastingAbility
      ? classEntry.spellcastingAbility
      : "Especialista";

  return [combatRole, armorRole].filter(Boolean).slice(0, 2);
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
  selectedSkills,
  selectedFeatureChoices,
  disabled,
  onSelectedSkillsChange,
  onSkillTrainingChange,
  onClassFeatureChoiceChange,
}: {
  selectedClass?: BuilderClass;
  selectedSkills: string[];
  selectedFeatureChoices: Record<string, string[]>;
  disabled: boolean;
  onSelectedSkillsChange: (skills: string[]) => void;
  onSkillTrainingChange: (skill: string, level: SkillTrainingLevel) => void;
  onClassFeatureChoiceChange: (choiceId: string, values: string[]) => void;
}) {
  if (!selectedClass) {
    return (
      <section className="rounded-lg border border-white/[0.06] bg-card p-4 text-sm text-subdued">
        Escolha uma classe antes de configurar recursos.
      </section>
    );
  }

  const maxSkills = selectedClass.skillChoices.count;

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
        title="Recursos de Classe"
        description="Escolha as pericias iniciais da classe. Proficiencia, meia proficiencia e expertise ficam separadas para calculo posterior."
        id="class-features-title"
      />
      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="rounded-lg border border-white/[0.06] bg-card p-4">
          <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Pericias da classe ({selectedSkills.length}/{maxSkills})
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
            PROFICIÊNCIAS INICIAIS DA CLASSE
          </h3>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-subdued">
            <ClassSummaryLine
              label="Armaduras"
              value={formatList(selectedClass.armorProficiencies)}
            />
            <ClassSummaryLine
              label="Armas"
              value={formatList(selectedClass.weaponProficiencies)}
            />
            <ClassSummaryLine
              label="Ferramentas"
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
      <section className="rounded-lg border border-white/[0.06] bg-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Recursos Iniciais de Nível 1:
        </h3>
        <div className="mt-4">
          <FeatureTagList
            features={selectedClass.levelOneFeatures}
            emptyLabel="Recursos Iniciais de Nível 1"
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
      <legend className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {group.label} ({selectedValues.length}/{group.count})
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
  disabled,
  onSelectBackground,
  onSetBonuses,
  onCommitBackground,
}: {
  backgrounds: BuilderBackground[];
  selectedBackgroundId: string;
  selectedBonuses: AttributeBonuses;
  disabled: boolean;
  onSelectBackground: (backgroundId: string) => void;
  onSetBonuses: (bonuses: AttributeBonuses) => void;
  onCommitBackground: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredBackgrounds = useMemo(
    () =>
      backgrounds.filter((entry) =>
        matchesBackgroundSearch(entry, searchQuery),
      ),
    [backgrounds, searchQuery],
  );
  const resultCountLabel =
    filteredBackgrounds.length === 1
      ? "1 antecedente encontrado"
      : `${filteredBackgrounds.length} antecedentes encontrados`;

  return (
    <section aria-labelledby="background-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow="Origin Rules"
        title="Escolha seu Antecedente"
        description="O passado molda o destino. Escolha a origem que definiu sua jornada antes de empunhar armas ou magia."
        id="background-options-title"
        searchId="background-filter"
        searchLabel="Filtrar antecedentes"
        searchValue={searchQuery}
        searchPlaceholder="Nome, talento ou descricao..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      {filteredBackgrounds.length ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBackgrounds.map((entry) => (
            <BackgroundCard
              key={entry.id}
              background={entry}
              selected={selectedBackgroundId === entry.id}
              selectedBonuses={selectedBackgroundId === entry.id ? selectedBonuses : {}}
              disabled={disabled}
              onSelect={() => onSelectBackground(entry.id)}
              onBonusesChange={(bonuses) => {
                onSelectBackground(entry.id);
                onSetBonuses(bonuses);
              }}
              onCommit={onCommitBackground}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            Nenhum antecedente encontrado
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Tente buscar por nome, talento de origem ou descricao.
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
  disabled,
  onSelectSpecies,
}: {
  species: BuilderSpecies[];
  selectedSpeciesId: string;
  disabled: boolean;
  onSelectSpecies: (speciesId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredSpecies = useMemo(
    () => species.filter((entry) => matchesSpeciesSearch(entry, searchQuery)),
    [species, searchQuery],
  );
  const resultCountLabel =
    filteredSpecies.length === 1
      ? "1 especie encontrada"
      : `${filteredSpecies.length} especies encontradas`;

  return (
    <section aria-labelledby="species-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow="Rules 2024"
        title="Escolha uma Raca/Especie"
        description="Especies 2024 fornecem tracos, tamanho, deslocamento, sentidos e resistencias."
        id="species-options-title"
        searchId="species-filter"
        searchLabel="Filtrar especies"
        searchValue={searchQuery}
        searchPlaceholder="Nome, fonte ou traco..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      {filteredSpecies.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSpecies.map((entry) => (
            <SpeciesOptionCard
              key={entry.id}
              species={entry}
              selected={selectedSpeciesId === entry.id}
              disabled={disabled}
              onSelect={() => onSelectSpecies(entry.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            Nenhuma especie encontrada
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Tente buscar por nome, fonte ou traco racial.
          </p>
        </div>
      )}
    </section>
  );
}

function SpeciesOptionCard({
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <WizardChoiceCard
        title={species.name}
        subtitle={species.summary}
        subtitleVariant="summary"
        imageSrc={species.image?.src}
        imageAlt={species.image?.alt}
        isActive={selected}
        disabled={disabled}
        selectedLabel="SELECIONADO"
        onClickDetails={() => setDetailsOpen(true)}
        onClickSelect={onSelect}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-subdued">
            {species.source}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ClassMetric label="Tamanho" value={species.size} />
          <ClassMetric label="Deslocamento" value={`${species.speed} ft.`} />
        </div>

        <div className="mt-5 grid gap-3 border-t border-white/[0.06] pt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-subdued">
            Tracos Raciais
          </h4>
          <FeatureTagList
            features={species.traits}
            emptyLabel="Nenhum traco racial"
            ariaLabel="Tracos Raciais"
          />
        </div>
      </WizardChoiceCard>

      <SpeciesDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        species={species}
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
      />
    </>
  );
}

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
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,920px)] md:max-w-6xl md:flex-row md:rounded-xl">
            <Dialog.Title className="sr-only">{species.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {`Detalhes de ${species.name}: ${species.summary}`}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Fechar detalhes de ${species.name}`}
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
    <aside className="flex max-h-[48dvh] w-full shrink-0 flex-col overflow-y-auto border-b border-white/[0.06] bg-muted md:h-full md:max-h-none md:w-80 md:border-b-0 md:border-r">
      <div className="relative h-56 shrink-0 overflow-hidden bg-card md:h-[300px]">
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
            Biologia da especie
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ClassDetailStat
              icon={<Ruler aria-hidden="true" className="h-4 w-4" />}
              label="Tamanho"
              value={species.size}
              description="Porte"
              compact
            />
            <ClassDetailStat
              icon={<Footprints aria-hidden="true" className="h-4 w-4" />}
              label="Deslocamento"
              value={`${species.speed} ft.`}
              description="Caminhada"
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
          {selected ? "Espécie Selecionada" : "Selecionar Raça"}
        </button>
      </div>
    </aside>
  );
}

function SpeciesDetailsMain({ species }: { species: BuilderSpecies }) {
  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-surface-nested scroll-smooth">
      <div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6 lg:p-8">
        <section aria-labelledby={`${species.id}-description-title`}>
          <ClassSectionHeading
            id={`${species.id}-description-title`}
            icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
          >
            Descricao
          </ClassSectionHeading>
          <ContentBlocks
            blocks={
              species.descriptionBlocks.length
                ? species.descriptionBlocks
                : [{ type: "paragraph", text: species.description }]
            }
          />
        </section>

        <section aria-labelledby={`${species.id}-traits-title`}>
          <ClassSectionHeading
            id={`${species.id}-traits-title`}
            icon={<ScrollText aria-hidden="true" className="h-5 w-5" />}
            withRule
          >
            Tracos Raciais
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
        Escolha uma especie antes de configurar detalhes.
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
        title="Detalhes da Especie"
        description="Escolha opcoes internas de especie e dois idiomas padrao."
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
          <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Idiomas ({selectedLanguages.length}/{languageLimit})
          </legend>
          <div className="grid gap-5">
            <LanguageGroup
              title="Comuns"
              languages={languages.filter((language) => language.type === "standard")}
              selectedLanguages={selectedLanguages}
              languageLimit={languageLimit}
              disabled={disabled}
              onToggleLanguage={toggleLanguage}
            />
            <LanguageGroup
              title="Raros e Exoticos"
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
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,920px)] md:max-w-6xl md:flex-row md:rounded-xl">
            <Dialog.Title className="sr-only">{classEntry.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {`Detalhes de ${classEntry.name}: ${classEntry.summary}`}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Fechar detalhes de ${classEntry.name}`}
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
    <aside className="flex max-h-[48dvh] w-full shrink-0 flex-col overflow-y-auto border-b border-white/[0.06] bg-muted md:h-full md:max-h-none md:w-80 md:border-b-0 md:border-r">
      <div className="relative h-56 shrink-0 overflow-hidden bg-card md:h-[300px]">
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
            Identidade da classe
          </h3>
          <ClassDetailStat
            icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
            label="Atributo Primario"
            value={formatList(classEntry.primaryAbility)}
            description="Base para as principais mecanicas da classe."
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
              label="Dado de Vida"
              value={`d${classEntry.hitDie}`}
              description="Por nivel"
              compact
            />
            <ClassDetailStat
              icon={<Shield aria-hidden="true" className="h-4 w-4" />}
              label="Resistencias"
              value={formatList(classEntry.savingThrows)}
              description="Salvaguardas"
              compact
            />
          </div>
        </section>

        <section>
          <h3 className="border-b border-white/[0.06] pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Proficiencias Iniciais
          </h3>
          <dl className="mt-3 grid gap-3 text-sm leading-6">
            <ClassProficiencyLine
              label="Armaduras"
              value={formatList(classEntry.armorProficiencies)}
            />
            <ClassProficiencyLine
              label="Armas"
              value={formatList(classEntry.weaponProficiencies)}
            />
            <ClassProficiencyLine
              label="Ferramentas"
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
          {selected ? "Classe Selecionada" : "Selecionar Classe"}
        </button>
      </div>
    </aside>
  );
}

function ClassDetailsMain({ classEntry }: { classEntry: BuilderClass }) {
  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-surface-nested scroll-smooth">
      <div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6 lg:p-8">
        <section aria-labelledby={`${classEntry.id}-description-title`}>
          <ClassSectionHeading
            id={`${classEntry.id}-description-title`}
            icon={<BookOpen aria-hidden="true" className="h-5 w-5" />}
          >
            Descricao
          </ClassSectionHeading>
          <ContentBlocks
            blocks={
              classEntry.descriptionBlocks.length
                ? classEntry.descriptionBlocks
                : [{ type: "paragraph", text: classEntry.description }]
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
              Conjuracao
            </ClassSectionHeading>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-accent">
              <ClassSummaryLine
                label="Habilidade de Conjuracao"
                value={classEntry.spellcastingAbility}
              />
              <ClassSummaryLine
                label="CD do TR de Magia"
                value={`8 + Bonus de Proficiencia + Modificador de ${classEntry.spellcastingAbility}`}
              />
              <ClassSummaryLine
                label="Ataque de Magia"
                value={`Bonus de Proficiencia + Modificador de ${classEntry.spellcastingAbility}`}
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
            Recursos de Classe
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
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Progressão de Classe
      </h3>
      <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-3">Nível</th>
              <th scope="col" className="px-3 py-3">Bônus de Proficiência</th>
              <th scope="col" className="px-3 py-3">Recursos</th>
              {hasSpellSlots ? <th scope="col" className="px-3 py-3">Espaços de Magia</th> : null}
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
    : [{ type: "paragraph" as const, text: feature.description }];

  return (
    <ContentBlocks blocks={blocks} keyPrefix={feature.name} />
  );
}

function ContentBlocks({
  blocks,
  keyPrefix = "content",
}: {
  blocks: BuilderFeatureBlock[];
  keyPrefix?: string;
}) {
  return (
    <div className="grid gap-3 text-sm leading-6 text-subdued">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`${keyPrefix}-${index}`} className="list-disc space-y-2 pl-5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={`${keyPrefix}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
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

function useCharacterBuilderState(): CharacterBuilderState {
  const ruleset = useCharacterStore((state) => state.ruleset);
  const level = useCharacterStore((state) => state.level);
  const selectedSpeciesId = useCharacterStore((state) => state.selectedSpeciesId);
  const selectedClassId = useCharacterStore((state) => state.selectedClassId);
  const selectedSubclassId = useCharacterStore(
    (state) => state.selectedSubclassId,
  );
  const selectedBackgroundId = useCharacterStore(
    (state) => state.selectedBackgroundId,
  );
  const inventory = useCharacterStore(
    (state) => state.inventory,
  );
  const equipmentChoicesBySource = useCharacterStore(
    (state) => state.equipmentChoicesBySource,
  );
  const maxUnlockedStepIndex = useCharacterStore(
    (state) => state.maxUnlockedStepIndex,
  );
  const pendingChoiceIds = useCharacterStore((state) => state.pendingChoiceIds);
  const classSkillProficiencies = useCharacterStore(
    (state) => state.classSkillProficiencies,
  );
  const skillTraining = useCharacterStore((state) => state.skillTraining);
  const classFeatureChoices = useCharacterStore(
    (state) => state.classFeatureChoices,
  );
  const asiOrFeatByLevel = useCharacterStore(
    (state) => state.asiOrFeatByLevel,
  );
  const speciesChoices = useCharacterStore((state) => state.speciesChoices);
  const speciesLanguages = useCharacterStore((state) => state.speciesLanguages);
  const attributeGenerationMethod = useCharacterStore(
    (state) => state.attributeGenerationMethod,
  );
  const baseAttributes = useCharacterStore((state) => state.baseAttributes);
  const backgroundAbilityBonuses = useCharacterStore(
    (state) => state.backgroundAbilityBonuses,
  );
  const description = useCharacterStore((state) => state.description);

  return useMemo(
    () => ({
      ruleset,
      level,
      selectedSpeciesId,
      selectedClassId,
      selectedSubclassId,
      selectedBackgroundId,
      inventory,
      equipmentChoicesBySource,
      maxUnlockedStepIndex,
      pendingChoiceIds,
      classSkillProficiencies,
      skillTraining,
      classFeatureChoices,
      asiOrFeatByLevel,
      speciesChoices,
      speciesLanguages,
      attributeGenerationMethod,
      baseAttributes,
      backgroundAbilityBonuses,
      description,
    }),
    [
      ruleset,
      level,
      selectedSpeciesId,
      selectedClassId,
      selectedSubclassId,
      selectedBackgroundId,
      inventory,
      equipmentChoicesBySource,
      maxUnlockedStepIndex,
      pendingChoiceIds,
      classSkillProficiencies,
      skillTraining,
      classFeatureChoices,
      asiOrFeatByLevel,
      speciesChoices,
      speciesLanguages,
      attributeGenerationMethod,
      baseAttributes,
      backgroundAbilityBonuses,
      description,
    ],
  );
}

function useCharacterBuilderActions() {
  return {
    selectSpecies: useCharacterStore((state) => state.selectSpecies),
    selectClass: useCharacterStore((state) => state.selectClass),
    selectBackground: useCharacterStore((state) => state.selectBackground),
    addInventoryItem: useCharacterStore((state) => state.addInventoryItem),
    setInventoryQuantity: useCharacterStore((state) => state.setInventoryQuantity),
    removeInventoryItem: useCharacterStore((state) => state.removeInventoryItem),
    setEquipmentSourceMode: useCharacterStore(
      (state) => state.setEquipmentSourceMode,
    ),
    setEquipmentSourceOption: useCharacterStore(
      (state) => state.setEquipmentSourceOption,
    ),
    unlockStep: useCharacterStore((state) => state.unlockStep),
    commitCurrentBuild: useCharacterStore((state) => state.commitCurrentBuild),
    setPendingChoiceIds: useCharacterStore((state) => state.setPendingChoiceIds),
    setClassSkillProficiencies: useCharacterStore(
      (state) => state.setClassSkillProficiencies,
    ),
    setSkillTraining: useCharacterStore((state) => state.setSkillTraining),
    setClassFeatureChoice: useCharacterStore(
      (state) => state.setClassFeatureChoice,
    ),
    setSpeciesChoice: useCharacterStore((state) => state.setSpeciesChoice),
    setSpeciesLanguages: useCharacterStore((state) => state.setSpeciesLanguages),
    setAttributeGenerationMethod: useCharacterStore(
      (state) => state.setAttributeGenerationMethod,
    ),
    setBackgroundAbilityBonuses: useCharacterStore(
      (state) => state.setBackgroundAbilityBonuses,
    ),
    setDescriptionField: useCharacterStore((state) => state.setDescriptionField),
    setForca: useCharacterStore((state) => state.setForca),
    setDestreza: useCharacterStore((state) => state.setDestreza),
    setConstituicao: useCharacterStore((state) => state.setConstituicao),
    setInteligencia: useCharacterStore((state) => state.setInteligencia),
    setSabedoria: useCharacterStore((state) => state.setSabedoria),
    setCarisma: useCharacterStore((state) => state.setCarisma),
  };
}
