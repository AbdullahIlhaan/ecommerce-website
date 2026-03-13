import {
  LayoutDashboard, Package, FolderTree, Award, Users,
  ShoppingCart, Ticket, Star, ChevronLeft, Shield, User
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePage } from "@inertiajs/react";
import type { AuthUser, UserRole } from "@/lib/store";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "admin", "moderator"] as UserRole[] },
  { title: "Products", url: "/products", icon: Package, roles: ["super_admin", "admin"] as UserRole[] },
  { title: "Categories", url: "/categories", icon: FolderTree, roles: ["super_admin", "admin"] as UserRole[] },
  { title: "Brands", url: "/brands", icon: Award, roles: ["super_admin", "admin"] as UserRole[] },
  { title: "Customers", url: "/customers", icon: Users, roles: ["super_admin", "admin"] as UserRole[] },
  { title: "Orders", url: "/orders", icon: ShoppingCart, roles: ["super_admin", "admin"] as UserRole[] },
  { title: "Coupons", url: "/coupons", icon: Ticket, roles: ["super_admin", "admin"] as UserRole[] },
  { title: "Reviews", url: "/reviews", icon: Star, roles: ["super_admin", "admin", "moderator"] as UserRole[] },
  { title: "Users", url: "/users", icon: Shield, roles: ["super_admin"] as UserRole[] },
  { title: "Account", url: "/account", icon: User, roles: ["super_admin", "admin", "moderator", "customer"] as UserRole[] },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;
  const role = auth.user?.role ?? "customer";
  const items = mainNav.filter((item) => item.roles.includes(role));

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
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-widest font-semibold mb-1">Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
