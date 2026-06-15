"use client";

import { useMemo } from "react";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";
import { TagList } from "@/src/components/molecules/TagList";

const attributes = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[];

interface CharacterSheetPreviewProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function CharacterSheetPreview({
  collapsed = false,
  onToggleCollapsed,
}: CharacterSheetPreviewProps) {
  const characterState = useCharacterPreviewState();
  const summary = useMemo(
    () => selectCharacterSheetSummary(characterState),
    [characterState],
  );
  const description = useCharacterStore((state) => state.description);
  const speciesName = getBuilderSpecies().find(
    (entry) => entry.id === summary.speciesId,
  )?.name;
  const className = getBuilderClasses().find(
    (entry) => entry.id === summary.classId,
  )?.name;
  const backgroundName = getBuilderBackgrounds().find(
    (entry) => entry.id === summary.backgroundId,
  )?.name;

  return (
    <aside
      aria-labelledby="sheet-preview-title"
      className="border-t border-white/[0.06] bg-[#0f1018] xl:min-h-screen xl:border-l xl:border-t-0"
    >
      <div className="sticky top-0 max-h-screen overflow-y-auto px-4 py-5">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir informações do herói" : "Recolher informações do herói"}
          onClick={onToggleCollapsed}
          className="mb-4 flex min-h-10 w-full items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 text-sm font-bold text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/60 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
        >
          {collapsed ? "<" : ">"}
        </button>

        {collapsed ? (
          <div className="hidden xl:grid xl:place-items-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#c41e1e]/40 bg-[#1c1e2a] font-serif text-lg font-bold text-[#e8e9f0]"
            >
              {description.nome.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <p className="sr-only" id="sheet-preview-title">
              Ficha do herói recolhida
            </p>
          </div>
        ) : (
          <>
        <header className="border-b border-white/[0.06] pb-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-[#c41e1e]/40 bg-gradient-to-br from-[#1c1e2a] to-[#252836] font-serif text-xl font-bold text-[#7a7e99]"
            >
              {description.nome.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7a7e99]">
                Nível {summary.level} · Regras {summary.ruleset}
              </p>
              <h2
                id="sheet-preview-title"
                className="truncate font-serif text-lg font-bold tracking-wide text-white"
              >
                {description.nome || "Herói sem nome"}
              </h2>
              <p className="text-xs text-[#7a7e99]">
                {speciesName || "Espécie"} · {className || "Classe"}
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="sheet-core-title" className="border-b border-white/[0.06] py-4">
          <h3
            id="sheet-core-title"
            className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#7a7e99]"
          >
            Resumo
          </h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="PV" value={String(summary.hitPoints)} tone="red" />
              <Metric label="CA" value={String(summary.armorClass)} tone="blue" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Proficiência"
                value={`+${summary.proficiencyBonus}`}
                tone="green"
              />
              <Metric label="Iniciativa" value={formatSigned(getAbilityModifier(summary.finalAttributes.destreza))} tone="gold" />
            </div>
            <div>
              <dt className="text-[#7a7e99]">Antecedente</dt>
              <dd className="font-semibold text-[#e8e9f0]">
                {backgroundName || "Não definido"}
              </dd>
            </div>
            <div>
              <dt className="text-[#7a7e99]">Talento de Origem</dt>
              <dd className="font-semibold text-[#e8e9f0]">
                {summary.originFeat || "Definido pelo antecedente"}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="sheet-attributes-title" className="border-b border-white/[0.06] py-4">
          <h3
            id="sheet-attributes-title"
            className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#7a7e99]"
          >
            Atributos
          </h3>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {attributes.map((attribute) => {
              const value = summary.finalAttributes[attribute];

              return (
                <div
                  key={attribute}
                  className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] px-2 py-2 text-center"
                >
                  <dt className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-[#7a7e99]">
                    {ATTRIBUTE_LABELS[attribute].slice(0, 3)}
                  </dt>
                  <dd className="mt-1 font-serif text-xl font-bold text-white">
                    {value}
                  </dd>
                  <dd className="mt-1 rounded border border-[#c41e1e]/25 bg-[#c41e1e]/15 px-1 py-0.5 text-[0.62rem] font-bold text-[#e63946]">
                    {formatSigned(getAbilityModifier(value))}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section aria-labelledby="sheet-features-title" className="border-b border-white/[0.06] py-4">
          <h3
            id="sheet-features-title"
            className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#7a7e99]"
          >
            Traços e Recursos
          </h3>
          <div className="mt-3 grid gap-3">
            <TagList
              items={summary.selectedTraits.map((trait) => trait.name)}
              emptyLabel="Traços selecionados"
            />
            <TagList
              items={summary.classFeatures.map((feature) => feature.name)}
              emptyLabel="Recursos de classe"
            />
          </div>
        </section>

        <section aria-labelledby="sheet-status-title" className="py-4">
          <h3
            id="sheet-status-title"
            className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#7a7e99]"
          >
            Pendências
          </h3>
          {summary.validationMessages.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#f7d6b3]">
              {summary.validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-md border border-[#50c878]/30 bg-[#50c878]/10 px-3 py-2 text-sm text-[#bff2d3]">
              Todas as etapas obrigatórias estão preenchidas.
            </p>
          )}
        </section>
          </>
        )}
      </div>
    </aside>
  );
}

function useCharacterPreviewState(): CharacterBuilderState {
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

type MetricTone = "red" | "blue" | "green" | "gold";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: MetricTone;
}) {
  const toneClasses: Record<MetricTone, string> = {
    red: "before:bg-[#e63946]",
    blue: "before:bg-[#4a9eff]",
    green: "before:bg-[#50c878]",
    gold: "before:bg-[#f4a261]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#1c1e2a] px-3 py-3 text-center before:absolute before:left-0 before:top-0 before:h-0.5 before:w-full ${toneClasses[tone]}`}
    >
      <dt className="text-[0.58rem] uppercase tracking-[0.12em] text-[#7a7e99]">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-xl font-bold text-white">{value}</dd>
    </div>
  );
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
