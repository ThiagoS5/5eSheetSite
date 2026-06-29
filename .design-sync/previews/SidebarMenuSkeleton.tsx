import {
  SidebarProvider, Sidebar, SidebarContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuSkeleton,
} from 'ficha-5e-app';

export function LoadingState() {
  return (
    <div style={{ height: 220 }}>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuSkeleton /></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuSkeleton /></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuSkeleton /></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuSkeleton /></SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}

export function WithIcon() {
  return (
    <div style={{ height: 220 }}>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
              <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}
