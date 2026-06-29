import { CombatStatFrame } from 'ficha-5e-app';

export function Shield() {
  return (
    <CombatStatFrame variant="shield" accentColor="#7a7e99">
      <span className="font-serif text-3xl font-bold text-foreground leading-none">16</span>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">CA</span>
    </CombatStatFrame>
  );
}

export function Square() {
  return (
    <CombatStatFrame variant="square" accentColor="#7a7e99">
      <span className="font-serif text-3xl font-bold text-foreground leading-none">30</span>
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">Vel</span>
    </CombatStatFrame>
  );
}

export function Row() {
  return (
    <div className="flex items-end gap-4">
      <CombatStatFrame variant="shield" accentColor="#7a7e99">
        <span className="font-serif text-3xl font-bold text-foreground leading-none">16</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">CA</span>
      </CombatStatFrame>
      <CombatStatFrame variant="square" accentColor="#7a7e99">
        <span className="font-serif text-2xl font-bold text-foreground leading-none">+2</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Ini</span>
      </CombatStatFrame>
      <CombatStatFrame variant="square" accentColor="#7a7e99">
        <span className="font-serif text-2xl font-bold text-foreground leading-none">30</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">ft</span>
      </CombatStatFrame>
    </div>
  );
}
