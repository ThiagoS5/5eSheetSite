import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarFooter, Button,
} from 'ficha-5e-app';

export function CharacterNav() {
  return (
    <div style={{ height: 400 }}>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarHeader>
            <span className="px-3 py-2 text-sm font-semibold text-foreground">Ficha 5e</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Personagem</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>Atributos</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Perícias</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Equipamento</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Exportar PDF
            </Button>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
