import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton,
} from 'ficha-5e-app';

export function AppHeader() {
  return (
    <div style={{ height: 200 }}>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-base font-bold text-foreground">Ficha 5e</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton>Personagens</SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
