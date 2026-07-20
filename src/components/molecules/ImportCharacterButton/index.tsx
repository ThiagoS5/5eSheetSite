"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { importCharacter } from "@/src/utils/canonicalExport";
import { importFoundryCharacter } from "@/src/adapters/foundryImportAdapter";
import { saveCharacter } from "@/src/services/characterService";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export function ImportCharacterButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);

    // Normal builds are small; reject huge files before reading to avoid
    // blocking the tab with a multi-hundred-MB JSON.parse.
    if (file.size > MAX_IMPORT_BYTES) {
      const message = "This file is too large to be a character export.";
      setError(message);
      toast.error(message);
      return;
    }

    const result = importCharacterFile(await file.text());

    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    await saveCharacter(result.build);
    toast.success(
      `${result.build.draft.description.nome || "Unnamed Character"} imported to your vault.`,
    );
  }

  return (
    <div className="grid gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        aria-label="Import Foundry character file"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <ActionBtn intent="secondary" onClick={() => inputRef.current?.click()}>
        <Upload aria-hidden="true" className="mr-2 h-4 w-4" />
        Import Sheet (Foundry)
      </ActionBtn>
      {error ? (
        <p role="alert" className="text-xs leading-5 text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function importCharacterFile(rawJson: string) {
  const canonicalResult = importCharacter(rawJson);
  if (canonicalResult.ok) {
    return canonicalResult;
  }

  const foundryResult = importFoundryCharacter(rawJson);
  if (foundryResult.ok) {
    return foundryResult;
  }

  if (canonicalResult.error === "The file is not valid JSON.") {
    return canonicalResult;
  }

  return {
    ok: false as const,
    error: "The file is not a Forge & Fate or Foundry VTT character export.",
  };
}
