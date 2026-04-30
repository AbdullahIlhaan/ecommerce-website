import { Link, Head, usePage, router } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  ShoppingCart,
  Heart,
  MapPin,
  Mail,
  Phone,
  Menu,
  Camera,
  Search,
  ChevronRight,
  LayoutDashboard,
  User,
  ShoppingBag,
  Settings,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { CartSheet } from "@/components/shared/CartSheet";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useLocalization } from "@/hooks/use-localization";
import { WishlistSheet } from "@/components/shared/WishlistSheet";
import { hasActiveSalePrice, resolveEffectivePrice } from "@/lib/pricing";
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

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: ((...args: unknown[]) => void) | undefined;
  }
}

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

type FooterSetting = {
  id: string;
  logoPath: string | null;
  logoText: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  facebookPixelId: string | null;
  copyright: string | null;
  paymentMethods: Array<{ name: string; imagePath: string | null }>;
  socialLinks: Array<{ platform: string; url: string }>;
};

function BrandLogo({ logoPath, logoText }: { logoPath?: string | null, logoText?: string }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 sm:gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-base font-black text-white shadow-[0_12px_28px_-16px_rgba(162,40,99,0.6)] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-lg">
        {logoPath ? (
          <img src={logoPath} alt={logoText} className="h-full w-full rounded-xl object-cover sm:rounded-2xl" />
        ) : (
          <img src="/images/logofbd.jpeg" alt="FutureBD logo" className="h-full w-full rounded-xl object-cover sm:rounded-2xl" />
        )}
      </div>
      <div>
        <div className="text-base font-black tracking-tight text-foreground sm:text-lg">{logoText || "FutureBD"}</div>
      </div>
    </Link>
  );
}

export function StorefrontLayout({ children, title }: StorefrontLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLocalization();
  const page = usePage<{
    auth: { user: AuthUser | null };
    categories?: Category[];
    footerSetting: FooterSetting;
  }>();
  const { auth, categories, footerSetting } = page.props;
  const currentUrl = page.url;

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

  const translateCategoryName = (category: { name: string; slug: string }) =>
    t(`content.category.${category.slug}.name`, category.name);

  const translateBrandName = (brand: { name: string; slug: string }) =>
    t(`content.brand.${brand.slug}.name`, brand.name);

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

  useEffect(() => {
    const pixelId = footerSetting.facebookPixelId?.trim();
    if (!pixelId) {
      return;
    }

    if (!window.fbq) {
      ((f: Window, b: Document, e: string, v: string, n?: { (...args: unknown[]): void; callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string }, t?: HTMLScriptElement, s?: Element) => {
        if (f.fbq) {
          return;
        }
        n = (...args: unknown[]) => {
          if (n?.callMethod) {
            n.callMethod(...args);
            return;
          }
          n?.queue?.push(args);
        };
        if (!f._fbq) {
          f._fbq = n;
        }
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e) as HTMLScriptElement;
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", pixelId);
    }

    window.fbq("track", "PageView");
  }, [footerSetting.facebookPixelId, currentUrl]);

  const handleSuggestionSelect = (productId: string) => {
    setIsSearchOpen(false);
    router.visit(`/products/${productId}`);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background pb-24 text-foreground md:pb-0">
      <Head title={title} />

      {/* Header Top */}
      <header className="hidden border-b border-border/60 bg-muted/30 md:block">
        <div className="page_container flex min-h-11 items-center justify-between gap-4 px-4 py-1.5 text-[13px] text-muted-foreground sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            {title !== "Home" && (
              <Link href="/" className="shrink-0 font-semibold transition hover:text-foreground">
                {t("common.home", "Home")}
              </Link>
            )}
            <Link href="/support-center" className="shrink-0 transition hover:text-foreground">{t("common.support_center", "Support Center")}</Link>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              className="interactive inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition hover:bg-card hover:text-foreground"
            >
              <Heart className={`h-4 w-4 ${wishlistItemCount > 0 ? "fill-current text-primary" : ""}`} />
              <span>{t("common.wishlist", "Wish List")}</span>
              {wishlistItemCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {wishlistItemCount}
                </span>
              )}
            </button>
            <LanguageToggle className="py-1" />
          </div>
        </div>
      </header>

      {/* Main Header */}
      <header className="safe-top sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="page_container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 xl:flex-row xl:items-center xl:gap-6 xl:py-5">
            <div className="flex shrink-0 items-center justify-between">
              <BrandLogo logoPath={footerSetting.logoPath} logoText={footerSetting.logoText} />
              <div className="flex items-center gap-1 sm:gap-1.5 xl:hidden">
                <ThemeToggle />
                <button
                  className="interactive relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-primary"
                  onClick={() => setWishlistOpen(true)}
                >
                  <Heart className={`h-5 w-5 ${wishlistItemCount > 0 ? "fill-current text-primary" : ""}`} />
                  {wishlistItemCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {wishlistItemCount}
                    </span>
                  )}
                </button>
                <button 
                  className="interactive relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </button>
                <button 
                  className="interactive inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
                <div ref={searchContainerRef} className="relative flex min-w-0 flex-1">
                  <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border border-border bg-white shadow-sm ring-2 ring-primary/5 focus-within:ring-primary/20 sm:rounded-[5px] sm:border-2 sm:border-primary sm:bg-card sm:ring-0">
                  <div className="hidden border-r border-border bg-accent/40 pl-4 pr-2 sm:flex">
                    <select className="h-12 min-w-[8.5rem] border-0 bg-transparent px-0 text-[15px] font-medium text-foreground focus:outline-none">
                      <option>{t("storefront.all_countries", "All Countries")}</option>
                      <option>{t("storefront.country_china", "China")}</option>
                      <option>{t("storefront.country_bangladesh", "Bangladesh")}</option>
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center px-4">
                    <input
                      type="search"
                      placeholder={t("search.placeholder", "Search for products, brands and more...")}
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
                    {t("common.search", "Search")}
                  </button>
                </div>
                  {isSearchOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[1.75rem] border border-border bg-card/95 shadow-[0_28px_60px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                      <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-background px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/70">{t("search.smart_title", "Smart Search")}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {isSearchLoading
                                ? t("search.searching", "Looking for the best matches...")
                                : t("search.results_for", 'Results for ":query"', { query: searchQuery.trim() })}
                            </p>
                          </div>
                          <button
                            type="submit"
                            className="hidden rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary transition hover:bg-primary hover:text-primary-foreground sm:inline-flex"
                          >
                            {t("search.see_all", "See all")}
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
                              const displayPrice = resolveEffectivePrice(product.price, product.salePrice);
                              const hasDiscount = hasActiveSalePrice(product.price, product.salePrice);

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
                                          {product.brand && <span>{translateBrandName(product.brand)}</span>}
                                          {product.category && <span className="rounded-full bg-muted px-2 py-0.5">{translateCategoryName(product.category)}</span>}
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
                                        {product.stock > 0
                                          ? t("search.in_stock", "In stock")
                                          : t("search.out_of_stock", "Out of stock")}
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
                          <p className="mt-4 text-base font-bold text-foreground">{t("search.no_matches_title", "No direct matches found")}</p>
                          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            {t("search.no_matches_description", "Try a different keyword, brand name, SKU, or continue to the full results page.")}
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

            <div className="flex items-center justify-end md:hidden">
              <LanguageToggle className="py-1" />
            </div>

            {/* Icons & Account */}
            <div className="hidden items-center justify-end gap-1.5 xl:flex xl:gap-2">
              <ThemeToggle />
              <button
                className="interactive relative inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
                onClick={() => setWishlistOpen(true)}
              >
                <Heart className={`h-5 w-5 ${wishlistItemCount > 0 ? "fill-current" : ""}`} />
                {wishlistItemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {wishlistItemCount}
                  </span>
                )}
              </button>
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
              {auth.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group interactive flex items-center gap-3 rounded-full border border-border bg-card pr-4 pl-1 py-1 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md active:scale-[0.98]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f26522] to-[#a12863] text-sm font-bold text-white shadow-sm ring-2 ring-background ring-offset-2 ring-offset-primary/10 transition-transform duration-500 group-hover:rotate-12">
                        {auth.user.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-black tracking-tight text-foreground leading-none">{auth.user.name}</div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {auth.user.canAccessAdminPanel ? (
                             <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#a12863] bg-[#a12863]/10 px-1.5 py-0.5 rounded-full">
                                <LayoutDashboard className="h-2 w-2" />
                                {t("common.dashboard", "Dashboard")}
                             </span>
                          ) : (
                             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{auth.user.role.replace("_", " ")}</span>
                          ) }
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-3xl border border-border bg-card/95 p-3 shadow-[0_28px_60px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl" align="end" sideOffset={12}>
                    <div className="mb-2 flex items-center gap-4 px-4 py-3 border-b border-border/60">
                         <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black">
                            {auth.user.name.slice(0,1).toUpperCase()}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-foreground truncate">{auth.user.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{auth.user.email}</span>
                         </div>
                    </div>
                    
                    <div className="space-y-1">
                      {auth.user.canAccessAdminPanel && (
                        <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                          <Link href="/dashboard" className="flex items-center gap-3 w-full font-bold text-sm">
                            <LayoutDashboard className="h-4 w-4" />
                            {t("storefront.admin_dashboard", "Admin Dashboard")}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                        <Link href="/account" className="flex items-center gap-3 w-full font-bold text-sm">
                          <ShoppingBag className="h-4 w-4" />
                          {t("storefront.my_orders", "My Orders")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer">
                        <Link href="/account" className="flex items-center gap-3 w-full font-bold text-sm">
                          <Settings className="h-4 w-4" />
                          {t("storefront.account_settings", "Account Settings")}
                        </Link>
                      </DropdownMenuItem>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border/60">
                       <DropdownMenuItem 
                        className="rounded-xl px-4 py-3 text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors cursor-pointer"
                        onClick={() => router.post("/logout")}
                       >
                         <div className="flex items-center gap-3 w-full font-bold text-sm">
                           <LogOut className="h-4 w-4" />
                           {t("storefront.log_out", "Log Out")}
                         </div>
                       </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="group interactive flex items-center gap-3 rounded-full border border-border bg-card pr-5 pl-1 py-1 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
                   <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <User className="h-5 w-5" />
                   </div>
                   <span className="text-sm font-black uppercase tracking-widest text-foreground transition-colors group-hover:text-primary">{t("common.sign_in", "Sign In")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="page_container px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-10 px-4 pb-6 text-foreground sm:px-6 lg:px-8">
        <div className="page_container">
          <div className="overflow-hidden rounded-[8px] border-t-8 border border-border bg-card shadow-sm">
            <div className="grid gap-8 px-5 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-10 lg:py-10">
              <div className="lg:col-span-2">
                <BrandLogo logoPath={footerSetting.logoPath} logoText={footerSetting.logoText} />
                <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                  {footerSetting.description}
                </p>
                <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                  {footerSetting.address && (
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]"><MapPin className="h-4 w-4" /></span>
                      <div>{footerSetting.address}</div>
                    </div>
                  )}
                  {footerSetting.phone && (
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]"><Phone className="h-4 w-4" /></span>
                      <div>{footerSetting.phone}</div>
                    </div>
                  )}
                  {footerSetting.email && (
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]"><Mail className="h-4 w-4" /></span>
                      <a href={`mailto:${footerSetting.email}`} className="break-all transition-colors hover:text-primary">
                        {footerSetting.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("common.company", "Company")}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/about-us" className="hover:text-primary transition-colors">{t("common.about_us", "About Us")}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("common.support", "Support")}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                  <li><Link href="/help-center" className="hover:text-primary transition-colors">{t("common.help_center", "Help Center")}</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-primary transition-colors">{t("common.refund_policy", "Refund Policy")}</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">{t("common.privacy_policy", "Privacy Policy")}</Link></li>
                  <li><Link href="/terms" className="hover:text-primary transition-colors">{t("common.terms_conditions", "Terms & Conditions")}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("common.follow_us", "Follow Us")}</h4>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  {footerSetting.facebookUrl && (
                    <a href={footerSetting.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {footerSetting.youtubeUrl && (
                    <a href={footerSetting.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                   {footerSetting.socialLinks.map((link, idx) => (
                     <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                       {link.platform === 'Facebook' && <Facebook className="h-5 w-5" />}
                       {link.platform === 'Twitter' && <Twitter className="h-5 w-5" />}
                       {link.platform === 'Instagram' && <Instagram className="h-5 w-5" />}
                       {link.platform === 'Linkedin' && <Linkedin className="h-5 w-5" />}
                       {link.platform === 'Github' && <Github className="h-5 w-5" />}
                       {link.platform === 'Youtube' && <Youtube className="h-5 w-5" />}
                     </a>
                   ))}
                </div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("common.payment", "Payment")}</h4>
                {footerSetting.paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {footerSetting.paymentMethods.map((p, idx) => (
                      <div key={idx} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background p-2 text-center text-[10px] font-bold">
                        {p.imagePath && <img src={p.imagePath} alt={p.name} className="h-4 w-auto object-contain" />}
                        <span>{p.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment methods added yet.</p>
                )}
              </div>
            </div>
            <div className="border-t border-border bg-muted/20 px-5 py-5 text-center text-sm text-muted-foreground sm:px-6 lg:px-10">
              {footerSetting.copyright}
            </div>
          </div>
        </div>
      </footer>

      <MobileBottomNav />

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border/70 bg-card p-0">
          <SheetHeader className="p-6 text-left border-b border-border">
            <SheetTitle className="text-2xl font-black">{t("storefront.browse_futurebd", "Browse FutureBD")}</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto pb-20">
            <div className="p-6 space-y-6">
              <LanguageToggle className="justify-between py-1" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">{t("common.categories", "Categories")}</div>
                  <Link href="/categories/all" onClick={() => setMobileMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                    {t("common.view_all", "View All")}
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
                              {translateCategoryName(category)}
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
                                {translateCategoryName(child)}
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
                          <span>{translateCategoryName(category)}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
                {nestedCategories.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                    {t("common.no_categories", "No categories available.")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <WishlistSheet open={wishlistOpen} onOpenChange={setWishlistOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
