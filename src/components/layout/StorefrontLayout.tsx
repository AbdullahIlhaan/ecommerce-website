import { Link, Head, usePage, router } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Heart,
  Bell,
  ShoppingCart,
  MapPin,
  Phone,
  Menu,
  Camera,
  Search,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { CartSheet } from "@/components/shared/CartSheet";
import { useCart } from "@/hooks/use-cart";
import type { AuthUser } from "@/lib/store";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
};

type StorefrontLayoutProps = {
  children: ReactNode;
  title?: string;
};

type SearchSuggestion = {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  image: string;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
};

function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-lg font-black text-white shadow-[0_12px_28px_-16px_rgba(162,40,99,0.6)]">
        <img src="/images/logofbd.jpeg" alt="FutureBD logo" className="h-full w-full rounded-2xl object-cover" />
      </div>
      <div>
        <div className="text-lg font-black tracking-tight text-foreground">FutureBD</div>
      </div>
    </Link>
  );
}

export function StorefrontLayout({ children, title }: StorefrontLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const { itemCount } = useCart();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const { auth, categories } = usePage<{
    auth: { user: AuthUser | null };
    categories?: Category[];
  }>().props;

  const categoryItems = categories ?? [];
  const rootCategories = categoryItems.filter((category) => category.parentId === null);
  const visibleCategories = rootCategories.length > 0 ? rootCategories : categoryItems;

  const accountHref = auth.user
    ? auth.user.canAccessAdminPanel
      ? "/dashboard"
      : "/account"
    : "/login";
  const accountLabel = auth.user ? auth.user.name : "Login";
  const accountSubLabel = auth.user ? auth.user.role.replace("_", " ") : "";
  
  const primaryCtaHref = auth.user
    ? auth.user.canAccessAdminPanel
      ? "/dashboard"
      : "/account"
    : "/login";
  const primaryCtaLabel = auth.user ? (auth.user.canAccessAdminPanel ? "Open Dashboard" : "My Account") : "Sign In";

  // Nested categories helper
  const nestedCategories = useMemo(() => {
    const map = new Map<string, Category>();
    categoryItems.forEach(c => map.set(c.id, { ...c, children: [] }));
    const roots: Category[] = [];
    categoryItems.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children!.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    return roots;
  }, [categoryItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = searchQuery.trim();
    if (!trimmedSearch) return;

    setIsSearchOpen(false);
    router.get('/shop', { search: trimmedSearch }, { preserveState: false });
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 1) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchLoading(true);

      try {
        const response = await fetch(`/shop/search/suggestions?search=${encodeURIComponent(trimmedQuery)}`, {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }

        const data = await response.json() as { products?: SearchSuggestion[] };
        setSearchResults(data.products ?? []);
        setIsSearchOpen(true);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setSearchResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleSuggestionSelect = (productId: string) => {
    setIsSearchOpen(false);
    router.visit(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background pb-24 text-foreground md:pb-0">
      <Head title={title} />

      {/* Header Top */}
      <header className="hidden border-b border-border/60 bg-muted/30 md:block">
        <div className="page_container flex h-9 items-center justify-between gap-4 px-4 text-[13px] text-muted-foreground sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            {title !== "Home" && (
              <Link href="/" className="shrink-0 font-semibold transition hover:text-foreground">
                Home
              </Link>
            )}
            <a href="#" className="shrink-0 transition hover:text-foreground">Support Center</a>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <a href="#" className="hidden items-center gap-1.5 transition hover:text-foreground sm:inline-flex">
              <Heart className="h-3.5 w-3.5" />
              <span>Wish List</span>
            </a>
            <div className="h-4 w-px bg-border" />
            <div className="surface-card flex items-center gap-2 rounded-md px-2.5 py-1 text-muted-foreground">
              <img src="https://flagcdn.com/w20/bd.png" alt="BD" className="h-3 w-[18px] rounded-[2px] object-cover" />
              <span>English (US) / BDT</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Header */}
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="page_container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex shrink-0 items-center justify-between">
              <BrandLogo />
              <button 
                className="interactive inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition hover:bg-muted lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
                <div ref={searchContainerRef} className="relative flex min-w-0 flex-1">
                  <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border border-border bg-white shadow-sm ring-2 ring-primary/5 focus-within:ring-primary/20 sm:rounded-[5px] sm:border-2 sm:border-primary sm:bg-card sm:ring-0">
                  <div className="hidden border-r border-border bg-accent/40 pl-4 pr-2 sm:flex">
                    <select className="h-12 min-w-[8.5rem] border-0 bg-transparent px-0 text-[15px] font-medium text-foreground focus:outline-none">
                      <option>All Countries</option>
                      <option>China</option>
                      <option>Bangladesh</option>
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center px-4">
                    <input
                      type="search"
                      placeholder="Search for products, brands and more..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchQuery.trim().length >= 1) {
                          setIsSearchOpen(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setIsSearchOpen(false);
                        }
                      }}
                      className="h-10 w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:h-12 sm:text-[15px]"
                    />
                    <button type="submit" className="text-primary sm:hidden">
                      <Search className="h-5 w-5" />
                    </button>
                  </div>
                  <button type="submit" className="interactive hidden h-12 bg-primary px-7 text-[15px] font-semibold text-primary-foreground sm:block transition-colors hover:bg-primary/90">
                    Search
                  </button>
                </div>
                  {isSearchOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[1.75rem] border border-border bg-card/95 shadow-[0_28px_60px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                      <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-background px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/70">Smart Search</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {isSearchLoading ? "Looking for the best matches..." : `Results for "${searchQuery.trim()}"`}
                            </p>
                          </div>
                          <button
                            type="submit"
                            className="hidden rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary transition hover:bg-primary hover:text-primary-foreground sm:inline-flex"
                          >
                            See all
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[28rem] overflow-y-auto p-3">
                        {isSearchLoading ? (
                          <div className="space-y-2 p-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="flex items-center gap-4 rounded-2xl border border-border/60 px-3 py-3">
                                <div className="h-16 w-16 animate-pulse rounded-2xl bg-muted" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                                  <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.map((product) => {
                              const displayPrice = product.salePrice ?? product.price;
                              const hasDiscount = product.salePrice !== null && product.salePrice < product.price;

                              return (
                                <button
                                  key={product.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleSuggestionSelect(product.id)}
                                  className="flex w-full items-center gap-4 rounded-[1.35rem] border border-transparent px-3 py-3 text-left transition hover:border-primary/20 hover:bg-primary/5"
                                >
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-16 w-16 rounded-2xl border border-border object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <p className="line-clamp-1 text-sm font-bold text-foreground">{product.name}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                          {product.brand && <span>{product.brand.name}</span>}
                                          {product.category && <span className="rounded-full bg-muted px-2 py-0.5">{product.category.name}</span>}
                                          {product.sku && <span>SKU: {product.sku}</span>}
                                        </div>
                                      </div>
                                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                      <span className="text-sm font-black text-primary">BDT {displayPrice.toLocaleString()}</span>
                                      {hasDiscount && (
                                        <span className="text-xs font-medium text-muted-foreground line-through">
                                          BDT {product.price.toLocaleString()}
                                        </span>
                                      )}
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                          product.stock > 0
                                            ? "bg-emerald-500/10 text-emerald-700"
                                            : "bg-destructive/10 text-destructive"
                                        }`}
                                      >
                                        {product.stock > 0 ? "In stock" : "Out of stock"}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-border px-6 py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Search className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-base font-bold text-foreground">No direct matches found</p>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                              Try a different keyword, brand name, SKU, or continue to the full results page.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-border sm:hidden">
                  <Camera className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Icons & Account */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
              <ThemeToggle />
              <button 
                className="interactive relative inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
              <button className="interactive inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
              </button>
              <Link href={accountHref} className="interactive flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#9d2a5f] text-sm font-bold text-white">
                  {auth.user ? auth.user.name.slice(0, 1).toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block">
                  <div className="text-md font-semibold leading-none text-foreground">{accountLabel}</div>
                  {accountSubLabel && (
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{accountSubLabel}</div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page_container px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-10 hidden px-4 pb-6 text-foreground md:block sm:px-6 lg:px-8">
        <div className="page_container">
          <div className="overflow-hidden rounded-[8px] border-t-8 border border-border bg-card shadow-sm">
            <div className="grid gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-5 lg:px-10">
              <div className="lg:col-span-2">
                <BrandLogo />
                <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                  The platform to get products from global marketplaces to Bangladesh. You can pay product price in Bangladeshi Taka (BDT).
                </p>
                <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]"><MapPin className="h-4 w-4" /></span>
                    <div>Plot 1020, Mirpur DOHS, Dhaka.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]"><Phone className="h-4 w-4" /></span>
                    <div>+88 09666 78 3333</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#">About Us</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#">Help Center</Link></li>
                  <li><Link href="#">Refund Policy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Follow Us</h4>
                <div className="mb-5 flex items-center gap-2">
                   {/* Social Icons */}
                </div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Payment</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["bKash", "VISA"].map(p => <div key={p} className="rounded-xl border border-border bg-background p-2 text-center text-[10px] font-bold">{p}</div>)}
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-muted/20 px-6 py-5 text-center text-sm text-muted-foreground lg:px-10">
              © 2018-2026 FutureBD. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <MobileBottomNav />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border/70 bg-card p-0">
          <SheetHeader className="p-6 text-left border-b border-border">
            <SheetTitle className="text-2xl font-black">Browse FutureBD</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto pb-20">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">Categories</div>
                  <Link href="/categories/all" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                    View All
                  </Link>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {nestedCategories.map((category) => (
                    <AccordionItem key={category.id} value={category.id} className="border-0">
                      {category.children && category.children.length > 0 ? (
                        <>
                          <AccordionTrigger className="flex min-h-12 items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-bold hover:bg-muted/40 hover:no-underline data-[state=open]:border-primary data-[state=open]:bg-primary/5">
                            <Link 
                              href={`/shop?category=${category.id}`} 
                              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(false); }}
                              className="flex-1 text-left"
                            >
                              {category.name}
                            </Link>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pl-4 space-y-1">
                            {category.children.map((child) => (
                              <Link 
                                key={child.id} 
                                href={`/shop?category=${child.id}`} 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                                {child.name}
                              </Link>
                            ))}
                          </AccordionContent>
                        </>
                      ) : (
                        <Link 
                          href={`/shop?category=${category.id}`} 
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex min-h-12 items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-bold hover:bg-muted/40 transition-colors"
                        >
                          <span>{category.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
