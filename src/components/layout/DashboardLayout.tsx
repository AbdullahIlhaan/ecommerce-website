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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { auth, notifications } = usePage<{
    auth: { user: AuthUser | null };
    notifications: {
      items: Array<{
        id: string;
        title: string;
        message: string;
        href?: string | null;
        createdAt?: string | null;
        isRead: boolean;
      }>;
      unreadCount: number;
    };
  }>().props;
  const user = auth.user;
  const notificationItems = notifications?.items ?? [];
  const unreadCount = notifications?.unreadCount ?? 0;
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-destructive" />
                        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[340px] p-0">
                  <div className="flex items-center justify-between px-4 py-3">
                    <DropdownMenuLabel className="p-0 text-sm">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary transition hover:text-primary/80"
                        onClick={() => router.post("/notifications/read-all", {}, { preserveScroll: true, preserveState: true })}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator className="m-0" />
                  <div className="max-h-96 overflow-y-auto p-1">
                    {notificationItems.length === 0 ? (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet.
                      </div>
                    ) : (
                      notificationItems.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="items-start gap-3 rounded-none px-3 py-3"
                          onSelect={(event) => {
                            event.preventDefault();
                            router.post(
                              `/notifications/${notification.id}/read`,
                              {},
                              {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: () => {
                                  if (notification.href) {
                                    router.visit(notification.href);
                                  }
                                },
                              },
                            );
                          }}
                        >
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? "bg-muted" : "bg-primary"}`} />
                          <div className="min-w-0 space-y-1">
                            <div className="line-clamp-1 text-sm font-semibold">{notification.title}</div>
                            <div className="line-clamp-2 text-xs leading-5 text-muted-foreground">{notification.message}</div>
                            {notification.createdAt && (
                              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                                {notification.createdAt}
                              </div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
