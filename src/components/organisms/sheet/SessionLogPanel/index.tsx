"use client";

import { useState } from "react";
import type { CampaignLogEntry } from "@/src/types/characterBuild";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type Draft = { id: string | null; title: string; date: string; body: string };

const EMPTY_DRAFT: Draft = { id: null, title: "", date: "", body: "" };

export function SessionLogPanel() {
  const entries = useCharacterStore((s) => s.characterBuild.playState.campaignLog);
  const addEntry = useCharacterStore((s) => s.addCampaignLogEntry);
  const updateEntry = useCharacterStore((s) => s.updateCampaignLogEntry);
  const removeEntry = useCharacterStore((s) => s.removeCampaignLogEntry);
  const [draft, setDraft] = useState<Draft | null>(null);

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  function startNew() {
    setDraft({ ...EMPTY_DRAFT, date: today() });
  }
  function startEdit(entry: CampaignLogEntry) {
    setDraft({ id: entry.id, title: entry.title, date: entry.date, body: entry.body });
  }
  function save() {
    if (!draft) return;
    const payload = { title: draft.title.trim() || "Untitled", date: draft.date || today(), body: draft.body };
    if (draft.id) updateEntry(draft.id, payload);
    else addEntry(payload);
    setDraft(null);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-[14px]">
      <div className="mb-[10px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-[7px]">
          <i aria-hidden="true" className="fa-solid fa-book text-[11px] text-muted-foreground" />
          <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
            Session Log
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className={cn(
            "inline-flex items-center gap-[5px] rounded-[7px] border border-border bg-surface-nested px-[9px] py-[5px] text-[10px] font-semibold text-subdued transition-colors hover:border-brand-crimson-alt hover:text-foreground",
            focusRing,
          )}
        >
          <i aria-hidden="true" className="fa-solid fa-plus text-[9px]" />
          New Entry
        </button>
      </div>

      {draft && (
        <div className="mb-3 flex flex-col gap-2 rounded-lg border border-brand-crimson-alt/50 bg-surface-nested p-3">
          <input
            aria-label="Entry title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Title"
            className={cn("rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground", focusRing)}
          />
          <input
            aria-label="Entry date"
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className={cn("rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground", focusRing)}
          />
          <textarea
            aria-label="Entry body"
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            rows={4}
            placeholder="What happened this session..."
            className={cn("resize-y rounded-md border border-border bg-background px-2 py-1 text-sm text-subdued", focusRing)}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className={cn("rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground", focusRing)}>
              Cancel
            </button>
            <button type="button" onClick={save} className={cn("rounded-md border border-brand-crimson-alt bg-primary px-3 py-1 text-xs font-bold text-white", focusRing)}>
              Save Entry
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !draft ? (
        <p className="text-xs text-muted-foreground">No session entry recorded yet.</p>
      ) : (
        <ul className="flex list-none flex-col gap-2 p-0">
          {sorted.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border bg-surface-nested p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-serif text-sm font-bold text-foreground">{entry.title}</p>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{entry.date}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" aria-label={`Edit ${entry.title}`} onClick={() => startEdit(entry)} className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}>
                    <i aria-hidden="true" className="fa-solid fa-pen text-[10px]" />
                  </button>
                  <button type="button" aria-label={`Delete ${entry.title}`} onClick={() => removeEntry(entry.id)} className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary", focusRing)}>
                    <i aria-hidden="true" className="fa-solid fa-trash text-[10px]" />
                  </button>
                </div>
              </div>
              {entry.body && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-subdued">{entry.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
