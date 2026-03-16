import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Navigation,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";

type DeliveryZone = "inside_dhaka" | "outside_dhaka" | "";

type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryZone: DeliveryZone;
  deliveryLocationLabel: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  paymentMethod: "cod" | "online";
};

type LocationSuggestion = {
  label: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  zone: Exclude<DeliveryZone, "">;
};

const DELIVERY_CHARGES: Record<Exclude<DeliveryZone, "">, number> = {
  inside_dhaka: 100,
  outside_dhaka: 170,
};

function deriveCity(address: Record<string, string | undefined>, displayName: string): string {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.state_district ||
    address.county ||
    address.state ||
    displayName.split(",")[0]?.trim() ||
    ""
  );
}

function deriveDeliveryZone(city: string, displayName: string): Exclude<DeliveryZone, ""> {
  return /dhaka/i.test(`${city} ${displayName}`) ? "inside_dhaka" : "outside_dhaka";
}

function normalizeLocationResult(result: {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
}): LocationSuggestion {
  const label = result.display_name;
  const city = deriveCity(result.address ?? {}, label);
  const zone = deriveDeliveryZone(city, label);

  return {
    label,
    address: label,
    city,
    latitude: result.lat,
    longitude: result.lon,
    zone,
  };
}

export default function Checkout() {
  const { items, subtotal, clearCart, itemCount } = useCart();
  const { errors } = usePage<{ errors: Record<string, string> }>().props;
  const [loading, setLoading] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    deliveryZone: "",
    deliveryLocationLabel: "",
    deliveryLatitude: "",
    deliveryLongitude: "",
    paymentMethod: "cod",
  });

  const deliveryCharge = formData.deliveryZone ? DELIVERY_CHARGES[formData.deliveryZone] : 0;
  const total = subtotal + deliveryCharge;
  const hasLocation = Boolean(formData.deliveryLocationLabel && formData.deliveryLatitude && formData.deliveryLongitude);
  const canPlaceOrder = items.length > 0 && hasLocation && Boolean(formData.deliveryZone) && !locationLoading;

  useEffect(() => {
    const query = locationQuery.trim();

    if (query.length < 3 || query === formData.deliveryLocationLabel) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setLocationLoading(true);
      setLocationError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=bd&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Location search failed with status ${response.status}`);
        }

        const data = (await response.json()) as Array<{
          display_name: string;
          lat: string;
          lon: string;
          address?: Record<string, string | undefined>;
        }>;

        setLocationSuggestions(data.map(normalizeLocationResult));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLocationSuggestions([]);
        setLocationError("Unable to search map locations right now.");
      } finally {
        if (!controller.signal.aborted) {
          setLocationLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [locationQuery, formData.deliveryLocationLabel]);

  const applySelectedLocation = (location: LocationSuggestion) => {
    setFormData((current) => ({
      ...current,
      address: current.address || location.address,
      city: location.city || current.city,
      deliveryZone: location.zone,
      deliveryLocationLabel: location.label,
      deliveryLatitude: location.latitude,
      deliveryLongitude: location.longitude,
    }));
    setLocationQuery(location.label);
    setLocationSuggestions([]);
    setLocationError(null);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("This device does not support current location.");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${coords.latitude}&lon=${coords.longitude}`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Reverse geocoding failed with status ${response.status}`);
          }

          const result = (await response.json()) as {
            display_name: string;
            lat: string;
            lon: string;
            address?: Record<string, string | undefined>;
          };

          applySelectedLocation(normalizeLocationResult(result));
        } catch (error) {
          setLocationError("Current location was found, but the address could not be resolved.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Location permission was denied.");
          return;
        }

        setLocationError("Unable to get your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canPlaceOrder) {
      return;
    }

    setLoading(true);

    router.post(
      "/checkout",
      {
        ...formData,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.salePrice ?? item.price,
        })),
        subtotal,
        deliveryCharge,
        total,
      },
      {
        onSuccess: () => {
          clearCart();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
        preserveScroll: true,
      },
    );
  };

  if (itemCount === 0 && !loading) {
    return (
      <StorefrontLayout title="Checkout">
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center">
          <div className="rounded-full bg-muted p-8">
            <PackageCheck className="h-16 w-16 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black">Your bag is empty</h1>
            <p className="text-muted-foreground">Add some items to your bag to proceed to checkout.</p>
          </div>
          <Link href="/shop">
            <Button size="lg" className="rounded-2xl px-10">Return to Shop</Button>
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout title="Checkout">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/shop" className="mb-2 flex items-center gap-1 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Checkout</h1>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
          <span className="text-primary">Shipping</span>
          <ChevronRight className="h-3 w-3" />
          <span>Payment</span>
          <ChevronRight className="h-3 w-3" />
          <span>Confirmation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Shipping Details</h2>
                <p className="text-sm text-muted-foreground">Order submission is blocked until a delivery location is selected.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="Type your name"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Phone Number</Label>
                <Input
                  id="phone"
                  required
                  placeholder="01XXXXXXXXX"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="hello@example.com"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="location-search" className="text-xs font-bold uppercase tracking-widest">Delivery Location</Label>
                  <Button type="button" variant="outline" className="h-9 rounded-full px-4 text-xs font-bold" onClick={handleUseCurrentLocation}>
                    {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                    Use Current Location
                  </Button>
                </div>

                <div className="relative">
                  <Input
                    id="location-search"
                    required
                    placeholder="Search a location in Bangladesh"
                    className="h-12 rounded-xl border-border bg-muted/20 pr-12"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setFormData({
                        ...formData,
                        deliveryLocationLabel: "",
                        deliveryLatitude: "",
                        deliveryLongitude: "",
                      });
                    }}
                  />
                  <MapPin className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {locationSuggestions.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                    {locationSuggestions.map((location) => (
                      <button
                        key={`${location.latitude}-${location.longitude}`}
                        type="button"
                        className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/40 last:border-b-0"
                        onClick={() => applySelectedLocation(location)}
                      >
                        <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <div className="font-semibold text-foreground">{location.city || "Selected location"}</div>
                          <div className="text-xs text-muted-foreground">{location.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {formData.deliveryLocationLabel && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-primary/70">Selected Delivery Point</div>
                    <div className="mt-1 font-semibold text-foreground">{formData.deliveryLocationLabel}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formData.city || "Unknown city"} · {formData.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                    </div>
                  </div>
                )}

                {locationError && <p className="text-xs font-medium text-destructive">{locationError}</p>}
                {errors.deliveryLocationLabel && <p className="text-xs font-medium text-destructive">{errors.deliveryLocationLabel}</p>}
                {errors.deliveryLatitude && <p className="text-xs font-medium text-destructive">{errors.deliveryLatitude}</p>}
                {errors.deliveryLongitude && <p className="text-xs font-medium text-destructive">{errors.deliveryLongitude}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">Full Address</Label>
                <Input
                  id="address"
                  required
                  placeholder="House, road, area, landmark"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                {errors.address && <p className="text-xs font-medium text-destructive">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest">City / District</Label>
                <Input
                  id="city"
                  required
                  placeholder="Dhaka"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                {errors.city && <p className="text-xs font-medium text-destructive">{errors.city}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest">Delivery Charge</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    {
                      value: "inside_dhaka",
                      title: "Inside Dhaka",
                      amount: DELIVERY_CHARGES.inside_dhaka,
                    },
                    {
                      value: "outside_dhaka",
                      title: "Outside Dhaka",
                      amount: DELIVERY_CHARGES.outside_dhaka,
                    },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryZone: option.value })}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        formData.deliveryZone === option.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border bg-muted/20 hover:border-primary/40"
                      }`}
                    >
                      <div className="text-sm font-bold">{option.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Delivery charge BDT {option.amount}</div>
                    </button>
                  ))}
                </div>
                {errors.deliveryZone && <p className="text-xs font-medium text-destructive">{errors.deliveryZone}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black">Payment Method</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                className={`flex items-center gap-4 rounded-2xl border-2 p-6 transition-all ${
                  formData.paymentMethod === "cod"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-muted/20 hover:border-primary/40"
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  formData.paymentMethod === "cod" ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {formData.paymentMethod === "cod" && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="text-left">
                  <div className="font-bold">Cash on Delivery</div>
                  <div className="text-xs text-muted-foreground">Pay when you receive</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: "online" })}
                className={`flex items-center gap-4 rounded-2xl border-2 p-6 transition-all ${
                  formData.paymentMethod === "online"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-muted/20 hover:border-primary/40"
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  formData.paymentMethod === "online" ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {formData.paymentMethod === "online" && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="text-left">
                  <div className="font-bold">Online Payment</div>
                  <div className="text-xs text-muted-foreground">bKash, VISA, Mastercard</div>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
            <h3 className="mb-6 text-xl font-bold">Order Summary</h3>

            <div className="mb-6 space-y-4">
              <div className="max-h-60 space-y-4 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} className="h-12 w-10 rounded-lg border border-border object-cover" />
                    <div className="flex-1">
                      <div className="line-clamp-1 text-xs font-bold">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground">{item.quantity} x BDT {(item.salePrice ?? item.price).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold">BDT {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-bold">BDT {deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="rounded-2xl bg-muted/30 px-4 py-3 text-sm">
                <div className="font-bold text-foreground">
                  {formData.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : formData.deliveryZone === "outside_dhaka" ? "Outside Dhaka" : "Choose a delivery area"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {hasLocation ? formData.deliveryLocationLabel : "Search a map location or use your device location to unlock checkout."}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span className="text-primary">BDT {total.toLocaleString()}</span>
              </div>
              {errors.total && <p className="text-xs font-medium text-destructive">{errors.total}</p>}
            </div>

            <Button
              disabled={loading || !canPlaceOrder}
              type="submit"
              className="h-14 w-full rounded-2xl bg-primary text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:bg-brand-hover active:scale-95"
            >
              {loading ? "Processing..." : canPlaceOrder ? "Place Order" : "Set Delivery Location"}
              {!loading && <Lock className="ml-2 h-4 w-4" />}
            </Button>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                Secure Checkout Guaranteed
              </div>
              <div className="text-xs text-muted-foreground">
                Delivery is fixed at BDT 100 inside Dhaka and BDT 170 outside Dhaka.
              </div>
            </div>
          </div>
        </div>
      </form>
    </StorefrontLayout>
  );
}
