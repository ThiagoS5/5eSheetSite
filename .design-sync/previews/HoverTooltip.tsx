import { HoverTooltip } from 'ficha-5e-app';

export function SkillTooltip() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <HoverTooltip
        content={
          <div>
            <p className="font-semibold">Furtividade</p>
            <p className="mt-1 text-xs text-muted-foreground">Destreza (Furtividade). Bônus de competência aplicado.</p>
          </div>
        }
      >
        <span className="border-b border-dashed border-muted-foreground text-foreground cursor-help">
          Furtividade +5
        </span>
      </HoverTooltip>
      <div className="max-w-sm rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground shadow-2xl shadow-black/40">
        <p className="font-semibold">Furtividade</p>
        <p className="mt-1 text-xs text-muted-foreground">Destreza (Furtividade). Bônus de competência aplicado.</p>
      </div>
    </div>
  );
}

export function SpellTooltip() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <HoverTooltip
        content={
          <div className="space-y-2">
            <p className="font-semibold">Bola de Fogo</p>
            <p className="text-xs text-muted-foreground">3º nível • Evocação</p>
            <p className="text-sm">Uma esfera brilhante explode em chamas.</p>
          </div>
        }
      >
        <span className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary cursor-pointer">
          Bola de Fogo
        </span>
      </HoverTooltip>
      <div className="max-w-sm rounded-md border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground shadow-2xl shadow-black/40 space-y-2">
        <p className="font-semibold">Bola de Fogo</p>
        <p className="text-xs text-muted-foreground">3º nível • Evocação • Concentração: não</p>
        <p className="text-sm">Uma esfera brilhante explode em chamas. Cada criatura na área deve fazer um teste de Destreza CD 15.</p>
      </div>
    </div>
  );
}
