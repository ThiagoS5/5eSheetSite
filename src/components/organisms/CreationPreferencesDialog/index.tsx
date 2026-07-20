"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { readGlobalPreferences, writeGlobalPreferences } from "@/src/services/preferencesService";
import {
  BASE_SOURCE_CODE,
  getAvailableSourcePreferenceOptions,
  normalizeActiveSourceSelection,
} from "@/src/services/sourcePreferenceService";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { ChoiceLimits, ProgressionMode } from "@/src/types/characterBuild";

import type { CreationPreferencesDialogProps } from "./index.types";
export type { CreationPreferencesDialogProps } from "./index.types";

export function CreationPreferencesDialog({
  open,
  onClose,
}: CreationPreferencesDialogProps) {
  const creationPreferences = useCharacterStore((s) => s.creationPreferences);
  const setCreationPreferences = useCharacterStore((s) => s.setCreationPreferences);

  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [progressionMode, setProgressionMode] = useState<ProgressionMode>("xp");
  const [choiceLimits, setChoiceLimits] = useState<ChoiceLimits>("rules");
  const sourceOptions = useMemo(() => getAvailableSourcePreferenceOptions(), []);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  if (open && !snapshotTaken) {
    setSnapshotTaken(true);
    const saved = creationPreferences ?? readGlobalPreferences().creationDefaults;
    setActiveSources(normalizeActiveSourceSelection(saved.activeSources));
    setProgressionMode(saved.progressionMode);
    setChoiceLimits(saved.choiceLimits);
  } else if (!open && snapshotTaken) {
    setSnapshotTaken(false);
  }

  function toggleSource(source: string, checked: boolean) {
    setActiveSources((current) =>
      normalizeActiveSourceSelection(
        checked ? [...current, source] : current.filter((s) => s !== source),
      ),
    );
  }

  function selectAllSources() {
    setActiveSources(
      sourceOptions.filter((option) => !option.inactive).map((option) => option.code),
    );
  }

  function deselectOptionalSources() {
    setActiveSources([BASE_SOURCE_CODE]);
  }

  function handleSave() {
    const prefs = {
      activeSources: normalizeActiveSourceSelection(activeSources),
      progressionMode,
      choiceLimits,
    };
    setCreationPreferences(prefs);
    writeGlobalPreferences({
      ...readGlobalPreferences(),
      creationDefaults: prefs,
    });
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-auto md:max-h-[88vh] md:max-w-lg md:rounded-xl">
            <Dialog.Title className="border-b border-white/[0.07] px-5 py-4 text-sm font-bold uppercase tracking-widest text-foreground">
              Creation Preferences
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Choose active sources, progression, and whether additional choices are allowed.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
              <fieldset
                role="group"
                aria-label="Active sources"
                className="space-y-2"
              >
                <legend className="mb-1 text-xs font-bold uppercase tracking-widest text-subdued">
                  Active Sources
                </legend>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllSources}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
                  >
                    Select all sources
                  </button>
                  <button
                    type="button"
                    onClick={deselectOptionalSources}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
                  >
                    Deselect optional sources
                  </button>
                </div>
                {sourceOptions.map((source) => (
                  <label
                    key={source.code}
                    title={source.disabledReason}
                    className={`flex items-center gap-2 text-sm ${
                      source.locked || source.inactive ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!source.inactive && activeSources.includes(source.code)}
                      disabled={source.locked || source.inactive}
                      onChange={(e) => toggleSource(source.code, e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span translate="no" className="notranslate">
                      {source.label}
                    </span>
                  </label>
                ))}
              </fieldset>

              <fieldset
                role="radiogroup"
                aria-label="Progression"
                className="space-y-2"
              >
                <legend className="mb-1 text-xs font-bold uppercase tracking-widest text-subdued">
                  Progression
                </legend>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="progression-mode"
                    checked={progressionMode === "xp"}
                    onChange={() => setProgressionMode("xp")}
                    className="h-4 w-4 accent-primary"
                  />
                  XP
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="progression-mode"
                    checked={progressionMode === "milestone"}
                    onChange={() => setProgressionMode("milestone")}
                    className="h-4 w-4 accent-primary"
                  />
                  Milestone
                </label>
              </fieldset>

              <section aria-labelledby="choice-limits-heading" className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="choice-limits-heading"
                      className="text-xs font-bold uppercase tracking-widest text-subdued"
                    >
                      Flexible Choices
                    </h2>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                      Normal requirements stay visible and minimums still apply, but you may add
                      extra skills, tools, languages, feats, options, cantrips, and spells.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={choiceLimits === "flexible"}
                    aria-label="Flexible choices"
                    onClick={() =>
                      setChoiceLimits((current) =>
                        current === "flexible" ? "rules" : "flexible",
                      )
                    }
                    className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 ${
                      choiceLimits === "flexible"
                        ? "border-primary bg-primary"
                        : "border-border bg-muted"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-1 h-[18px] w-[18px] rounded-full bg-foreground shadow-sm transition-transform motion-reduce:transition-none ${
                        choiceLimits === "flexible" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 rounded-md border border-white/[0.12] px-4 py-2 text-sm font-semibold text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="min-h-10 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
              >
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
