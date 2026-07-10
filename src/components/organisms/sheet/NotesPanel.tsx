"use client";

import { useState } from "react";
import type { CharacterDescription } from "@/types/builder";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { MarkdownEditor } from "@/src/components/molecules/MarkdownEditor";
import { SessionLogPanel } from "@/src/components/organisms/sheet/SessionLogPanel";

type NoteField = Extract<keyof CharacterDescription, "tracos" | "personalidade" | "historia" | "notas">;

const SUB_TABS: { id: NoteField; label: string }[] = [
  { id: "tracos",        label: "Personality Traits" },
  { id: "personalidade", label: "Personality & Mannerisms" },
  { id: "historia",      label: "Backstory" },
  { id: "notas",         label: "Notes" },
];

export function NotesPanel() {
  const [active, setActive] = useState<NoteField>("tracos");
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const description = useCharacterStore((s) => s.description);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);
  const activeLabel = SUB_TABS.find((t) => t.id === active)!.label;

  return (
    <div className="flex flex-wrap items-start gap-[14px]">
      <div className="flex min-w-[300px] flex-[2_1_380px] flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {SUB_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={active === t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "rounded-lg border px-[13px] py-[10px] text-left text-[11.5px] font-semibold leading-tight transition-colors",
                focusRing,
                active === t.id
                  ? "border-brand-crimson-alt bg-primary text-white"
                  : "border-border bg-surface-nested text-subdued",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <section className="rounded-xl border border-border bg-card p-[14px]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-[7px]">
              <i aria-hidden="true" className="fa-solid fa-feather text-[11px] text-brand-crimson-alt" />
              <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
                {activeLabel}
              </p>
            </div>
            <div role="group" aria-label="Editor mode" className="flex items-center gap-1 rounded-lg border border-border bg-surface-nested p-0.5">
              {([
                { id: "edit" as const, label: "Edit", icon: "fa-pen" },
                { id: "view" as const, label: "View", icon: "fa-eye" },
              ]).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
                    focusRing,
                    mode === m.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <i aria-hidden="true" className={`fa-solid ${m.icon} text-[9px]`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <MarkdownEditor
            docId={active}
            preview={mode === "view"}
            ariaLabel={`${activeLabel} notes editor`}
            value={description[active] ?? ""}
            onChange={(v) => setDescriptionField(active, v)}
          />
        </section>
      </div>

      <div className="min-w-[220px] flex-1 basis-[250px]">
        <SessionLogPanel />
      </div>
    </div>
  );
}
