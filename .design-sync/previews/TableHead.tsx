import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ficha-5e-app';

export function EquipmentTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Equipamento</TableHead>
          <TableHead>Qtd</TableHead>
          <TableHead className="text-right">Peso (lb)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Cota de Malha</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">55</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Escudo</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">6</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Mochila de Aventureiro</TableCell>
          <TableCell>1</TableCell>
          <TableCell className="text-right">59</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
