"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  getRequiredLanguageCount,
  validateBuilderStep,
} from "@/rules/builderValidation";
import { useCharacterStore } from "@/store/useCharacterStore";
import type { CharacterBuilderState, SkillTrainingLevel } from "@/store/characterStore.types";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderClassFeatureChoiceGroup,
  BuilderEquipmentOption,
  BuilderFeatureBlock,
  BuilderLanguage,
  BuilderSpecies,
  BuilderStepSlug,
} from "@/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/types/dnd";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";
import { ChoiceCard } from "@/src/components/molecules/ChoiceCard";
import { DetailDialog } from "@/src/components/molecules/DetailDialog";
import { FeatureTagList } from "@/src/components/molecules/FeatureTagList";
import { TagList } from "@/src/components/molecules/TagList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AttributeEditor } from "@/src/components/organisms/AttributeEditor";
import { DescriptionFields } from "@/src/components/organisms/DescriptionFields";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { SummaryTemplate } from "@/src/components/templates/SummaryTemplate";

interface BuilderStepPanelProps {
  step: BuilderStepSlug;
  species: BuilderSpecies[];
  classes: BuilderClass[];
  backgrounds: BuilderBackground[];
  equipment: BuilderEquipmentOption[];
  languages: BuilderLanguage[];
}

const attributeKeys: readonly AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];
const attributeLabels: Record<AttributeKey, string> = {
  forca: "Forca",
  destreza: "Destreza",
  constituicao: "Constituicao",
  inteligencia: "Inteligencia",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

export function BuilderStepPanel({
  step,
  species,
  classes,
  backgrounds,
  equipment,
  languages,
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
  const selectedSpecies = species.find(
    (entry) => entry.id === characterState.selectedSpeciesId,
  );
  const languageLimit = getRequiredLanguageCount(characterState);

  if (!canUseCurrentStep) {
    return (
      <div className="grid gap-5">
        <section className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-5">
          <h2 className="font-serif text-xl font-bold text-white">
            Etapa bloqueada
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#b0b5cc]">
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
        />
      ) : null}

      {step === "especie" ? (
        <SpeciesStep
          species={species}
          selectedSpeciesId={characterState.selectedSpeciesId}
          disabled={!canUseCurrentStep}
          onSelectSpecies={actions.selectSpecies}
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
        <EquipmentChecklist
          equipment={equipment}
          selectedClass={selectedClass}
          acquisitionMode={characterState.equipmentAcquisitionMode}
          selectedEquipmentIds={characterState.selectedEquipmentIds}
          onAcquisitionModeChange={actions.setEquipmentAcquisitionMode}
          onToggleEquipment={actions.toggleEquipment}
        />
      ) : null}

      {step === "descricao" ? (
        <DescriptionFields
          description={characterState.description}
          onFieldChange={actions.setDescriptionField}
        />
      ) : null}

      {step === "conclusao" ? <SummaryTemplate /> : null}

      {nextStep || previousStep ? (
        <div className="sticky bottom-0 z-10 flex justify-between gap-3 border-t border-white/[0.06] bg-[#12131a]/95 py-4 backdrop-blur">
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
  return (
    <section aria-labelledby="class-options-title" className="grid gap-5">
      <StepHeader
        eyebrow="Level 1"
        title="Escolha uma Classe"
        description="Classe define dado de vida, proficiencias, salvaguardas e recursos."
        id="class-options-title"
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {classes.map((entry) => (
          <ChoiceCard
            key={entry.id}
            title={entry.name}
            eyebrow={`d${entry.hitDie} HP · ${entry.source}`}
            selected={selectedClassId === entry.id}
            disabled={disabled}
            showDefaultAction={false}
            onSelect={() => onSelectClass(entry.id)}
            footer={
              <div className="flex w-full gap-2">
                <DetailDialog
                  title={entry.name}
                  triggerLabel="DETAILS"
                  triggerClassName="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
                >
                  <ClassDetails classEntry={entry} />
                </DetailDialog>
                <button
                  type="button"
                  onClick={() => onSelectClass(entry.id)}
                  disabled={disabled}
                  aria-pressed={selectedClassId === entry.id}
                  className="flex-1 rounded-md border border-[#c41e1e] bg-[#c41e1e] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white outline-none transition hover:bg-[#a91515] focus-visible:ring-2 focus-visible:ring-[#f3c969] disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-[#f3c969] aria-pressed:bg-[#f3c969] aria-pressed:text-[#12131a]"
                >
                  {selectedClassId === entry.id ? "SELECTED" : "SELECT"}
                </button>
              </div>
            }
          >
            <div className="grid gap-3">
              <p className="text-sm leading-6 text-[#b0b5cc]">
                {entry.summary}
              </p>
              <ClassSummaryLine
                label="Primary Ability"
                value={formatList(entry.primaryAbility)}
              />
              <ClassSummaryLine label="Saves" value={formatList(entry.savingThrows)} />
              <ClassSummaryLine
                label="Pericias"
                value={`Escolha ${entry.skillChoices.count}`}
              />
              <ClassSummaryLine label="Proficiências de Armadura" value="">
                <TagList
                  items={entry.armorProficiencies}
                  emptyLabel="Nenhuma"
                />
              </ClassSummaryLine>
              <ClassSummaryLine label="Proficiências de Armas" value="">
                <TagList
                  items={entry.weaponProficiencies}
                  emptyLabel="Nenhuma"
                />
              </ClassSummaryLine>
              <ClassSummaryLine label="Recursos de Nível 1" value="">
                <FeatureTagList
                  features={entry.levelOneFeatures}
                  emptyLabel="Nenhum"
                  ariaLabel="Recursos de Nível 1"
                />
              </ClassSummaryLine>
            </div>
          </ChoiceCard>
        ))}
      </div>
    </section>
  );
}

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
      <section className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4 text-sm text-[#b0b5cc]">
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
        <fieldset className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4">
          <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
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
                      ? "border-[#c41e1e] bg-[#c41e1e]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-[#b0b5cc]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled || (!checked && selectedSkills.length >= maxSkills)}
                    onChange={() => toggleSkill(skill)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-[#12131a] accent-[#c41e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41e1e]"
                  />
                  <span>{skill}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <section className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
            PROFICIÊNCIAS INICIAIS DA CLASSE
          </h3>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-[#d7d9e6]">
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
      <section className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
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
    <fieldset className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4">
      <legend className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
        {group.label} ({selectedValues.length}/{group.count})
      </legend>
      <p className="mb-4 text-sm leading-6 text-[#b0b5cc]">
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
                  ? "border-[#c41e1e] bg-[#c41e1e]/10 text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-[#b0b5cc]"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={
                  disabled || (!checked && selectedValues.length >= group.count)
                }
                onChange={() => toggleValue(option.value)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#12131a] accent-[#c41e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41e1e]"
              />
              <span>
                <span className="block font-semibold">{option.label}</span>
                {option.description ? (
                  <span className="block text-xs text-[#7a7e99]">
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
}: {
  backgrounds: BuilderBackground[];
  selectedBackgroundId: string;
  selectedBonuses: AttributeBonuses;
  disabled: boolean;
  onSelectBackground: (backgroundId: string) => void;
  onSetBonuses: (bonuses: AttributeBonuses) => void;
}) {
  return (
    <section aria-labelledby="background-options-title" className="grid gap-5">
      <StepHeader
        eyebrow="Origin Rules"
        title="Escolha um Antecedente"
        description="Em 2024, o Antecedente fornece bonus de atributo, Talento de Origem, pericias, ferramentas e equipamento."
        id="background-options-title"
      />

      <div className="grid gap-4">
        {backgrounds.map((entry) => (
          <ChoiceCard
            key={entry.id}
            title={entry.name}
            eyebrow={`${entry.source} · ${entry.originFeat || "Origin Feat"}`}
            selected={selectedBackgroundId === entry.id}
            disabled={disabled}
            showDefaultAction={false}
            onSelect={() => onSelectBackground(entry.id)}
            footer={
              <div className="flex w-full gap-2">
                <DetailDialog
                  title={entry.name}
                  triggerLabel="DETAILS"
                  triggerClassName="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
                >
                  <BackgroundDetails background={entry} />
                </DetailDialog>
                <button
                  type="button"
                  onClick={() => onSelectBackground(entry.id)}
                  disabled={disabled}
                  aria-pressed={selectedBackgroundId === entry.id}
                  className="flex-1 rounded-md border border-[#c41e1e] bg-[#c41e1e] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white outline-none transition hover:bg-[#a91515] focus-visible:ring-2 focus-visible:ring-[#f3c969] disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-[#f3c969] aria-pressed:bg-[#f3c969] aria-pressed:text-[#12131a]"
                >
                  {selectedBackgroundId === entry.id ? "SELECTED" : "SELECT"}
                </button>
              </div>
            }
          >
            <div className="grid gap-4">
              <section className="grid gap-3">
                <p className="text-sm leading-6 text-[#b0b5cc]">
                  {entry.summary}
                </p>
                <BackgroundRewardSummary background={entry} />
              </section>
              <BackgroundAbilitySelector
                background={entry}
                selected={selectedBackgroundId === entry.id ? selectedBonuses : {}}
                disabled={disabled || selectedBackgroundId !== entry.id}
                onChange={(bonuses) => {
                  onSelectBackground(entry.id);
                  onSetBonuses(bonuses);
                }}
              />
            </div>
          </ChoiceCard>
        ))}
      </div>
    </section>
  );
}

function BackgroundRewardSummary({ background }: { background: BuilderBackground }) {
  return (
    <section className="grid gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
        Recompensas
      </h3>
      <div className="grid gap-2 text-sm leading-6 text-[#d7d9e6]">
        <ClassSummaryLine
          label="Talento"
          value={background.originFeat || "-"}
        />
        <ClassSummaryLine
          label="Pericias"
          value={formatList(background.skillProficiencies)}
        />
        <ClassSummaryLine
          label="Ferramentas"
          value={formatList(background.toolProficiencies)}
        />
        <ClassSummaryLine
          label="Equipamento"
          value={background.equipmentSummary || "-"}
        />
      </div>
    </section>
  );
}

function BackgroundAbilitySelector({
  background,
  selected,
  disabled,
  onChange,
}: {
  background: BuilderBackground;
  selected: AttributeBonuses;
  disabled: boolean;
  onChange: (bonuses: AttributeBonuses) => void;
}) {
  const splitOption = background.abilityOptions.find(
    (option) => option.mode === "+2/+1",
  );
  const tripleOption = background.abilityOptions.find(
    (option) => option.mode === "+1/+1/+1",
  );
  const plusTwoAttribute = findAttributeByBonus(selected, 2);
  const plusOneAttribute = findAttributeByBonus(selected, 1);
  const tripleBonuses =
    tripleOption?.attributes.reduce<AttributeBonuses>(
      (bonuses, attribute) => ({ ...bonuses, [attribute]: 1 }),
      {},
    ) ?? {};
  const isTripleSelected = tripleOption
    ? hasSameBonuses(selected, tripleBonuses)
    : false;

  return (
    <fieldset className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7a7e99]">
        Bonus de atributo
      </legend>
      {splitOption ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a7e99]">
              Atributo +2
            </span>
            <select
              value={plusTwoAttribute ?? ""}
              disabled={disabled}
              onChange={(event) =>
                onChange(createSplitBonuses(event.target.value, plusOneAttribute))
              }
              className="rounded-md border border-white/10 bg-[#12131a] px-3 py-2 text-[#e8e9f0] outline-none focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 disabled:opacity-50"
            >
              <option value="">Selecione</option>
              {splitOption.attributes.map((attribute) => (
                <option
                  key={attribute}
                  value={attribute}
                  disabled={attribute === plusOneAttribute}
                >
                  {attributeLabels[attribute]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a7e99]">
              Atributo +1
            </span>
            <select
              value={plusOneAttribute ?? ""}
              disabled={disabled}
              onChange={(event) =>
                onChange(createSplitBonuses(plusTwoAttribute, event.target.value))
              }
              className="rounded-md border border-white/10 bg-[#12131a] px-3 py-2 text-[#e8e9f0] outline-none focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 disabled:opacity-50"
            >
              <option value="">Selecione</option>
              {splitOption.attributes.map((attribute) => (
                <option
                  key={attribute}
                  value={attribute}
                  disabled={attribute === plusTwoAttribute}
                >
                  {attributeLabels[attribute]}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {tripleOption ? (
        <button
          type="button"
          aria-pressed={isTripleSelected}
          disabled={disabled}
          onClick={() => onChange(tripleBonuses)}
          className="mt-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-[#c41e1e] aria-pressed:bg-[#c41e1e] aria-pressed:text-white"
        >
          +1 / +1 / +1 em {tripleOption.attributes.map((attribute) => attributeLabels[attribute]).join(", ")}
        </button>
      ) : null}
    </fieldset>
  );
}

function BackgroundDetails({ background }: { background: BuilderBackground }) {
  return (
    <div className="grid gap-5">
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
          Lore
        </h3>
        <ContentBlocks
          blocks={
            background.descriptionBlocks.length
              ? background.descriptionBlocks
              : [{ type: "paragraph", text: background.description }]
          }
        />
      </section>
      <BackgroundRewardSummary background={background} />
    </div>
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
  return (
    <section aria-labelledby="species-options-title" className="grid gap-5">
      <StepHeader
        eyebrow="Rules 2024"
        title="Escolha uma Raca/Especie"
        description="Especies 2024 fornecem tracos, tamanho, deslocamento, sentidos e resistencias."
        id="species-options-title"
      />

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {species.map((entry) => (
          <ChoiceCard
            key={entry.id}
            title={entry.name}
            eyebrow={`${entry.source} · ${entry.ruleset}`}
            selected={selectedSpeciesId === entry.id}
            disabled={disabled}
            showDefaultAction={false}
            onSelect={() => onSelectSpecies(entry.id)}
            footer={
              <div className="flex w-full gap-2">
                <DetailDialog
                  title={entry.name}
                  triggerLabel="DETAILS"
                  triggerClassName="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
                >
                  <SpeciesDetails species={entry} />
                </DetailDialog>
                <button
                  type="button"
                  onClick={() => onSelectSpecies(entry.id)}
                  disabled={disabled}
                  aria-pressed={selectedSpeciesId === entry.id}
                  className="flex-1 rounded-md border border-[#c41e1e] bg-[#c41e1e] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white outline-none transition hover:bg-[#a91515] focus-visible:ring-2 focus-visible:ring-[#f3c969] disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-[#f3c969] aria-pressed:bg-[#f3c969] aria-pressed:text-[#12131a]"
                >
                  {selectedSpeciesId === entry.id ? "SELECIONADO" : "SELECIONAR"}
                </button>
              </div>
            }
          >
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <DescriptionPair label="Tamanho" value={entry.size} />
              <DescriptionPair label="Deslocamento" value={`${entry.speed} ft.`} />
            </dl>
            <div className="mt-4 grid gap-3">
              <p className="text-sm leading-6 text-[#b0b5cc]">
                {entry.summary}
              </p>
              <FeatureTagList
                features={entry.traits}
                emptyLabel="Tracos de especie"
              />
            </div>
          </ChoiceCard>
        ))}
      </div>
    </section>
  );
}

function SpeciesDetails({ species }: { species: BuilderSpecies }) {
  return (
    <div className="grid gap-6">
      {species.image ? (
        <div className="rounded-lg border border-white/[0.08] bg-black/20 p-2">
          <img
            src={species.image.src}
            alt={species.image.alt}
            className="w-full object-contain"
          />
        </div>
      ) : null}
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
          Descricao Geral
        </h3>
        <ContentBlocks
          blocks={
            species.descriptionBlocks.length
              ? species.descriptionBlocks
              : [{ type: "paragraph", text: species.description }]
          }
        />
      </section>
      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
          Tracos e Beneficios
        </h3>
        <div className="grid gap-4">
          {species.traits.map((trait) => (
            <article
              key={trait.name}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"
            >
              <h4 className="font-serif text-base font-bold text-white">
                {trait.name}
              </h4>
              <FeatureBlocks feature={trait} />
            </article>
          ))}
        </div>
      </section>
    </div>
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
      <section className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4 text-sm text-[#b0b5cc]">
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
            className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4"
          >
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
              {group.label}
            </legend>
            <div className="grid gap-2">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className={`grid cursor-pointer grid-cols-[auto_1fr] gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    selectedChoices[group.id] === option.value
                      ? "border-[#c41e1e] bg-[#c41e1e]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-[#b0b5cc]"
                  }`}
                >
                  <input
                    type="radio"
                    name={group.id}
                    checked={selectedChoices[group.id] === option.value}
                    disabled={disabled}
                    onChange={() => onSpeciesChoiceChange(group.id, option.value)}
                    className="mt-1 h-4 w-4 border-white/20 bg-[#12131a] accent-[#c41e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41e1e]"
                  />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    {option.description ? (
                      <span className="block text-xs text-[#7a7e99]">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <fieldset className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4">
          <legend className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
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
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
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
                  ? "border-[#c41e1e] bg-[#c41e1e]/10 text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-[#b0b5cc]"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={
                  disabled || (!checked && selectedLanguages.length >= languageLimit)
                }
                onChange={() => onToggleLanguage(language.name)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#12131a] accent-[#c41e1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c41e1e]"
              />
              <span>{language.name}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function ClassDetails({ classEntry }: { classEntry: BuilderClass }) {
  return (
    <div className="grid gap-6">
      {classEntry.image ? (
        <div className="rounded-lg border border-white/[0.08] bg-black/20 p-2">
          <img
            src={classEntry.image.src}
            alt={classEntry.image.alt}
            className="w-full object-contain"
          />
        </div>
      ) : null}

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
          Descricao
        </h3>
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
        <section className="rounded-lg border border-[#f3c969]/25 bg-[#f3c969]/10 p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#f3c969]">
            Spellcasting
          </h3>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-[#f8e5b7]">
            <ClassSummaryLine
              label="Habilidade de Conjuração"
              value={classEntry.spellcastingAbility}
            />
            <ClassSummaryLine
              label="CD do TR de Magia"
              value={`8 + Bônus de Proficiência + Modificador de ${classEntry.spellcastingAbility}`}
            />
            <ClassSummaryLine
              label="Ataque de Magia"
              value={`Bônus de Proficiência + Modificador de ${classEntry.spellcastingAbility}`}
            />
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
          Recursos de Classe
        </h3>
        <Accordion type="single" collapsible className="rounded-lg border border-white/[0.08] px-4">
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
  );
}

function ClassProgressionTable({ classEntry }: { classEntry: BuilderClass }) {
  const hasSpellSlots = classEntry.progressionRows.some(
    (row) => row.spellSlots.length > 0,
  );

  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a7e99]">
        Progressão de Classe
      </h3>
      <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-[#7a7e99]">
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
                <td className="px-3 py-3 font-semibold text-white">Level {row.level}</td>
                <td className="px-3 py-3 text-[#d7d9e6]">{row.proficiencyBonus}</td>
                <td className="px-3 py-3 text-[#d7d9e6]">
                  {formatList(row.features)}
                </td>
                {hasSpellSlots ? (
                  <td className="px-3 py-3 text-[#d7d9e6]">
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
    <div className="grid gap-3 text-sm leading-6 text-[#d7d9e6]">
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
        <strong className="font-semibold text-[#e8e9f0]">{label}:</strong>
        {value ? <span className="text-[#b0b5cc]"> {value}</span> : null}
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
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#c41e1e]">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-1 font-serif text-xl font-bold tracking-wide text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7a7e99]">
        {description}
      </p>
    </div>
  );
}

function DescriptionPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[#7a7e99]">{label}</dt>
      <dd className="font-semibold text-[#e8e9f0]">{value}</dd>
    </div>
  );
}

function findAttributeByBonus(
  bonuses: AttributeBonuses,
  bonus: number,
): AttributeKey | undefined {
  return attributeKeys.find((attribute) => bonuses[attribute] === bonus);
}

function createSplitBonuses(
  plusTwoAttribute: string | undefined,
  plusOneAttribute: string | undefined,
): AttributeBonuses {
  const bonuses: AttributeBonuses = {};

  if (isAttributeKey(plusTwoAttribute)) {
    bonuses[plusTwoAttribute] = 2;
  }

  if (isAttributeKey(plusOneAttribute) && plusOneAttribute !== plusTwoAttribute) {
    bonuses[plusOneAttribute] = 1;
  }

  return bonuses;
}

function isAttributeKey(value: string | undefined): value is AttributeKey {
  return attributeKeys.includes(value as AttributeKey);
}

function hasSameBonuses(first: AttributeBonuses, second: AttributeBonuses): boolean {
  return attributeKeys.every(
    (attribute) => (first[attribute] ?? 0) === (second[attribute] ?? 0),
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
  const selectedBackgroundId = useCharacterStore(
    (state) => state.selectedBackgroundId,
  );
  const selectedEquipmentIds = useCharacterStore(
    (state) => state.selectedEquipmentIds,
  );
  const equipmentAcquisitionMode = useCharacterStore(
    (state) => state.equipmentAcquisitionMode,
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
      selectedBackgroundId,
      selectedEquipmentIds,
      equipmentAcquisitionMode,
      maxUnlockedStepIndex,
      pendingChoiceIds,
      classSkillProficiencies,
      skillTraining,
      classFeatureChoices,
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
      selectedBackgroundId,
      selectedEquipmentIds,
      equipmentAcquisitionMode,
      maxUnlockedStepIndex,
      pendingChoiceIds,
      classSkillProficiencies,
      skillTraining,
      classFeatureChoices,
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
    toggleEquipment: useCharacterStore((state) => state.toggleEquipment),
    setEquipmentAcquisitionMode: useCharacterStore(
      (state) => state.setEquipmentAcquisitionMode,
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
