"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { getBuilderClasses, getFeats } from "@/src/services/ruleService";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";
import { getFeatPrerequisiteStatus, getSelectableFeats } from "@/src/adapters/featCatalog";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/src/types/dnd";
import { getLevelRequirements, type LevelChoiceRequirement } from "@/rules/levelProgression";
import type { BuilderClass } from "@/src/types/builder";
import { SubclassStep } from "@/src/components/organisms/levelup/SubclassStep";
import { FeatureOptionStep } from "@/src/components/organisms/levelup/FeatureOptionStep";
import { AsiOrFeatStep } from "@/src/components/organisms/levelup/AsiOrFeatStep";
import { HitPointsStep } from "@/src/components/organisms/levelup/HitPointsStep";
import { SpellCatalogPicker } from "@/src/components/organisms/spells/SpellCatalogPicker";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import {
  getHighestSpellLevelAvailable,
  isSpellcastingSelectionComplete,
} from "@/rules/spellcastingRules";
import type { AsiAttribute } from "@/src/components/organisms/levelup/types";

import type { LevelUpFlowProps } from "./index.types";
export type { LevelUpFlowProps } from "./index.types";
const HP_STEP_PREFIX = "hp:";
const SPELL_STEP_PREFIX = "spells:";

const ATTRIBUTE_KEYS: AttributeKey[] = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];

function getAllRequirementsById(characterClass: BuilderClass) {


  const map = new Map<string, LevelChoiceRequirement>();
  for (const req of getLevelRequirements(characterClass, 0, 20)) map.set(req.id, req);
  return map;
}

export function LevelUpFlow({ open, onClose }: LevelUpFlowProps) {
  const state = useCharacterStore((s) => s);
  const characterClass = useMemo(
    () => getBuilderClasses().find((c) => c.id === state.selectedClassId),
    [state.selectedClassId],
  );

  const [stepIds, setStepIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);




  // O snapshot é re-tirado se nível ou classe mudarem com o diálogo aberto,
  // evitando que o usuário resolva passos de um estado que não existe mais.
  const [snapshotKey, setSnapshotKey] = useState<string | null>(null);
  const currentSnapshotKey = `${state.level}:${state.selectedClassId}`;
  if (open && characterClass && snapshotKey !== currentSnapshotKey) {
    setSnapshotKey(currentSnapshotKey);
    const pendingIdsSnapshot = getPendingRequirements(state, characterClass).map((r) => r.id);
    const needsHpStep = state.level > 1 && state.hpRollByLevel[String(state.level)] === undefined;
    const spellStep = characterClass.spellcastingAbility ? [`${SPELL_STEP_PREFIX}${state.level}`] : [];
    setStepIds([
      ...(needsHpStep ? [`${HP_STEP_PREFIX}${state.level}`] : []),
      ...pendingIdsSnapshot,
      ...spellStep,
    ]);
    setActiveIndex(0);
  } else if (!open && snapshotKey !== null) {
    setSnapshotKey(null);
  }

  const allRequirements = useMemo(
    () => (characterClass ? getAllRequirementsById(characterClass) : new Map<string, LevelChoiceRequirement>()),
    [characterClass],
  );
  const pendingIds = useMemo(
    () => new Set(characterClass ? getPendingRequirements(state, characterClass).map((r) => r.id) : []),
    [state, characterClass],
  );

  if (!characterClass) return null;

  function isHpStepId(id: string): number | null {
    if (!id.startsWith(HP_STEP_PREFIX)) return null;
    const level = Number(id.slice(HP_STEP_PREFIX.length));
    return Number.isFinite(level) ? level : null;
  }

  function isSpellStepId(id: string): boolean {
    return id.startsWith(SPELL_STEP_PREFIX);
  }

  function getSpellStepLimits() {
    const levelIndex = Math.max(0, Math.min(19, state.level - 1));
    const cantripLimit = characterClass!.spellcastingProgression?.cantripsKnown[levelIndex] ?? 0;
    const preparedLimit = characterClass!.spellcastingProgression?.preparedSpells[levelIndex] ?? 0;
    const knownLimit = characterClass!.spellcastingProgression?.knownSpells[levelIndex] ?? 0;
    const spellMode: "prepared" | "known" = preparedLimit > 0 ? "prepared" : "known";
    return {
      cantripLimit,
      spellLimit: spellMode === "prepared" ? preparedLimit : knownLimit,
      spellMode,
    };
  }

  function isStepResolved(id: string): boolean {
    const hpLevel = isHpStepId(id);
    if (hpLevel !== null) return state.hpRollByLevel[String(hpLevel)] !== undefined;
    if (isSpellStepId(id)) {
      return isSpellcastingSelectionComplete({
        ...getSpellStepLimits(),
        choices: state.spellcasting,
      });
    }
    return !pendingIds.has(id);
  }

  const steps = stepIds.filter((id) => isHpStepId(id) !== null || isSpellStepId(id) || allRequirements.has(id));
  const activeId = steps[activeIndex];
  const activeHpLevel = activeId !== undefined ? isHpStepId(activeId) : null;
  const activeIsSpellStep = activeId !== undefined ? isSpellStepId(activeId) : false;
  const activeReq = activeId !== undefined && activeHpLevel === null && !activeIsSpellStep ? allRequirements.get(activeId) : undefined;
  const activeResolved = activeId !== undefined ? isStepResolved(activeId) : true;
  const isLast = activeIndex >= steps.length - 1;
  const allResolved = steps.every((id) => isStepResolved(id));

  const summary = state.characterBuild.derivedSheet;

  function getStepLabel(id: string | undefined): string {
    if (id === undefined) return "";
    if (isHpStepId(id) !== null) return "Hit Points";
    if (isSpellStepId(id)) return "Spells";
    const req = allRequirements.get(id);
    if (!req) return "";
    if (req.kind === "subclass") return "Subclass";
    if (req.kind === "asi-or-feat") return "Ability Scores or Feat";
    return req.featureName;
  }

  function renderActiveStep() {
    if (activeHpLevel !== null) {
      const conModifier = getAbilityModifier(summary.finalAttributes.constituicao);
      return (
        <HitPointsStep
          hitDie={characterClass!.hitDie}
          targetLevel={activeHpLevel}
          conModifier={conModifier}
          onChoose={(choice) => {
            state.setLevelHpRoll(activeHpLevel, choice);
            setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
        />
      );
    }
    if (activeIsSpellStep) {
      const { cantripLimit, spellLimit, spellMode } = getSpellStepLimits();
      return (
        <SpellCatalogPicker
          className={characterClass!.name}
          activeSources={state.creationPreferences?.activeSources ?? ["XPHB"]}
          value={state.spellcasting}
          cantripLimit={cantripLimit}
          spellLimit={spellLimit}
          spellMode={spellMode}
          maxSpellLevel={getHighestSpellLevelAvailable(characterClass, state.level)}
          onChange={state.setSpellcastingChoices}
        />
      );
    }
    if (!activeReq) return null;
    return renderStep(activeReq);
  }

  function renderStep(req: LevelChoiceRequirement) {
    if (req.kind === "subclass") {
      return (
        <SubclassStep
          level={req.level}
          className={characterClass!.name}
          subclasses={characterClass!.subclasses}
          selectedSubclassId={state.selectedSubclassId}
          onNavigateToSubclassScreen={() => onClose(true)}
        />
      );
    }
    if (req.kind === "feature-option") {
      return (
        <FeatureOptionStep
          level={req.level}
          featureName={req.featureName}
          count={req.count}
          options={req.options}
          selected={state.classFeatureChoices[req.id] ?? []}
          onChange={(values) => state.setClassFeatureChoice(req.id, values)}
        />
      );
    }
    const value = state.asiOrFeatByLevel[String(req.level)];
    const contribution = value ? (value.mode === "asi" ? value.increases : value.asi ?? {}) : {};
    const attributes: AsiAttribute[] = ATTRIBUTE_KEYS.map((key) => ({
      key,
      label: ATTRIBUTE_LABELS[key],
      current: summary.finalAttributes[key] - (contribution[key] ?? 0),
    }));
    const allFeats = getFeats();
    const featCategory = req.level >= 19 ? "epic-boon" : "general";
    const chosenFeatIds = Object.entries(state.asiOrFeatByLevel)
      .filter(([level, c]) => Number(level) !== req.level && c.mode === "feat")
      .map(([, c]) => (c as { featId: string }).featId);
    const ctx = {
      level: req.level,
      finalAttributes: summary.finalAttributes,
      chosenFeatIds,
    };
    const selectableFeats = getSelectableFeats(featCategory, allFeats, ctx);
    const selectedIds = new Set(chosenFeatIds);
    const selectableIds = new Set(selectableFeats.map((feat) => feat.id));
    const blockedFeats = allFeats
      .filter((feat) => feat.category === featCategory && !selectableIds.has(feat.id))
      .map((feat) => ({ feat, status: getFeatPrerequisiteStatus(feat, ctx) }))
      .filter(({ feat, status }) => !status.met || (!feat.repeatable && selectedIds.has(feat.id)))
      .map(({ feat, status }) => ({
        feat,
        reason: status.reason ?? "Feat already chosen.",
      }));
    return (
      <AsiOrFeatStep
        level={req.level}
        attributes={attributes}
        selectableFeats={selectableFeats}
        blockedFeats={blockedFeats}
        value={value}
        onChange={(choice) => state.setLevelAsiOrFeat(req.level, choice)}
      />
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(false); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,720px)] md:max-w-2xl md:rounded-xl">
            <Dialog.Title className="sr-only">Level Up</Dialog.Title>
            <Dialog.Description className="sr-only">Resolve character level choices.</Dialog.Description>
            <Dialog.Close asChild>
              <button type="button" aria-label="Close" className="absolute right-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <div className="border-b border-white/[0.07] px-5 pb-3 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold-alt">
                Level Up · Level{" "}
                <span translate="no" className="notranslate">{state.level}</span>
              </p>
              <div className="mt-0.5 flex items-baseline justify-between gap-3 pr-10">
                <h2 translate="no" className="notranslate min-w-0 truncate font-serif text-xl font-bold tracking-wide text-foreground">
                  {characterClass.name}
                </h2>
                <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {steps.length > 0 ? `Step ${activeIndex + 1} of ${steps.length}` : "All resolved"}
                </span>
              </div>
              {steps.length > 0 ? (
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1.5">
                    {steps.map((id, i) => (
                      <span key={id} aria-hidden="true"
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${i === activeIndex ? "bg-primary" : isStepResolved(id) ? "bg-brand-green" : "bg-white/15"}`} />
                    ))}
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-subdued">
                    {getStepLabel(activeId)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {activeId !== undefined ? <div key={activeId}>{renderActiveStep()}</div> : <p className="text-sm text-subdued">No pending choice.</p>}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
              <button type="button" onClick={() => setActiveIndex((i) => Math.max(0, i - 1))} disabled={activeIndex === 0}
                className="rounded-md border border-white/[0.12] px-4 py-2 text-sm font-semibold text-subdued outline-none transition hover:text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                ← Back
              </button>
              {isLast ? (
                <button type="button" onClick={() => onClose(true)} disabled={!allResolved}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                  Finish
                </button>
              ) : (
                <button type="button" onClick={() => setActiveIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={!activeResolved}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                  Continue →
                </button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
