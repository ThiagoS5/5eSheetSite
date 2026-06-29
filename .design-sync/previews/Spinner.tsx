import { Spinner } from 'ficha-5e-app';

export function Small() {
  return (
    <div className="flex items-center gap-3 text-foreground">
      <Spinner className="size-4" label="Carregando" />
      <span className="text-sm text-subdued">Carregando…</span>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex items-center gap-6 text-foreground">
      <Spinner className="size-4" label="size-4" />
      <Spinner className="size-6" label="size-6" />
      <Spinner className="size-8" label="size-8" />
      <Spinner className="size-12" label="size-12" />
    </div>
  );
}

export function InlineWithText() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-elevated px-4 py-3">
      <Spinner className="size-5 text-primary" label="Salvando ficha" />
      <span className="text-sm font-medium text-foreground">Salvando ficha…</span>
    </div>
  );
}
