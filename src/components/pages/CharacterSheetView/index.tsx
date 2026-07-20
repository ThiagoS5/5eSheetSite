"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import { buildPdfDocument } from "@/src/adapters/pdfAdapter";
import { selectDerivedSheet } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { cn } from "@/src/lib/utils";
import { serializeCharacterExport } from "@/src/utils/canonicalExport";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { SHEET_THEME_VARS } from "@/src/components/organisms/sheet/sheetTheme";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import { useBuilderHeaderToolbar } from "@/src/hooks/useBuilderHeaderToolbar";
import {
  readGlobalPreferences,
  writeGlobalPreferences,
} from "@/src/services/preferencesService";
import type { FoundryDnd5eProfile } from "@/src/types/characterBuild";

import type { CharacterSheetViewProps } from "./index.types";
export type { CharacterSheetViewProps } from "./index.types";
export function CharacterSheetView({ embedded = false }: CharacterSheetViewProps) {
  const state = useCharacterBuilderState();
  const characterBuild = useCharacterStore((s) => s.characterBuild);
  const description = useCharacterStore((s) => s.description);
  const summary = useCharacterStore(selectDerivedSheet);
  const builderToolbar = useBuilderHeaderToolbar();
  const [foundryDialogOpen, setFoundryDialogOpen] = useState(false);
  const [foundryProfile, setFoundryProfile] = useState<FoundryDnd5eProfile>(
    () => readGlobalPreferences().foundryExportProfile ?? "dnd5e-5.3",
  );

  function handleForgeFateExport() {
    downloadJson(`${sanitizeFileName(summary.name)}-forge-fate.json`, serializeCharacterExport(characterBuild));
  }

  function handleFoundryExport() {
    setFoundryDialogOpen(true);
  }

  function downloadFoundryExport() {
    const exportData = createFoundryCharacterExport(state, summary, {
      profile: foundryProfile,
      originSnapshot: characterBuild.exportMetadata.foundryOrigin,
    });
    writeGlobalPreferences({
      ...readGlobalPreferences(),
      foundryExportProfile: foundryProfile,
    });
    downloadJson(`${sanitizeFileName(summary.name)}-foundry-vtt.json`, JSON.stringify(exportData, null, 2));
    setFoundryDialogOpen(false);
  }

  async function handlePdfExport() {
    const blob = await pdf(
      buildPdfDocument({
        summary,
        description,
        inventory: summary.inventory,
        playState: characterBuild.playState,
      }),
    ).toBlob();
    downloadBlob(blob, `${sanitizeFileName(summary.name)}-sheet.pdf`);
  }

  const content = (
    <div className="flex flex-col gap-[14px]" style={SHEET_THEME_VARS}>
      <SheetHero
        summary={summary}
        onExportForgeFate={handleForgeFateExport}
        onExportFoundry={handleFoundryExport}
        onExportPdf={handlePdfExport}
      />
      {builderToolbar}
      <ContentTabs summary={summary} description={description} />
      <FoundryExportDialog
        open={foundryDialogOpen}
        profile={foundryProfile}
        onProfileChange={setFoundryProfile}
        onClose={() => setFoundryDialogOpen(false)}
        onDownload={downloadFoundryExport}
      />
    </div>
  );

  if (embedded) return content;

  return (
    <div className={cn("min-h-screen bg-background")}>
      <main className="p-3 lg:p-4">{content}</main>
    </div>
  );
}

function FoundryExportDialog({
  open,
  profile,
  onProfileChange,
  onClose,
  onDownload,
}: {
  open: boolean;
  profile: FoundryDnd5eProfile;
  onProfileChange: (profile: FoundryDnd5eProfile) => void;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 text-foreground shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
          <Dialog.Title className="font-serif text-xl font-bold">
            Export to Foundry VTT
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-subdued">
            Choose the installed dnd5e system family. Forge & Fate remembers this
            choice for the next export.
          </Dialog.Description>
          <fieldset className="mt-4 grid gap-2">
            <legend className="sr-only">Foundry dnd5e version</legend>
            {([
              ["dnd5e-5.3", "dnd5e 5.3.x", "Foundry Core 13 or 14"],
              ["dnd5e-5.2", "dnd5e 5.2.x", "Foundry Core 13"],
            ] as const).map(([value, label, detail]) => (
              <label
                key={value}
                className="flex min-h-12 items-center gap-3 rounded-lg border border-border bg-surface-nested px-3 py-2"
              >
                <input
                  type="radio"
                  name="foundry-profile"
                  value={value}
                  checked={profile === value}
                  onChange={() => onProfileChange(value)}
                  className="h-4 w-4 accent-primary"
                />
                <span>
                  <span translate="no" className="notranslate block text-sm font-bold">
                    {label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{detail}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold text-subdued outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onDownload}
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
            >
              Download JSON
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function sanitizeFileName(value: string): string {
  return (
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character"
  );
}

function downloadJson(fileName: string, json: string): void {
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, fileName);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
