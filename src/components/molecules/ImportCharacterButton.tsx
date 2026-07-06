"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { importCharacter } from "@/src/utils/canonicalExport";
import { saveCharacter } from "@/src/services/characterService";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";

export function ImportCharacterButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);
    const result = importCharacter(await file.text());

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
        aria-label="Import character file"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <ActionBtn intent="secondary" onClick={() => inputRef.current?.click()}>
        <Upload aria-hidden="true" className="mr-2 h-4 w-4" />
        Import Character
      </ActionBtn>
      {error ? (
        <p role="alert" className="text-xs leading-5 text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
