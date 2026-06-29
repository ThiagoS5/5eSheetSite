import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ficha-5e-app';

export function SkillsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Perícia</TableHead>
          <TableHead>Atributo</TableHead>
          <TableHead className="text-right">Bônus</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Atletismo</TableCell>
          <TableCell className="text-muted-foreground">Força</TableCell>
          <TableCell className="text-right font-semibold text-foreground">+5</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Furtividade</TableCell>
          <TableCell className="text-muted-foreground">Destreza</TableCell>
          <TableCell className="text-right font-semibold text-foreground">+4</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Arcana</TableCell>
          <TableCell className="text-muted-foreground">Inteligência</TableCell>
          <TableCell className="text-right text-muted-foreground">+0</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
