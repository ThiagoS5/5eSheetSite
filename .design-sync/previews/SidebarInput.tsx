import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInput,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
} from 'ficha-5e-app';

export function SearchInHeader() {
  return (
    <div style={{ height: 260 }}>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarHeader>
            <SidebarInput placeholder="Buscar personagens…" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuButton isActive>Theron, o Bardo</SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton>Lyra, a Paladina</SidebarMenuButton></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuButton>Kaz, o Ladino</SidebarMenuButton></SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
