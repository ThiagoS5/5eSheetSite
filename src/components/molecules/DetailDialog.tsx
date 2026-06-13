"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface DetailDialogProps {
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  children: ReactNode;
}

export function DetailDialog({
  title,
  description,
  triggerLabel = "Detalhes",
  triggerClassName,
  children,
}: DetailDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
          }
        >
          {triggerLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <Dialog.Content className="relative max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-[#c41e1e]/50 bg-[#12131a] p-6 text-[#e8e9f0] shadow-2xl shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70">
            <Dialog.Title className="font-serif text-2xl font-bold text-white">
              {title}
            </Dialog.Title>
            <Dialog.Description
              className={
                description
                  ? "mt-2 text-sm leading-6 text-[#7a7e99]"
                  : "sr-only"
              }
            >
              {description ?? `Detalhes de ${title}`}
            </Dialog.Description>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-[#d7d9e6]">
              {children}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Fechar detalhes de ${title}`}
                className="absolute right-4 top-4 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm font-bold text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
              >
                X
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
