import { Link, usePage } from "@inertiajs/react";
import {
  Home,
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";

import type { AuthUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const page = usePage() as unknown as { props: { auth: { user: AuthUser | null } }; url: string };
  const { auth } = page.props;
  const { url } = page;
  const user = auth.user;

  const visibleItems = items.filter((item) => {
    if (item.href === "/dashboard" || item.href === "/products" || item.href === "/orders") {
      return user?.canAccessAdminPanel;
    }

    return true;
  });

  return (
    <nav className="safe-x safe-bottom surface-card fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 py-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {visibleItems.map((item) => {
          const active = url === item.href || (item.href !== "/" && url.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "interactive flex min-h-12 flex-col items-center justify-center rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors sm:min-h-14 sm:rounded-2xl sm:px-2 sm:py-2 sm:text-[11px]",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="mb-1 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
