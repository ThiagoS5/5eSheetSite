import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from 'ficha-5e-app';

export function WithCaption() {
  return (
    <Table>
      <TableCaption>Inventário de Armas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Dano</TableHead>
          <TableHead>Peso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Espada Longa</TableCell>
          <TableCell>1d8 cortante</TableCell>
          <TableCell>3 lb</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Arco Curto</TableCell>
          <TableCell>1d6 perfurante</TableCell>
          <TableCell>2 lb</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
