import { Button, Spinner } from 'ficha-5e-app';

export function Variants() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Salvar Ficha</Button>
      <Button variant="secondary">Cancelar</Button>
      <Button variant="outline">Exportar PDF</Button>
      <Button variant="ghost">Ver Detalhes</Button>
      <Button variant="destructive">Excluir Personagem</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Xs</Button>
      <Button size="sm">Pequeno</Button>
      <Button size="default">Padrão</Button>
      <Button size="lg">Grande</Button>
    </div>
  );
}

export function States() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>Normal</Button>
      <Button loading>Salvando…</Button>
      <Button disabled>Desabilitado</Button>
    </div>
  );
}
