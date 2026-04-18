import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/lib/store";
import {
  ChevronRight,
  Flame,
  Gift,
  ShoppingBag,
  Truck,
  LifeBuoy,
  RefreshCcw,
  Smartphone,
  Sparkles,
  Camera,
  Heart,
  Bell,
  ShoppingCart,
  MapPin,
  Phone,
  Menu,
  ChevronLeft,
  Search,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { ProductCard, type ProductProps } from "@/components/shared/ProductCard";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalization } from "@/hooks/use-localization";

type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt?: string | null;
  children?: HomeCategory[];
};

type HomeHeroBanner = {
  id: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  imagePath: string;
  imagePaths?: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | null;
};

type HomeFlashDeal = {
  id: string;
  name: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  status: "scheduled" | "running" | "ended" | "disabled";
  productIds: string[];
  products: ProductProps[];
  createdAt?: string | null;
};

function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#f26522] to-[#a12863] text-lg font-black text-white shadow-[0_12px_28px_-16px_rgba(162,40,99,0.6)]">
        <img src="/images/logofbd.jpeg" alt="FutureBD logo" className="h-full w-full rounded-[8px] object-cover" />
      </div>
      <div>
        <div className="text-lg font-black tracking-tight text-foreground">FutureBD</div>
        {/* <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e79]">Smart Shopping With BDT</div> */}
      </div>
    </Link>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [flashNow, setFlashNow] = useState(() => Date.now());
  const { t } = useLocalization();

  const { auth, categories, heroBanners, flashDeal, latestProducts, flashSaleProducts, trendingProducts, brands } = usePage<{
    auth: { user: AuthUser | null };
    categories?: HomeCategory[];
    heroBanners?: HomeHeroBanner[];
    flashDeal?: HomeFlashDeal | null;
    latestProducts?: ProductProps[];
    flashSaleProducts?: ProductProps[];
    trendingProducts?: ProductProps[];
    brands?: { id: string; name: string; slug: string }[];
  }>().props;
  const categoryItems = categories ?? [];
  const rootCategories = categoryItems.filter((category) => category.parentId === null);
  const visibleCategories = rootCategories.length > 0 ? rootCategories : categoryItems;
  const nestedCategories = useMemo(() => {
    const map = new Map<string, HomeCategory>();
    categoryItems.forEach(c => map.set(c.id, { ...c, children: [] }));
    const roots: HomeCategory[] = [];
    categoryItems.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children!.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    return roots;
  }, [categoryItems]);

  const slides = useMemo(() => (
    (heroBanners ?? []).flatMap((banner) => {
      const imagePaths = banner.imagePaths && banner.imagePaths.length > 0
        ? banner.imagePaths
        : [banner.imagePath];

      return imagePaths.map((imagePath, index) => ({
        id: `${banner.id}-${index}`,
        title: banner.title,
        subtitle: banner.subtitle,
        buttonLabel: banner.buttonLabel,
        buttonUrl: banner.buttonUrl,
        imagePath,
      }));
    })
  ), [heroBanners]);
  const accountHref = auth.user
    ? auth.user.canAccessAdminPanel
      ? "/dashboard"
      : "/account"
    : "/login";
  const accountLabel = auth.user ? auth.user.name : "Login";
  const accountSubLabel = auth.user ? auth.user.role.replace("_", " ") : "Register / Sign In";
  const primaryCtaHref = auth.user
    ? auth.user.canAccessAdminPanel
      ? "/dashboard"
      : "/account"
    : "/login";
  const primaryCtaLabel = auth.user ? (auth.user.canAccessAdminPanel ? "Open Dashboard" : "My Account") : "Sign In";
  const highlights = useMemo(() => [
    {
      title: t("home.highlight_easy_title", "Easy to use test test test"),
      description: t("home.highlight_easy_description", "Surf, select, and purchase. It's that easy to do cross border shopping now."),
      icon: ShoppingBag,
    },
    {
      title: t("home.highlight_delivery_title", "Fastest Delivery"),
      description: t("home.highlight_delivery_description", "Doorstep delivery of cross border trade products in 25 days."),
      icon: Truck,
    },
    {
      title: t("home.highlight_support_title", "Best Support"),
      description: t("home.highlight_support_description", "Feel free to contact us via call, live chat, and Facebook."),
      icon: LifeBuoy,
    },
    {
      title: t("home.highlight_refund_title", "Trusted Refund Policy"),
      description: t("home.highlight_refund_description", "Shop without hesitation as you are covered by refund policy."),
      icon: RefreshCcw,
    },
  ], [t]);

  const translateCategoryName = (category: { name: string; slug: string }) =>
    t(`content.category.${category.slug}.name`, category.name);

  const translateBrandName = (brand: { name: string; slug: string }) =>
    t(`content.brand.${brand.slug}.name`, brand.name);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (activeSlide > slides.length - 1) {
      setActiveSlide(0);
    }
  }, [activeSlide, slides.length]);

  useEffect(() => {
    if (!flashDeal?.endsAt) return undefined;

    const interval = window.setInterval(() => {
      setFlashNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [flashDeal?.endsAt]);

  const flashCountdown = useMemo(() => {
    if (!flashDeal?.endsAt) {
      return [
        { l: t("home.countdown_hours", "H"), v: "--" },
        { l: t("home.countdown_minutes", "M"), v: "--" },
        { l: t("home.countdown_seconds", "S"), v: "--" },
      ];
    }

    const distance = new Date(flashDeal.endsAt).getTime() - flashNow;
    const safeDistance = Math.max(distance, 0);
    const totalSeconds = Math.floor(safeDistance / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      { l: t("home.countdown_hours", "H"), v: String(hours).padStart(2, "0") },
      { l: t("home.countdown_minutes", "M"), v: String(minutes).padStart(2, "0") },
      { l: t("home.countdown_seconds", "S"), v: String(seconds).padStart(2, "0") },
    ];
  }, [flashDeal?.endsAt, flashNow, t]);

  return (
    <StorefrontLayout title="Home">
      {/* Hero Section */}
      <section className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-stretch">
          <aside className="relative hidden xl:block xl:h-[420px]">
              <div className="flex h-full flex-col overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_22px_60px_-36px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between bg-primary px-5 py-3 text-white">
                <div className="flex items-center gap-3">
                  <Menu className="h-5 w-5" />
                  <span className="text-lg font-black tracking-tight">{t("common.categories", "Categories")}</span>
                </div>
                <Link href="/categories/all" className="interactive rounded-[8px] px-3 py-1 text-xs font-bold bg-white/10 transition hover:bg-white/20">
                  {t("common.view_all", "View All")}
                </Link>
              </div>

              <div className="relative flex-1" onMouseLeave={() => setHoveredCategory(null)}>
                <ScrollArea className="h-full">
                  <div className="flex flex-col">
                    {nestedCategories.length > 0 ? nestedCategories.map((category) => (
                      <div 
                        key={category.id} 
                        onMouseEnter={() => setHoveredCategory(category.id)}
                        className="group relative"
                      >
                        <Link
                          href={`/shop?category=${category.id}`}
                          className={`interactive flex min-h-[52px] w-full items-center justify-between border-b border-border/70 px-5 py-0 text-left text-[14px] font-bold transition-all ${
                            hoveredCategory === category.id 
                            ? "bg-primary/5 pl-7 text-primary" 
                            : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <span>{translateCategoryName(category)}</span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${hoveredCategory === category.id ? "translate-x-1" : ""}`} />
                        </Link>

                        {/* Mega Menu Panel */}
                        {hoveredCategory === category.id && category.children && category.children.length > 0 && (
                          <div className="absolute left-[318px] top-0 z-50 min-h-full w-[400px] animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="ml-2 rounded-2xl border border-border bg-card p-6 shadow-2xl ring-1 ring-black/5">
                                <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-lg font-black tracking-tight text-foreground">{translateCategoryName(category)}</h4>
                                <Link href={`/shop?category=${category.id}`} className="text-xs font-bold text-primary hover:underline">
                                  {t("storefront.explore_all", "Explore All")}
                                </Link>
                              </div>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {category.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/shop?category=${child.id}`}
                                    className="group/item flex items-center gap-3 rounded-xl p-3 transition hover:bg-primary/5"
                                  >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover/item:bg-primary/10 group-hover/item:text-primary">
                                      <ChevronRight className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground transition-colors group-hover/item:text-primary">
                                      {translateCategoryName(child)}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                              
                              {/* Promo area in mega menu */}
                              <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-4">
                                 <p className="text-xs font-black uppercase tracking-widest text-primary">{t("common.limited_offer", "Limited Offer")}</p>
                                 <p className="mt-1 text-sm font-medium">{t("home.up_to_off", "Up to 40% off on :category", { category: translateCategoryName(category) })}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="px-5 py-4 text-[15px] text-muted-foreground">{t("common.no_categories", "No categories available.")}</div>
                    )}
                  </div>
                </ScrollArea>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card via-card/85 to-transparent" />
              </div>
            </div>
          </aside>
          
          {/*Hero Banner */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_24px_60px_-36px_rgba(15,23,42,0.26)] xl:h-[420px]">
              {slides.length > 0 ? (
                <div className="relative h-full">
                  <div className="h-full overflow-hidden">
                    <div
                      className="flex h-full transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                      {slides.map((slide) => (
                        <div key={slide.id} className="relative w-full shrink-0">
                          <Link href={slide.buttonUrl || "/shop"} className="block relative group cursor-pointer">
                            <img
                              src={slide.imagePath}
                              alt={slide.title}
                              className="aspect-[25/9] w-full object-cover xl:h-[420px] xl:aspect-auto"
                            />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {slides.length > 1 ? (
                    <>
                      <button
                        type="button"
                        aria-label="Previous slide"
                        className="interactive absolute left-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground backdrop-blur sm:left-4 sm:h-11 sm:w-11"
                        onClick={() => setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1))}
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next slide"
                        className="interactive absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground backdrop-blur sm:right-4 sm:h-11 sm:w-11"
                        onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-2 py-1.5 backdrop-blur sm:bottom-4 sm:gap-2 sm:px-3 sm:py-2">
                        {slides.map((slide, index) => (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-1.5 rounded-full transition-all sm:h-2.5 ${index === activeSlide ? "w-6 bg-white sm:w-8" : "w-1.5 bg-white/55 sm:w-2.5"}`}
                            onClick={() => setActiveSlide(index)}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[280px] w-full flex-col justify-between bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--accent)/0.5)_100%)] p-6 text-left sm:min-h-[360px]">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    FutureBD Banner
                  </div>
                  <div>
                    <div className="text-fluid-title font-black tracking-tight text-foreground">Your hero banner will appear here</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mt-16 hidden md:block">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <article key={idx} className="flex flex-col items-center text-center space-y-4 group rounded-[8px] bg-card p-8 border border-border/50 transition-all hover:border-primary/20 hover:shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Brands Showcase */}
      {brands && brands.length > 0 && (
        <section className="mt-12 sm:mt-20 space-y-6 sm:space-y-8">
           <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">{t("home.top_brands", "Top Brands")}</h2>
            <Link href="/shop" className="text-xs sm:text-sm font-bold text-primary hover:underline">{t("home.see_all", "See All")}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
            {brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={`/shop?brand=${brand.id}`}
                className="flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-4 font-black tracking-tight shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95"
              >
                {translateBrandName(brand)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      {flashDeal && flashDeal.status === "running" && flashSaleProducts && flashSaleProducts.length > 0 && (
        <section className="mt-12 sm:mt-20 overflow-hidden rounded-[24px] sm:rounded-[40px] bg-gradient-to-br from-[#a12863] to-[#f26522] p-6 sm:p-12 text-white">
          <div className="mb-8 sm:mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 animate-bounce sm:h-4 sm:w-4" />
                {t("home.flash_sale_badge", "Flash Sale")}
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-5xl">{t("home.limited_time_deals", "Limited Time Deals")}</h2>
              <p className="text-sm opacity-80 sm:text-base sm:opacity-100 text-white/80">{t("home.flash_sale_description", "Grab your favorites before they're gone!")}</p>
            </div>
            
            <div className="flex gap-2 sm:gap-4">
              {flashCountdown.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-lg sm:text-2xl font-black backdrop-blur-xl border border-white/20">
                    {item.v}
                  </div>
                  <span className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {flashSaleProducts.slice(0, 5).map((product) => (
               <div key={product.id} className="relative group">
                 <ProductCard product={product} />
                 <div className="pointer-events-none absolute top-3 right-3 z-10 rounded-lg bg-yellow-400 px-2 py-1 text-[10px] font-black uppercase text-black shadow-lg">
                   Save Big
                 </div>
               </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      {trendingProducts && trendingProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 space-y-6 sm:space-y-8">
           <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-4xl font-black tracking-tight">{t("home.trending_now", "Trending Now")}</h2>
              <p className="text-xs sm:text-base text-muted-foreground">{t("home.trending_description", "The most popular picks from our community")}</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary">
              {t("home.discover_more", "Discover More")}
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {trendingProducts.map((product) => (
               <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Products Section */}
      <section className="mt-12 sm:mt-20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground">{t("home.new_arrivals", "New Arrivals")}</h2>
            <p className="text-xs sm:text-base text-muted-foreground">{t("home.new_arrivals_description", "Explore our latest products from global brands")}</p>
          </div>
          <Link href="/shop" className="interactive text-xs sm:text-base font-bold text-primary">
            {t("common.view_all", "View All")}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(latestProducts ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {(latestProducts ?? []).length === 0 && (
          <div className="flex min-h-[120px] items-center justify-center rounded-[8px] border-2 border-dashed border-border bg-muted/20 text-muted-foreground">
            {t("home.no_products", "No products found.")}
          </div>
        )}
      </section>

      {/* WhatsApp Floating Button */}
      <div className="safe-bottom fixed bottom-20 right-4 z-[60] md:bottom-6 md:right-6">
        <a
          href="https://wa.me/8801335989463"
          target="_blank"
          rel="noopener noreferrer"
          className="interactive flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-12px_rgba(37,211,102,0.6)] transition-all hover:-translate-y-1 hover:bg-[#20bd5a] hover:shadow-[0_16px_48px_-12px_rgba(37,211,102,0.7)] active:scale-95"
          aria-label={t("home.chat_whatsapp", "Chat on WhatsApp")}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </StorefrontLayout>
  );
}
