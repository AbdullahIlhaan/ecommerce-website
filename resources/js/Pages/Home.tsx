import { Head, Link, usePage } from "@inertiajs/react";
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
} from "lucide-react";

const categories = [
  "Women's Fashion",
  "Men's Fashion",
  "Phones & Telecommunications",
  "Computer, Office & Security",
  "Consumer Electronics",
  "Jewelry & Watches",
  "Home, Pet & Appliances",
  "Bags & Shoes",
  "Toys, Kids & Babies",
  "Outdoor Fun & Sports",
  "Beauty, Health & Hair",
  "Automobiles & Motorcycles",
  "Home Improvement & Tools",
];

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
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-lg font-black text-white shadow-[0_12px_28px_-16px_rgba(162,40,99,0.6)]">
        F
      </div>
      <div>
        <div className="text-lg font-black tracking-tight text-[#2f2f35]">FutureBD</div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#8a7e79]">Smart Shopping With BDT</div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { auth } = usePage<{ auth: { user: AuthUser | null } }>().props;
  const accountHref = auth.user ? "/account" : "/login";
  const accountLabel = auth.user ? auth.user.name : "Login";
  const accountSubLabel = auth.user ? auth.user.role.replace("_", " ") : "Register / Sign in";

  return (
    <>
      <Head title="Home" />

      <div className="min-h-screen bg-[#fcf8f5] text-[#2f2f35]">
        <header className="hidden border-b border-black/5 bg-[#f6f4f1] md:block">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[13px] text-[#665d58] sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-5">
              <a href="#" className="shrink-0 transition hover:text-[#2f2f35]">
                Support Center
              </a>
              <span className="hidden truncate text-[#958983] lg:inline">
                Fast delivery, local payment, tracked orders
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <a href="#" className="hidden items-center gap-1.5 transition hover:text-[#2f2f35] sm:inline-flex">
                <Heart className="h-3.5 w-3.5" />
                <span>Wish List</span>
              </a>

              <div className="h-4 w-px bg-black/10" />

              <div className="flex items-center gap-2 rounded-md border border-[#cfd7e3] bg-white px-2.5 py-1 text-[#706762]">
                <img
                  src="https://flagcdn.com/w20/bd.png"
                  alt="Bangladesh Flag"
                  className="h-3 w-[18px] rounded-[2px] object-cover"
                />
                <span>English (US) / BDT</span>
              </div>
            </div>
          </div>
        </header>

        <header className="sticky top-0 z-30 border-b border-[#e8ddd6] bg-[#fffdfa]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex shrink-0 items-center justify-between">
                <BrandLogo />

                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2f2f35] transition hover:bg-[#f3e7df] lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1">
                <form className="w-full">
                  <div className="flex flex-col overflow-hidden rounded-xl border-2 border-[#c32c30] bg-white shadow-[0_14px_36px_-26px_rgba(195,44,48,0.45)] sm:flex-row sm:items-center">
                    <div className="hidden items-center border-r border-[#ecd7d0] bg-[#fff7f4] pl-4 pr-2 sm:flex">
                      <select className="h-11 min-w-[8.5rem] border-0 bg-transparent px-0 text-[15px] font-medium text-[#2f2f35] focus:outline-none">
                        <option>China</option>
                        <option>Bangladesh</option>
                      </select>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center px-4">
                      <input
                        type="search"
                        placeholder="Search by link, keyword, or category"
                        className="h-11 w-full border-0 bg-transparent text-[15px] text-[#2f2f35] placeholder:text-[#8b817b] focus:outline-none focus:ring-0"
                      />

                      <button
                        type="button"
                        className="mr-2 hidden text-[#746b66] transition hover:text-[#c32c30] sm:inline-flex"
                        aria-label="Search by image"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="submit"
                        className="h-11 min-h-11 w-full bg-[#c32c30] px-7 text-[15px] font-semibold text-white transition hover:bg-[#ab262a] sm:w-auto"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                <button aria-label="cart" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#746b66] transition hover:bg-[#c32c30]/5 hover:text-[#c32c30]">
                  <ShoppingCart className="h-5 w-5" />
                </button>

                <button aria-label="notifications" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#746b66] transition hover:bg-[#c32c30]/5 hover:text-[#c32c30]">
                  <Bell className="h-5 w-5" />
                </button>

                <Link href={accountHref} className="flex items-center gap-3 rounded-full border border-[#d9bfd2] bg-white px-2 py-1 shadow-[0_12px_30px_-24px_rgba(94,23,71,0.55)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c32c30] to-[#9d2a5f] text-sm font-bold text-white">
                    {auth.user ? auth.user.name.slice(0, 1).toUpperCase() : "A"}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-[#928680]">Account</div>
                    <div className="text-lg font-semibold leading-none text-[#2f2f35]">{accountLabel}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#928680]">{accountSubLabel}</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="overflow-hidden rounded-[1.6rem] border border-[#ecd9d1] bg-white shadow-[0_22px_60px_-36px_rgba(15,23,42,0.25)]">
                <div className="flex items-center justify-between bg-gradient-to-r from-[#f26522] to-[#ff7d2f] px-5 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <Menu className="h-5 w-5" />
                    <span className="text-xl font-semibold">Categories</span>
                  </div>
                  <button className="text-sm font-medium text-white/90 transition hover:text-white">
                    View All
                  </button>
                </div>

                <div className="hidden xl:block">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className="flex w-full items-center justify-between border-b border-[#efe4de] px-5 py-4 text-left text-[15px] font-medium text-[#2f2f35] transition hover:bg-[#fff8f3] hover:text-[#c32c30]"
                    >
                      <span>{category}</span>
                      <ChevronRight className="h-4 w-4 text-[#2f2f35]/40" />
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 overflow-x-auto px-4 py-4 xl:hidden">
                  {categories.map((category) => (
                    <button
                      key={`${category}-mobile`}
                      className="whitespace-nowrap rounded-full border border-[#ebd7cf] bg-[#fff8f3] px-4 py-2 text-sm font-medium text-[#2f2f35] transition hover:border-[#c32c30] hover:text-[#c32c30]"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="space-y-5">
                <div className="flex flex-col gap-3 rounded-[1.4rem] border border-[#ecd9d1] bg-[#f7f3f0] px-5 py-4 shadow-[0_18px_46px_-38px_rgba(15,23,42,0.2)] sm:flex-row sm:items-center">
                  <button className="inline-flex items-center gap-2 px-0 text-[15px] font-semibold text-[#2f2f35] transition hover:text-[#c32c30]">
                    <Flame className="h-5 w-5 text-[#f26522]" />
                    Campaigns
                  </button>
                  <button className="inline-flex items-center gap-2 px-0 text-[15px] font-semibold text-[#2f2f35] transition hover:text-[#c32c30]">
                    <Gift className="h-5 w-5 text-[#c32c30]" />
                    Request Product
                  </button>
                </div>

                <div className="overflow-hidden rounded-[1.8rem] border border-[#ecd9d1] bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.26)]">
                  <div className="grid min-h-[420px] gap-8 bg-[linear-gradient(135deg,#f36a28_0%,#f4722b_30%,#fff7f1_30%,#fff9f5_100%)] px-6 py-8 lg:grid-cols-[1.25fr_0.95fr] lg:px-10 lg:py-10">
                    <div className="order-2 flex flex-col justify-center lg:order-1">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#c32c30] shadow-sm ring-1 ring-white/70">
                        <Sparkles className="h-4 w-4" />
                        Cross-border shopping made simple
                      </div>

                      <h1 className="max-w-xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.7rem]">
                        Pay in BDT.
                        <span className="block text-[#3f3f46]">Shop the world.</span>
                      </h1>

                      <p className="mt-5 max-w-xl text-base leading-7 text-white/90 lg:text-lg">
                        Order global products with local confidence. FutureBD handles sourcing, delivery, and support in one responsive marketplace experience.
                      </p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center rounded-xl border-0 bg-white px-6 py-3 text-[15px] font-semibold text-[#c32c30] shadow-lg transition hover:bg-white/90"
                        >
                          Start Shopping
                        </Link>
                        <a
                          href="#highlights"
                          className="inline-flex items-center rounded-xl border border-white/70 bg-transparent px-6 py-3 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#c32c30]"
                        >
                          Browse Deals
                        </a>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white/16 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
                          <div className="text-2xl font-bold text-white">25d</div>
                          <div className="text-sm text-white/80">Typical delivery window</div>
                        </div>
                        <div className="rounded-2xl bg-white/16 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
                          <div className="text-2xl font-bold text-white">BDT</div>
                          <div className="text-sm text-white/80">Local currency checkout</div>
                        </div>
                        <div className="rounded-2xl bg-white/16 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15">
                          <div className="text-2xl font-bold text-white">24/7</div>
                          <div className="text-sm text-white/80">Support coverage</div>
                        </div>
                      </div>
                    </div>

                    <div className="order-1 flex items-center justify-center lg:order-2">
                      <div className="relative w-full max-w-[460px]">
                        <div className="absolute inset-x-8 top-3 h-[88%] rounded-[2rem] bg-[#f26a28]/35 blur-3xl" />

                        <div className="relative mx-auto flex w-[280px] items-center justify-center rounded-[2.8rem] border-[10px] border-[#2f2f35] bg-[#fff7f2] p-4 shadow-[0_36px_80px_-38px_rgba(15,23,42,0.45)] sm:w-[320px]">
                          <div className="w-full overflow-hidden rounded-[2rem] bg-white shadow-inner">
                            <div className="flex items-center justify-between bg-gradient-to-r from-[#c32c30] to-[#f26522] px-4 py-3 text-white">
                              <div>
                                <div className="text-xl font-black">Ali2BD</div>
                                <div className="text-[11px] text-white/80">Get global products at the best prices</div>
                              </div>
                              <Smartphone className="h-7 w-7" />
                            </div>

                            <div className="space-y-4 p-4">
                              <div className="rounded-2xl bg-[#fff7f1] p-4">
                                <div className="text-sm font-semibold text-[#2f2f35]">Search product or paste a link</div>
                                <div className="mt-2 h-10 rounded-xl border border-[#f0ddd5] bg-white" />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-[#fff7f1] p-3">
                                  <div className="h-20 rounded-xl bg-gradient-to-br from-[#f9d5bf] to-[#ffe9db]" />
                                  <div className="mt-3 text-sm font-semibold text-[#2f2f35]">Sneakers</div>
                                </div>
                                <div className="rounded-2xl bg-[#fff7f1] p-3">
                                  <div className="h-20 rounded-xl bg-gradient-to-br from-[#f7d0d2] to-[#fdeff0]" />
                                  <div className="mt-3 text-sm font-semibold text-[#2f2f35]">Headphones</div>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#f0ddd5] p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-[#2f2f35]">Local checkout</div>
                                    <div className="text-xs text-[#2f2f35]/60">Pay in BDT with verified support</div>
                                  </div>
                                  <div className="rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-semibold text-[#c32c30]">Secure</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="absolute left-0 top-10 rounded-[1.4rem] border border-[#ffd8c2] bg-white/95 px-4 py-3 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c32c30]">Top Pick</div>
                          <div className="mt-1 text-sm font-semibold text-[#2f2f35]">Fashion & gadgets</div>
                        </div>

                        <div className="absolute -right-1 top-24 rounded-[1.4rem] border border-[#ffd8c2] bg-white/95 px-4 py-3 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c32c30]">Fast lane</div>
                          <div className="mt-1 text-sm font-semibold text-[#2f2f35]">Request any product</div>
                        </div>

                        <div className="absolute bottom-4 left-4 rounded-[1.4rem] border border-[#ffd8c2] bg-white/95 px-4 py-3 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)]">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c32c30]">Live price</div>
                          <div className="mt-1 text-sm font-semibold text-[#2f2f35]">Converted to BDT instantly</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="highlights" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {highlights.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-[1.4rem] border border-[#ead8d0] bg-[#f6f2ef] px-6 py-6 text-center shadow-[0_20px_45px_-40px_rgba(15,23,42,0.25)]"
                    >
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#c32c30]/10 text-[#c32c30]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#2f2f35]">{item.title}</h3>
                      <p className="mt-3 text-[15px] leading-7 text-[#2f2f35]/65">{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-10 px-4 pb-6 text-[#2f2f35] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[1.8rem] border border-[#ead9d2] bg-white shadow-[0_24px_60px_-44px_rgba(15,23,42,0.28)]">
              <div className="grid gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-5 lg:px-10">
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <BrandLogo />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c32c30]">Smart Shopping With BDT</p>
                      <p className="mt-4 max-w-md text-sm leading-6 text-[#2f2f35]/70">
                        The platform to get products from global marketplaces to Bangladesh. You can pay product price in Bangladeshi Taka (BDT).
                      </p>

                      <div className="mt-5 space-y-3 text-sm text-[#2f2f35]/80">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]">
                            <MapPin className="h-4 w-4" />
                          </span>
                          <div>
                            <div className="italic">Plot 1020, Road 9, Avenue 9,</div>
                            <div className="italic">Mirpur DOHS, Dhaka, Bangladesh.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#a12863]/10 text-[#a12863]">
                            <Phone className="h-4 w-4" />
                          </span>
                          <div>+88 09666 78 3333 (10am - 6pm)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2f2f35]/60">Company</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="transition hover:text-[#c32c30]">About Us</a></li>
                    <li><a href="#" className="transition hover:text-[#c32c30]">About MoveOn - Ship For Me</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2f2f35]/60">Support</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="transition hover:text-[#c32c30]">Help Center</a></li>
                    <li><a href="#" className="transition hover:text-[#c32c30]">Terms and Conditions</a></li>
                    <li><a href="#" className="transition hover:text-[#c32c30]">Privacy Policy</a></li>
                    <li><a href="#" className="transition hover:text-[#c32c30]">Refund Policy</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2f2f35]/60">Follow Us</h4>
                  <div className="mb-5 flex items-center gap-2">
                    <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1877f2] text-sm font-bold text-white transition hover:bg-[#0f62d6]">f</a>
                    <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ff0033] text-sm font-bold text-white transition hover:bg-[#dc002c]">▶</a>
                    <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1d9bf0] text-sm font-bold text-white transition hover:bg-[#0f83d3]">t</a>
                  </div>

                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2f2f35]/60">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                    {["bKash", "Rocket", "VISA", "Master"].map((item) => (
                      <div key={item} className="rounded-2xl border border-[#ece1db] bg-white px-3 py-3 text-center text-xs font-semibold shadow-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#ede2db] bg-[#fcfaf8] px-6 py-5 text-center text-sm text-[#2f2f35]/60 lg:px-10">
                © 2018-2025 FutureBD. All rights reserved.
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6">
            <a
              href="https://wa.me/8801335989463"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/25 transition hover:-translate-y-1 hover:bg-green-600"
              aria-label="Chat on WhatsApp"
            >
              <span className="text-xl font-black">W</span>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
