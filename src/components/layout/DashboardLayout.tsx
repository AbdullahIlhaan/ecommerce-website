import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReactNode } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import type { AuthUser } from "@/lib/store";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;
  const user = auth.user;
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-background">
          <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
              <SidebarTrigger className="rounded-full lg:hidden" />
              <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                Home
              </Link>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="h-11 w-72 border-0 bg-muted/60 pl-9 focus-visible:ring-1 lg:w-80"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              {user && (
                <>
                  <Link href="/account" className="hidden text-right sm:block">
                    <div className="text-sm font-semibold leading-none">{user.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{user.role.replace("_", " ")}</div>
                  </Link>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full px-4" onClick={() => router.post("/logout")}>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto px-4 py-5 pb-24 md:px-6 md:py-6 md:pb-6">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
