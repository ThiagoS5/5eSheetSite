import { SidebarFooter, Button } from 'ficha-5e-app';

export function WithActions() {
  return (
    <div
      style={{
        width: 220,
        borderRadius: 8,
        border: '1px solid hsl(var(--border))',
        background: 'hsl(var(--card))',
        overflow: 'hidden',
      }}
    >
      <SidebarFooter>
        <div className="flex flex-col gap-1 px-1">
          <Button variant="ghost" size="sm" className="justify-start w-full">
            Exportar PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start w-full text-destructive-foreground"
          >
            Sair
          </Button>
        </div>
      </SidebarFooter>
    </div>
  );
}
