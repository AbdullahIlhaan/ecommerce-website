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

const highlights = [
  {
    title: "Easy to use",
    description: "Surf, select, and purchase. It's that easy to do cross border shopping now.",
    icon: ShoppingBag,
  },
  {
    title: "Fastest Delivery",
    description: "Doorstep delivery of cross border trade products in 25 days.",
    icon: Truck,
  },
  {
    title: "Best Support",
    description: "Feel free to contact us via call, live chat, and Facebook.",
    icon: LifeBuoy,
  },
  {
    title: "Trusted Refund Policy",
    description: "Shop without hesitation as you are covered by refund policy.",
    icon: RefreshCcw,
  },
];

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

  const { auth, categories, heroBanners, latestProducts, flashSaleProducts, trendingProducts, brands } = usePage<{
    auth: { user: AuthUser | null };
    categories?: HomeCategory[];
    heroBanners?: HomeHeroBanner[];
    latestProducts?: ProductProps[];
    flashSaleProducts?: ProductProps[];
    trendingProducts?: ProductProps[];
    brands?: { id: string; name: string }[];
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

  return (
    <StorefrontLayout title="Home">
      {/* Hero Section */}
      <section className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="relative hidden xl:block">
            <div className="h-full overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_22px_60px_-36px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between bg-primary px-5 py-3 text-white">
                <div className="flex items-center gap-3">
                  <Menu className="h-5 w-5" />
                  <span className="text-lg font-black tracking-tight">Categories</span>
                </div>
                <Link href="/categories/all" className="interactive rounded-[8px] px-3 py-1 text-xs font-bold bg-white/10 transition hover:bg-white/20">
                  View All
                </Link>
              </div>

              <div className="relative" onMouseLeave={() => setHoveredCategory(null)}>
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
                          ? "bg-primary/5 text-primary pl-7" 
                          : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span>{category.name}</span>
                        <ChevronRight className={`h-4 w-4 transition-transform ${hoveredCategory === category.id ? "translate-x-1" : ""}`} />
                      </Link>

                      {/* Mega Menu Panel */}
                      {hoveredCategory === category.id && category.children && category.children.length > 0 && (
                        <div className="absolute left-[318px] top-0 z-50 min-h-full w-[400px] animate-in fade-in slide-in-from-left-2 duration-200">
                          <div className="ml-2 rounded-2xl border border-border bg-card p-6 shadow-2xl ring-1 ring-black/5">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="text-lg font-black tracking-tight text-foreground">{category.name}</h4>
                              <Link href={`/shop?category=${category.id}`} className="text-xs font-bold text-primary hover:underline">
                                Explore All
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {category.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/shop?category=${child.id}`}
                                  className="group/item flex items-center gap-3 rounded-xl p-3 transition hover:bg-primary/5"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                  </div>
                                  <span className="text-sm font-bold text-muted-foreground group-hover/item:text-primary transition-colors">
                                    {child.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                            
                            {/* Promo area in mega menu */}
                            <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-4">
                               <p className="text-xs font-black uppercase tracking-widest text-primary">Limited Offer</p>
                               <p className="mt-1 text-sm font-medium">Up to 40% off on {category.name}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="px-5 py-4 text-[15px] text-muted-foreground">No categories available.</div>
                  )}
                </div>
              </div>
            </div>
          </aside>
          
          {/*Hero Banner */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[8px] border border-border bg-card shadow-[0_24px_60px_-36px_rgba(15,23,42,0.26)]">
              {slides.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                      {slides.map((slide) => (
                        <div key={slide.id} className="relative w-full shrink-0">
                          <Link href={slide.buttonUrl || "/shop"} className="block relative group cursor-pointer">
                            <img
                              src={slide.imagePath}
                              alt={slide.title}
                              className="h-auto w-full object-cover"
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
                        className="interactive absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground backdrop-blur"
                        onClick={() => setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1))}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next slide"
                        className="interactive absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground backdrop-blur"
                        onClick={() => setActiveSlide((current) => (current + 1) % slides.length)}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                        {slides.map((slide, index) => (
                          <button
                            key={slide.id}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/55"}`}
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
      <section className="mt-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <article key={idx} className="flex flex-col items-center text-center space-y-4 group rounded-[8px] bg-[#f8f9fa] dark:bg-card/30 p-8 border border-border/50 transition-transform duration-500 hover:scale-105">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary/5 dark:bg-background transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
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
        <section className="mt-16 space-y-8">
           <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Top Brands</h2>
            <Link href="/shop" className="text-sm font-bold text-primary hover:underline">See All</Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <Link 
                key={brand.id} 
                href={`/shop?brand=${brand.id}`}
                className="flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-4 font-black tracking-tight shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      {flashSaleProducts && flashSaleProducts.length > 0 && (
        <section className="mt-16 overflow-hidden rounded-[40px] bg-gradient-to-br from-[#a12863] to-[#f26522] p-8 sm:p-12 text-white">
          <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Flame className="h-4 w-4 animate-bounce" />
                Flash Sale
              </div>
              <h2 className="text-3xl font-black tracking-tight lg:text-5xl">Limited Time Deals</h2>
              <p className="text-white/80">Grab your favorites before they're gone!</p>
            </div>
            
            <div className="flex gap-4">
              {[ { l: 'H', v: '02' }, { l: 'M', v: '45' }, { l: 'S', v: '18' } ].map((t, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black backdrop-blur-xl border border-white/20">
                    {t.v}
                  </div>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/60">{t.l}</span>
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
        <section className="mt-20 space-y-8">
           <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight sm:text-4xl">Trending Now</h2>
              <p className="text-muted-foreground">The most popular picks from our community</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold text-primary">
              Discover More
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">New Arrivals</h2>
            <p className="text-sm text-muted-foreground sm:text-base">Explore our latest products from global brands</p>
          </div>
          <Link href="/shop" className="interactive font-semibold text-primary transition-colors hover:text-brand-hover">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(latestProducts ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {(latestProducts ?? []).length === 0 && (
          <div className="flex min-h-[120px] items-center justify-center rounded-[8px] border-2 border-dashed border-border bg-muted/20 text-muted-foreground">
            No products found.
          </div>
        )}
      </section>

      {/* WhatsApp Floating Button */}
      <div className="safe-bottom fixed bottom-20 right-4 md:bottom-6 md:right-6 lg:z-50">
        <a
          href="https://wa.me/8801335989463"
          target="_blank"
          rel="noopener noreferrer"
          className="interactive inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/25 transition hover:-translate-y-1 hover:bg-green-600"
          aria-label="Chat on WhatsApp"
        >
          <span className="text-xl font-black">W</span>
        </a>
      </div>
    </StorefrontLayout>
  );
}
