import { StatBadge } from 'ficha-5e-app';

export function Basic() {
  return <StatBadge label="Iniciativa" value="+3" />;
}

export function WithDetail() {
  return <StatBadge label="Velocidade" value="30 ft" detail="base" />;
}

export function Row() {
  return (
    <div className="flex gap-3">
      <StatBadge label="CA" value="16" detail="armadura" />
      <StatBadge label="Iniciativa" value="+3" />
      <StatBadge label="Velocidade" value="30 ft" detail="base" />
      <StatBadge label="PV Máx" value="42" />
    </div>
  );
}
