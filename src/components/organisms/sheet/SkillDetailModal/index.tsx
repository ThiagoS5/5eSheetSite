"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { SKILL_DESCRIPTIONS } from "@/src/data/skillDescriptions";

import type { SkillDetailModalProps } from "./index.types";
export type { SkillDetailModalProps } from "./index.types";
export function SkillDetailModal({
  skillName,
  label,
  onClose,
}: SkillDetailModalProps) {
  const skillData = skillName ? SKILL_DESCRIPTIONS[skillName] : null;
  const open = skillName != null && skillData != null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto bg-black/70 p-[22px] backdrop-blur-sm">
          <Dialog.Content className="relative w-[min(600px,100%)] overflow-hidden rounded-2xl border border-brand-crimson-alt/40 bg-card text-foreground shadow-2xl shadow-black/60 outline-none">
            {skillData && (
              <>
                <div className="relative border-b border-border bg-gradient-to-b from-primary/[0.14] to-transparent px-[22px] py-5">
                  <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                  <div className="flex items-start justify-between gap-[10px]">
                    <div>
                      <Dialog.Title asChild>
                        <h2 translate="no" className="notranslate m-0 font-serif text-[23px] font-extrabold text-foreground">{label}</h2>
                      </Dialog.Title>
                      <p className="mt-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-brand-crimson-alt">
                        Skill · {skillData.ability}
                      </p>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close"
                        className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface-nested text-muted-foreground outline-none transition hover:border-brand-crimson-alt hover:text-foreground focus-visible:ring-3 focus-visible:ring-brand-crimson-alt/70"
                      >
                        <X aria-hidden="true" className="h-[18px] w-[18px]" />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
                <Dialog.Description className="sr-only">Skill details for {label}.</Dialog.Description>

                <div className="flex flex-col gap-4 px-[22px] py-5">
                  <p className="m-0 text-[13px] leading-relaxed text-subdued">{skillData.text}</p>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
