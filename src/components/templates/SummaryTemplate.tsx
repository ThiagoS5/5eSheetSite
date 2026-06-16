"use client";

import { useMemo, type ReactNode } from "react";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";
import { HoverTooltip } from "@/src/components/molecules/HoverTooltip";
import { parseTaggedText } from "@/src/utils/textParser";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";

const attributeOrder: readonly AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

const skills = [
  ["Acrobacia", "destreza"],
  ["Arcanismo", "inteligencia"],
  ["Atletismo", "forca"],
  ["História", "inteligencia"],
  ["Intuição", "sabedoria"],
  ["Investigação", "inteligencia"],
  ["Medicina", "sabedoria"],
  ["Percepção", "sabedoria"],
  ["Persuasão", "carisma"],
  ["Sobrevivência", "sabedoria"],
] as const satisfies ReadonlyArray<readonly [string, AttributeKey]>;

export function SummaryTemplate() {
  const characterState = useCharacterSummaryState();
  const summary = useMemo(
    () => selectCharacterSheetSummary(characterState),
    [characterState],
  );
  const characterName = characterState.description.nome.trim() || "Personagem";

  function handleDownload() {
    const exportData = createFoundryCharacterExport(characterState, summary);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${sanitizeFileName(characterName)}-foundry-vtt.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="summary-title" className="relative grid gap-4 pb-20">
      <header className="rounded-md border-2 border-[#b82020] bg-[#f6f1e6] px-4 py-3 text-[#20242f] shadow-[0_0_0_2px_rgba(184,32,32,0.12)]">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#b82020]">
          Character Sheet · Foundry Export
        </p>
        <h2 id="summary-title" className="font-serif text-2xl font-bold">
          Conclusão/Resumo
        </h2>
        <p className="font-serif text-xl font-bold">
          {characterName}
        </p>
        <p className="text-sm font-semibold text-[#5d6472]">
          Nível {summary.level} · {summary.ruleset} · {summary.speciesId || "Espécie"} ·{" "}
          {summary.classId || "Classe"}
        </p>
      </header>

      <section aria-labelledby="summary-attributes-title" className="grid gap-3 2xl:grid-cols-[repeat(8,minmax(0,1fr))]">
        <h3 id="summary-attributes-title" className="sr-only">
          Atributos
        </h3>
        {attributeOrder.map((attribute) => (
          <AbilityTile
            key={attribute}
            label={ATTRIBUTE_LABELS[attribute]}
            score={summary.finalAttributes[attribute]}
          />
        ))}
        <TopMetric label="Proficiência" value={`+${summary.proficiencyBonus}`} />
        <TopMetric label="PV" value={`${summary.hitPoints} / ${summary.hitPoints}`} />
      </section>

      <div className="grid gap-4 2xl:grid-cols-[0.85fr_1fr_2fr]">
        <div className="grid gap-4">
          <SheetPanel title="Saving Throws">
            <dl className="grid grid-cols-2 gap-2">
              {attributeOrder.map((attribute) => (
                <CompactScore
                  key={attribute}
                  label={ATTRIBUTE_LABELS[attribute].slice(0, 3).toUpperCase()}
                  value={formatSigned(getAbilityModifier(summary.finalAttributes[attribute]))}
                />
              ))}
            </dl>
          </SheetPanel>

          <SheetPanel title="Defesas">
            <dl className="grid gap-2">
              <CompactScore label="CA" value={String(summary.armorClass)} />
              <CompactScore
                label="Iniciativa"
                value={formatSigned(getAbilityModifier(summary.finalAttributes.destreza))}
              />
              <CompactScore label="Talento" value={summary.originFeat || "Pendente"} />
            </dl>
          </SheetPanel>

          <SheetPanel title="Proficiencies & Training">
            <ul className="grid gap-2 text-sm">
              {summary.selectedEquipment.map((item) => (
                <li key={item.id} className="border-b border-[#d8b9b9] pb-2">
                  {item.name}
                </li>
              ))}
              {summary.selectedEquipment.length === 0 ? (
                <li className="text-[#7b8493]">Sem equipamento selecionado.</li>
              ) : null}
            </ul>
          </SheetPanel>
        </div>

        <SheetPanel title="Skills">
          <ul className="grid gap-1.5">
            {skills.map(([skill, attribute]) => (
              <li
                key={skill}
                className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2 border-b border-[#e1cccc] py-1 text-sm"
              >
                <span className="text-[0.62rem] font-bold uppercase text-[#7b8493]">
                  {ATTRIBUTE_LABELS[attribute].slice(0, 3)}
                </span>
                <span>{skill}</span>
                <span className="rounded border border-[#cfd4dc] bg-white px-2 py-1 text-center font-semibold">
                  {formatSigned(getAbilityModifier(summary.finalAttributes[attribute]))}
                </span>
              </li>
            ))}
          </ul>
        </SheetPanel>

        <SheetPanel title="Actions · Features & Traits">
          <div className="mb-4 flex flex-wrap gap-2 text-[0.64rem] font-bold uppercase tracking-[0.08em]">
            {["All", "Attack", "Action", "Bonus Action", "Reaction", "Other"].map(
              (tab) => (
                <span
                  key={tab}
                  className={`rounded px-2 py-1 ${
                    tab === "All"
                      ? "bg-[#b82020] text-white"
                      : "bg-[#e8edf2] text-[#69717f]"
                  }`}
                >
                  {tab}
                </span>
              ),
            )}
          </div>

          <div className="max-h-[34rem] overflow-y-auto pr-2">
            <FeatureBlock
              title="Traços"
              items={summary.selectedTraits}
              emptyLabel="Nenhum traço selecionado."
            />
            <FeatureBlock
              title="Recursos de Classe"
              items={summary.classFeatures}
              emptyLabel="Nenhum recurso de classe selecionado."
            />
            <SheetPanel title="Pendências" nested>
              {summary.validationMessages.length > 0 ? (
                <ul className="grid gap-2 text-sm text-[#8a4d00]">
                  {summary.validationMessages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm font-semibold text-[#257448]">
                  Ficha pronta para exportação.
                </p>
              )}
            </SheetPanel>
          </div>
        </SheetPanel>
      </div>

      <div className="fixed bottom-5 right-5 z-40">
        <ActionBtn onClick={handleDownload} className="shadow-2xl shadow-black/30">
          Download (Foundry VTT)
        </ActionBtn>
      </div>
    </section>
  );
}

function AbilityTile({ label, score }: { label: string; score: number }) {
  return (
    <article className="rounded-md border-2 border-[#b82020] bg-[#f6f1e6] px-3 py-2 text-center text-[#20242f]">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#5d6472]">
        {label}
      </h3>
      <p className="font-serif text-2xl font-bold">
        {formatSigned(getAbilityModifier(score))}
      </p>
      <p className="mx-auto mt-1 flex h-7 w-10 items-center justify-center rounded-full border-2 border-[#b82020] bg-white text-sm font-bold">
        {score}
      </p>
    </article>
  );
}

function TopMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-md border-2 border-[#b82020] bg-[#f6f1e6] px-3 py-2 text-center text-[#20242f]">
      <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#5d6472]">
        {label}
      </h3>
      <p className="mt-2 font-serif text-2xl font-bold">{value}</p>
    </article>
  );
}

function CompactScore({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded border border-[#d8b9b9] bg-white px-2 py-1">
      <dt className="text-xs font-bold uppercase text-[#5d6472]">{label}</dt>
      <dd className="rounded border border-[#cfd4dc] px-2 py-0.5 text-sm font-semibold">
        {value}
      </dd>
    </div>
  );
}

function SheetPanel({
  title,
  children,
  nested = false,
}: {
  title: string;
  children: ReactNode;
  nested?: boolean;
}) {
  return (
    <section
      aria-labelledby={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`}
      className={`rounded-md border-2 border-[#b82020] bg-[#f6f1e6] p-4 text-[#20242f] ${
        nested ? "mt-4" : ""
      }`}
    >
      <h3
        id={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`}
        className="mb-3 text-sm font-black uppercase tracking-[0.08em]"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function FeatureBlock({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: readonly { name: string; description: string }[];
  emptyLabel: string;
}) {
  return (
    <section className="mb-4">
      <h4 className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[#b82020]">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.name}>
              <HoverTooltip content={<p>{parseTaggedText(item.description)}</p>}>
                <span className="font-bold text-[#20242f] underline decoration-[#b82020]/40 underline-offset-4">
                  {item.name}
                </span>
              </HoverTooltip>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#4b5565]">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#7b8493]">{emptyLabel}</p>
      )}
    </section>
  );
}

function useCharacterSummaryState(): CharacterBuilderState {
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
      equipmentChoicesBySource,
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
      equipmentChoicesBySource,
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

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function sanitizeFileName(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "character"
  );
}
