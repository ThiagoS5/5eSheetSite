import { SheetFooter, Button } from 'ficha-5e-app';

export function WithActions() {
  return (
    <SheetFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Salvar Alterações</Button>
    </SheetFooter>
  );
}

export function Destructive() {
  return (
    <SheetFooter>
      <Button variant="ghost">Cancelar</Button>
      <Button variant="destructive">Excluir Personagem</Button>
    </SheetFooter>
  );
}
