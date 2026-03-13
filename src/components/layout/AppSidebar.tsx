import {
  LayoutDashboard, Package, FolderTree, Award, Users,
  ShoppingCart, Ticket, Star, ChevronLeft, Shield, User, Circle
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePage } from "@inertiajs/react";
import type { AuthUser, DashboardNavigationGroup } from "@/lib/store";

const iconMap = {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  Users,
  ShoppingCart,
  Ticket,
  Star,
  Shield,
  User,
} as const;

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { navigation } = usePage<{
    auth: { user: AuthUser | null };
    navigation: { dashboard: DashboardNavigationGroup[] };
  }>().props;
  const groups = navigation.dashboard ?? [];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">ShopAdmin</span>
              <span className="text-xs text-sidebar-muted">Ecommerce Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-sidebar-muted">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Circle;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-10">
                        <NavLink
                          to={item.url}
                          end={item.exact}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
