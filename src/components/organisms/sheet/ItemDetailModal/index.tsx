"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import type { DetailItem, ItemDetailModalProps } from "./index.types";
export type { DetailItem, ItemDetailModalProps } from "./index.types";

const KIND_LABEL: Record<DetailItem["kind"], string> = {
  weapon: "Action",
  equipment: "Item",
  spell: "Spell",
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[9px] border border-border bg-surface-nested px-3 py-[9px]">
      <p className="mb-0.5 text-[8.5px] font-bold uppercase leading-none tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p translate="no" className="notranslate text-[12.5px] text-foreground">{value}</p>
    </div>
  );
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const open = item != null;
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto bg-black/70 p-[22px] backdrop-blur-sm">
          <Dialog.Content className="relative w-[min(600px,100%)] overflow-hidden rounded-2xl border border-brand-crimson-alt/40 bg-card text-foreground shadow-2xl shadow-black/60 outline-none">
            {item && (
              <>
                <div className="relative border-b border-border bg-gradient-to-b from-primary/[0.14] to-transparent px-[22px] py-5">
                  <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                  <div className="flex items-start justify-between gap-[10px]">
                    <div>
                      <Dialog.Title asChild>
                        <h2 translate="no" className="notranslate m-0 font-serif text-[23px] font-extrabold text-foreground">{item.name}</h2>
                      </Dialog.Title>
                      <p className="mt-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-brand-crimson-alt">
                        {KIND_LABEL[item.kind]}
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
                <Dialog.Description className="sr-only">Details for {item.name}.</Dialog.Description>

                <div className="flex flex-col gap-4 px-[22px] py-5">
                  {item.kind === "weapon" && (
                    <>
                      <div className="flex flex-wrap gap-[9px]">
                        <Tile label="Hit" value={item.attackBonus} />
                        <Tile label="Damage" value={item.damage} />
                        {item.notes && <Tile label="Properties" value={item.notes} />}
                      </div>
                    </>
                  )}

                  {item.kind === "equipment" && (
                    <div className="flex flex-wrap gap-[9px]">
                      <Tile label="Quantity" value={String(item.qty)} />
                      {item.cost && <Tile label="Cost" value={item.cost} />}
                      {item.armorClass != null && <Tile label="AC" value={String(item.armorClass)} />}
                      <Tile label="Source" value={item.source} />
                    </div>
                  )}

                  {item.kind === "spell" && (
                    <>
                      <div className="grid grid-cols-2 gap-[9px]">
                        {item.castingTime && <Tile label="Casting Time" value={item.castingTime} />}
                        {item.range && <Tile label="Range" value={item.range} />}
                        {item.target && <Tile label="Target" value={item.target} />}
                        {item.duration && <Tile label="Duration" value={item.duration} />}
                        {item.components && <Tile label="Components" value={item.components} />}
                        {item.classes && <Tile label="Classes" value={item.classes} />}
                      </div>
                      {item.description && (
                        <p className="m-0 text-[13px] leading-relaxed text-subdued">{item.description}</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
