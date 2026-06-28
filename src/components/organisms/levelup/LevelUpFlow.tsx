"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { getBuilderClasses, getFeats } from "@/src/services/ruleService";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";
import { getSelectableFeats } from "@/src/adapters/featCatalog";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";
import { getLevelRequirements, type LevelChoiceRequirement } from "@/rules/levelProgression";
import type { BuilderClass } from "@/types/builder";
import { SubclassStep } from "@/src/components/organisms/levelup/SubclassStep";
import { FeatureOptionStep } from "@/src/components/organisms/levelup/FeatureOptionStep";
import { AsiOrFeatStep } from "@/src/components/organisms/levelup/AsiOrFeatStep";
import type { AsiAttribute } from "@/src/components/organisms/levelup/types";

const ATTRIBUTE_KEYS: AttributeKey[] = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];

interface LevelUpFlowProps {
  open: boolean;
  onClose: () => void;
}

function getAllRequirementsById(characterClass: BuilderClass) {
  // Stable id→requirement map across the full 1..20 range so snapshot ids always
  // resolve even after a choice removes them from the pending list.
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

  // Snapshot the pending requirement ids once per "open" transition (so a fresh
  // open — e.g. the next "Subir de Nível" — always re-captures the current
  // pendings). Computed during render via React's "adjust state while rendering"
  // pattern: this project's eslint (react-hooks/set-state-in-effect) forbids
  // calling setState synchronously inside a useEffect body, so the snapshot is
  // taken here instead, guarded by a per-open-transition flag.
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  if (open && characterClass && !snapshotTaken) {
    setSnapshotTaken(true);
    setStepIds(getPendingRequirements(state, characterClass).map((r) => r.id));
    setActiveIndex(0);
  } else if (!open && snapshotTaken) {
    setSnapshotTaken(false);
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

  const steps = stepIds.map((id) => allRequirements.get(id)).filter(Boolean) as LevelChoiceRequirement[];
  const activeReq = steps[activeIndex];
  const activeResolved = activeReq ? !pendingIds.has(activeReq.id) : true;
  const isLast = activeIndex >= steps.length - 1;
  const allResolved = steps.every((r) => !pendingIds.has(r.id));

  const summary = selectCharacterSheetSummary(state);

  function renderStep(req: LevelChoiceRequirement) {
    if (req.kind === "subclass") {
      return (
        <SubclassStep
          level={req.level}
          subclasses={characterClass!.subclasses}
          selectedSubclassId={state.selectedSubclassId}
          onSelect={(id) => state.selectSubclass(id)}
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
    const ctx = {
      level: req.level,
      finalAttributes: summary.finalAttributes,
      chosenFeatIds: Object.values(state.asiOrFeatByLevel)
        .filter((c) => c.mode === "feat")
        .map((c) => (c as { featId: string }).featId),
    };
    const selectableFeats = getSelectableFeats("general", getFeats(), ctx);
    return (
      <AsiOrFeatStep
        level={req.level}
        attributes={attributes}
        selectableFeats={selectableFeats}
        value={value}
        onChange={(choice) => state.setLevelAsiOrFeat(req.level, choice)}
      />
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,720px)] md:max-w-2xl md:rounded-xl">
            <Dialog.Title className="sr-only">Subir de Nível</Dialog.Title>
            <Dialog.Description className="sr-only">Resolva as escolhas de nível do personagem.</Dialog.Description>
            <Dialog.Close asChild>
              <button type="button" aria-label="Fechar" className="absolute right-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-5 py-3">
              {steps.map((req, i) => (
                <span key={req.id} aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${i === activeIndex ? "bg-primary" : !pendingIds.has(req.id) ? "bg-accent" : "bg-white/20"}`} />
              ))}
              <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                {steps.length > 0 ? `Passo ${activeIndex + 1} de ${steps.length}` : "Tudo resolvido"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {activeReq ? <div key={activeReq.id}>{renderStep(activeReq)}</div> : <p className="text-sm text-subdued">Nenhuma escolha pendente.</p>}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
              <button type="button" onClick={() => setActiveIndex((i) => Math.max(0, i - 1))} disabled={activeIndex === 0}
                className="rounded-md border border-white/[0.12] px-4 py-2 text-sm font-semibold text-subdued outline-none transition hover:text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                ← Voltar
              </button>
              {isLast ? (
                <button type="button" onClick={onClose} disabled={!allResolved}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                  Concluir
                </button>
              ) : (
                <button type="button" onClick={() => setActiveIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={!activeResolved}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                  Continuar →
                </button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
