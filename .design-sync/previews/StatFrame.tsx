import { StatFrame } from 'ficha-5e-app';

export function Strength() {
  return (
    <StatFrame accentColor="#e61c23">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">For</span>
      <span className="font-serif text-4xl font-bold text-foreground leading-none">18</span>
      <span className="font-serif text-xl font-semibold text-foreground">+4</span>
    </StatFrame>
  );
}

export function AttributeRow() {
  const attrs = [
    { abbr: 'For', score: 18, mod: '+4', color: '#e61c23' },
    { abbr: 'Des', score: 14, mod: '+2', color: '#4a9eff' },
    { abbr: 'Con', score: 16, mod: '+3', color: '#e6a61c' },
    { abbr: 'Int', score: 10, mod: '+0', color: '#a855f7' },
    { abbr: 'Sab', score: 12, mod: '+1', color: '#22c55e' },
    { abbr: 'Car', score: 8, mod: '-1', color: '#ec4899' },
  ];
  return (
    <div className="flex gap-2">
      {attrs.map((a) => (
        <StatFrame key={a.abbr} accentColor={a.color}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{a.abbr}</span>
          <span className="font-serif text-3xl font-bold text-foreground leading-none">{a.score}</span>
          <span className="font-serif text-lg font-semibold text-foreground">{a.mod}</span>
        </StatFrame>
      ))}
    </div>
  );
}
