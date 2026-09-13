"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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
  const openerRef = useRef<HTMLElement | null>(null);

  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [progressionMode, setProgressionMode] = useState<ProgressionMode>("xp");
  const [choiceLimits, setChoiceLimits] = useState<ChoiceLimits>("rules");
  const [sourceQuery, setSourceQuery] = useState("");
  const sourceOptions = useMemo(() => getAvailableSourcePreferenceOptions(), []);
  const filteredSources = sourceOptions.filter((source) =>
    `${source.label} ${source.contentSummary}`.toLowerCase().includes(sourceQuery.trim().toLowerCase()),
  );
  const enabledSources = sourceOptions.filter((source) => !source.inactive && activeSources.includes(source.code));
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  if (open && !snapshotTaken) {
    setSnapshotTaken(true);
    setSourceQuery("");
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
          <Dialog.Content
            onOpenAutoFocus={() => {
              openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            }}
            onCloseAutoFocus={(event) => {
              if (openerRef.current?.isConnected) {
                event.preventDefault();
                openerRef.current.focus();
              }
            }}
            className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-border bg-surface-nested text-foreground shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-auto md:max-h-[88vh] md:max-w-2xl md:rounded-xl"
          >
            <Dialog.Title className="border-b border-border px-5 py-5 pr-16 font-serif text-2xl font-bold text-foreground">
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
                <legend className="mb-1 text-base font-semibold text-foreground">
                  Active Sources
                </legend>
                <p className="text-sm leading-6 text-muted-foreground">
                  Choose the books allowed at your table. Each book lists the options available in this builder.
                </p>
                <p className="text-sm font-medium text-foreground" role="status">
                  {enabledSources.length} books enabled · {enabledSources.reduce((sum, source) => sum + source.contentCount, 0).toLocaleString("en-US")} catalog entries
                </p>
                <label className="relative block">
                  <span className="sr-only">Search source books</span>
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={sourceQuery}
                    onChange={(event) => setSourceQuery(event.target.value)}
                    placeholder="Find a book, source code, or content type…"
                    className="min-h-11 w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </label>
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
                <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-background">
                {filteredSources.map((source) => (
                  <label
                    key={source.code}
                    title={source.disabledReason}
                    className={`flex min-h-16 items-start gap-3 border-b border-border px-3 py-3 text-sm last:border-0 ${
                      source.inactive ? "text-muted-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      aria-label={source.label}
                      aria-describedby={`source-${source.code}-coverage`}
                      checked={!source.inactive && activeSources.includes(source.code)}
                      disabled={source.locked || source.inactive}
                      onChange={(e) => toggleSource(source.code, e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    <span className="min-w-0 flex-1">
                      <span translate="no" className="notranslate block font-medium">{source.bookTitle}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {source.code}{source.locked ? " · Core rules" : source.inactive ? " · Legacy source (inactive)" : ""}
                      </span>
                      <span id={`source-${source.code}-coverage`} className="mt-1 block text-xs leading-5 text-subdued">
                        {source.contentSummary}
                      </span>
                    </span>
                  </label>
                ))}
                {filteredSources.length === 0 ? (
                  <div className="p-5 text-center text-sm text-muted-foreground">
                    <p>No books match your search.</p>
                    <button type="button" onClick={() => setSourceQuery("")} className="mt-2 min-h-10 rounded-md px-3 text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-accent">Clear search</button>
                  </div>
                ) : null}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">Existing character choices are preserved when a source is disabled.</p>
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
