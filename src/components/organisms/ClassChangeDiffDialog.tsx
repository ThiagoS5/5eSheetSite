"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";

interface ClassChangeDiffDialogProps {
  open: boolean;
  items: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClassChangeDiffDialog({
  open,
  items,
  onConfirm,
  onCancel,
}: ClassChangeDiffDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <Dialog.Content className="w-full max-w-md rounded-xl border border-white/[0.08] bg-surface-nested p-5 text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
            <Dialog.Title className="font-serif text-xl font-bold text-foreground">
              Alterar classe
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-subdued">
              Trocar a classe reinicia escolhas que dependem dela para manter a ficha consistente:
            </Dialog.Description>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-accent">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-5 flex justify-end gap-3">
              <ActionBtn intent="secondary" autoFocus onClick={onCancel}>
                Cancelar
              </ActionBtn>
              <ActionBtn onClick={onConfirm}>Trocar de classe</ActionBtn>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
