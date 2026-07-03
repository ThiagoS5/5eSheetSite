"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { readGlobalPreferences, writeGlobalPreferences } from "@/src/services/preferencesService";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { ProgressionMode } from "@/src/types/characterBuild";

const BASE_SOURCE = "XPHB";

interface CreationPreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreationPreferencesDialog({
  open,
  onClose,
}: CreationPreferencesDialogProps) {
  const creationPreferences = useCharacterStore((s) => s.creationPreferences);
  const setCreationPreferences = useCharacterStore((s) => s.setCreationPreferences);

  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [progressionMode, setProgressionMode] = useState<ProgressionMode>("xp");

  // Snapshot the effective defaults (per-character prefs, falling back to the
  // saved global defaults) once per "open" transition, so re-opening the
  // dialog — including for a brand-new character with no per-character prefs
  // yet — always re-evaluates the seed instead of reusing stale state from a
  // previous mount. Mirrors LevelUpFlow's "adjust state while rendering"
  // pattern (this project's eslint forbids calling setState synchronously
  // inside a useEffect body).
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  if (open && !snapshotTaken) {
    setSnapshotTaken(true);
    const saved = creationPreferences ?? readGlobalPreferences().creationDefaults;
    setActiveSources(saved.activeSources);
    setProgressionMode(saved.progressionMode);
  } else if (!open && snapshotTaken) {
    setSnapshotTaken(false);
  }

  const otherSources = useMemo(() => {
    const sources = new Set(getItemCatalog().map((item) => item.source));
    sources.delete(BASE_SOURCE);
    return [...sources].sort((a, b) => a.localeCompare(b));
  }, []);

  function toggleSource(source: string, checked: boolean) {
    setActiveSources((current) =>
      checked ? [...current, source] : current.filter((s) => s !== source),
    );
  }

  function handleSave() {
    const prefs = { activeSources, progressionMode };
    setCreationPreferences(prefs);
    writeGlobalPreferences({ creationDefaults: prefs });
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-auto md:max-h-[88vh] md:max-w-lg md:rounded-xl">
            <Dialog.Title className="border-b border-white/[0.07] px-5 py-4 text-sm font-bold uppercase tracking-widest text-foreground">
              Preferências da Criação
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Escolha as fontes ativas e o modo de progressão do personagem.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="absolute right-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
              <fieldset
                role="group"
                aria-label="Fontes ativas"
                className="space-y-2"
              >
                <legend className="mb-1 text-xs font-bold uppercase tracking-widest text-subdued">
                  Fontes ativas
                </legend>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="h-4 w-4 accent-primary"
                  />
                  {BASE_SOURCE} (base)
                </label>
                {otherSources.map((source) => (
                  <label
                    key={source}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={activeSources.includes(source)}
                      onChange={(e) => toggleSource(source, e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    {source}
                  </label>
                ))}
              </fieldset>

              <fieldset
                role="radiogroup"
                aria-label="Progressão"
                className="space-y-2"
              >
                <legend className="mb-1 text-xs font-bold uppercase tracking-widest text-subdued">
                  Progressão
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
                  Marco
                </label>
              </fieldset>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/[0.12] px-4 py-2 text-sm font-semibold text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
              >
                Salvar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
