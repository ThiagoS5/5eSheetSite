import { Progress } from 'ficha-5e-app';

export function ExperienceBar() {
  return (
    <div className="w-64 space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Experiência</span>
        <span>2 450 / 6 500 XP</span>
      </div>
      <Progress value={38} className="h-2" />
    </div>
  );
}

export function HitPoints() {
  return (
    <div className="w-64 space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Pontos de Vida</span>
        <span>28 / 42</span>
      </div>
      <Progress value={67} className="h-3" />
    </div>
  );
}

export function Values() {
  return (
    <div className="w-64 space-y-3">
      <Progress value={0} />
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  );
}
