"use client";import * as Dialog from "@radix-ui/react-dialog";

import type { DetailDialogProps } from "./index.types";
export type { DetailDialogProps } from "./index.types";
export function DetailDialog({
  title,
  description,
  triggerLabel = "Details",
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
            "rounded-md border border-border bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-subdued outline-none transition hover:border-brand-crimson-alt/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
          }
        >
          {triggerLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <Dialog.Content className="relative max-h-[90dvh] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto rounded-lg border border-brand-crimson-alt/50 bg-surface-nested p-4 text-foreground shadow-2xl shadow-black/50 outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 sm:max-w-2xl sm:p-6 lg:max-w-4xl">
            <Dialog.Title className="font-serif text-2xl font-bold text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Description
              className={
                description
                  ? "mt-2 text-sm leading-6 text-muted-foreground"
                  : "sr-only"
              }
            >
              {description ?? `${title} details`}
            </Dialog.Description>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-subdued">
              {children}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Close ${title} details`}
                className="absolute right-4 top-4 rounded-md border border-border bg-white/5 px-2 py-1 text-sm font-bold text-subdued outline-none transition hover:border-brand-crimson-alt/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
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
