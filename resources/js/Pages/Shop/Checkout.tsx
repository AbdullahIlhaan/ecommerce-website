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
import { useEffect, useState, useRef, useMemo } from "react";
import { Link, router, usePage, Head } from "@inertiajs/react";
import { formatPaymentMethod } from "@/lib/payments";
import { resolveEffectivePrice } from "@/lib/pricing";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet when using Vite/React
// @ts-expect-error Leaflet keeps this internal method on the prototype at runtime.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapPicker({ lat, lon, onLocationChange }: { lat: string, lon: string, onLocationChange: (lat: string, lon: string) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [parseFloat(lat), parseFloat(lon)],
        zoom: 16,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(leafletMap.current);

      marker.current = L.marker([parseFloat(lat), parseFloat(lon)], { draggable: true }).addTo(leafletMap.current);

      marker.current.on('dragend', (e) => {
        const target = e.target;
        const position = target.getLatLng();
        onLocationChange(String(position.lat), String(position.lng));
      });
      
      leafletMap.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.current?.setLatLng([lat, lng]);
        onLocationChange(String(lat), String(lng));
      });
    } else {
      const newPos = [parseFloat(lat), parseFloat(lon)] as L.LatLngExpression;
      if (leafletMap.current.getCenter().lat !== parseFloat(lat) || leafletMap.current.getCenter().lng !== parseFloat(lon)) {
        leafletMap.current.setView(newPos);
      }
      marker.current?.setLatLng(newPos);
    }
  }, [lat, lon]);

  return <div ref={mapRef} className="h-64 w-full rounded-2xl border border-border bg-muted shadow-inner overflow-hidden z-0" />;
}

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

type CheckoutPageProps = {
  auth: {
    user?: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
  };
  errors: Record<string, string>;
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
  const { items, subtotal, clearCart, itemCount, isLoaded, syncCart } = useCart();
  const { auth, errors } = usePage<CheckoutPageProps>().props;
  const [loading, setLoading] = useState(false);
  const [syncingCart, setSyncingCart] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: auth?.user?.name || "",
    email: auth?.user?.email || "",
    phone: auth?.user?.phone || "",
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
  const hasPinnedLocation = Boolean(formData.deliveryLocationLabel && formData.deliveryLatitude && formData.deliveryLongitude);
  const hasDeliveryZone = Boolean(formData.deliveryZone);
  const canPlaceOrder = items.length > 0 && hasDeliveryZone;
  const checkoutError = errors.items || errors.total || errors.deliveryCharge;
  const cartIdsKey = useMemo(() => items.map((item) => item.id).sort().join("|"), [items]);

  useEffect(() => {
    if (!isLoaded || items.length === 0) {
      return;
    }

    const params = new URLSearchParams();
    items.forEach((item) => params.append("ids[]", item.id));

    const controller = new AbortController();

    const syncCheckoutCart = async () => {
      setSyncingCart(true);

      try {
        const response = await fetch(`/checkout/cart-items?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Cart refresh failed with status ${response.status}`);
        }

        const data = await response.json() as {
          items?: Array<{
            id: string;
            name: string;
            price: number;
            salePrice?: number | null;
            image: string;
            stock: number;
          }>;
        };

        syncCart(data.items ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to sync checkout cart", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSyncingCart(false);
        }
      }
    };

    void syncCheckoutCart();

    return () => controller.abort();
  }, [cartIdsKey, isLoaded, syncCart]);

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
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) throw new Error(`Search failed`);
        const data = await response.json();
        setLocationSuggestions(data.map(normalizeLocationResult));
      } catch (error) {
        if (!controller.signal.aborted) {
          setLocationSuggestions([]);
          setLocationError("Unable to search map locations right now.");
        }
      } finally {
        if (!controller.signal.aborted) setLocationLoading(false);
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

  const handleMapLocationChange = async (lat: string, lon: string) => {
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) throw new Error("Failed to reverse geocode");
      const result = await response.json();
      applySelectedLocation(normalizeLocationResult(result));
    } catch (e) {
      setFormData(curr => ({ ...curr, deliveryLatitude: lat, deliveryLongitude: lon }));
    } finally {
      setLocationLoading(false);
    }
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
            { headers: { Accept: "application/json" } }
          );
          if (!response.ok) throw new Error("Reverse geocoding failed");
          const result = await response.json();
          const normalized = normalizeLocationResult(result);
          applySelectedLocation(normalized);
        } catch (error) {
          setLocationError("Address could not be resolved.");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        setLocationError(error.code === error.PERMISSION_DENIED ? "Location permission denied." : "Unable to get location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPlaceOrder || syncingCart) return;
    setLoading(true);
    router.post("/checkout", {
      ...formData,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: resolveEffectivePrice(item.price, item.salePrice),
      })),
      subtotal,
      deliveryCharge,
      total,
    }, {
      onSuccess: () => { clearCart(); setLoading(false); },
      onError: () => setLoading(false),
      preserveScroll: true,
    });
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
            <p className="text-muted-foreground">Add some items to proceed to checkout.</p>
          </div>
          <Link href="/shop"><Button size="lg" className="rounded-2xl px-10">Return to Shop</Button></Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout title="Checkout">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/shop" className="mb-2 flex items-center gap-1 text-sm font-bold text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
          <h1 className="text-4xl font-black tracking-tight">Checkout</h1>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
          <span className="text-primary">Shipping</span> <ChevronRight className="h-3 w-3" />
          <span>Payment</span> <ChevronRight className="h-3 w-3" />
          <span>Confirmation</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Truck className="h-5 w-5" /></div>
              <div>
                <h2 className="text-2xl font-black">Shipping Details</h2>
                <p className="text-sm text-muted-foreground">Use the map to pin your exact location for faster delivery.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">Full Name</Label>
                <Input id="name" required placeholder="Type your name" className="h-12 rounded-xl border-border bg-muted/20" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Phone Number</Label>
                <Input id="phone" required placeholder="01XXXXXXXXX" className="h-12 rounded-xl border-border bg-muted/20" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">Email Address</Label>
                <Input id="email" type="email" required placeholder="hello@example.com" className="h-12 rounded-xl border-border bg-muted/20" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="location-search" className="text-xs font-bold uppercase tracking-widest">Delivery Map Pin</Label>
                  <Button type="button" variant="outline" className="h-9 rounded-full px-4 text-xs font-bold" onClick={handleUseCurrentLocation}>
                    {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />} Use Current Location
                  </Button>
                </div>

                <div className="relative">
                  <Input id="location-search" placeholder="Search your area/landmark" className="h-12 rounded-xl border-border bg-muted/20 pr-12" value={locationQuery} onChange={(e) => { setLocationQuery(e.target.value); setFormData({ ...formData, deliveryLocationLabel: "", deliveryLatitude: "", deliveryLongitude: "" }); }} />
                  <MapPin className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>

                {locationSuggestions.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                    {locationSuggestions.map((location) => (
                      <button key={`${location.latitude}-${location.longitude}`} type="button" className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-muted/40 last:border-b-0" onClick={() => applySelectedLocation(location)}>
                        <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div><div className="font-semibold text-foreground">{location.city || "Selected location"}</div><div className="text-xs text-muted-foreground">{location.label}</div></div>
                      </button>
                    ))}
                  </div>
                )}

                {formData.deliveryLocationLabel && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold uppercase tracking-widest text-primary/70">Pinned Point</div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold" onClick={() => setFormData({ ...formData, deliveryLocationLabel: "", deliveryLatitude: "", deliveryLongitude: "" })}>Clear Pin</Button>
                      </div>
                      <div className="font-semibold text-foreground leading-tight">{formData.deliveryLocationLabel}</div>
                      <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                        <span className="flex h-5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-bold text-primary">{formData.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}</span>
                        <span>{formData.city}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-tight">Fine-tune your location (Drag the pin)</div>
                      <MapPicker lat={formData.deliveryLatitude} lon={formData.deliveryLongitude} onLocationChange={handleMapLocationChange} />
                    </div>
                  </div>
                )}

                {locationError && <p className="text-xs font-medium text-destructive">{locationError}</p>}
                {errors.deliveryLocationLabel && <p className="text-xs font-medium text-destructive">{errors.deliveryLocationLabel}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">Custom/Full Address (Optional if mapped)</Label>
                <Input id="address" placeholder="House, road, area, landmark" className="h-12 rounded-xl border-border bg-muted/20" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                {errors.address && <p className="text-xs font-medium text-destructive">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest">City / District</Label>
                <Input id="city" required placeholder="Dhaka" className="h-12 rounded-xl border-border bg-muted/20" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                {errors.city && <p className="text-xs font-medium text-destructive">{errors.city}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest">Delivery Type</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([ { value: "inside_dhaka", title: "Inside Dhaka", amount: 100 }, { value: "outside_dhaka", title: "Outside Dhaka", amount: 170 } ] as const).map((option) => (
                    <button key={option.value} type="button" onClick={() => setFormData({ ...formData, deliveryZone: option.value })} className={`rounded-2xl border-2 p-4 text-left transition ${formData.deliveryZone === option.value ? "border-primary bg-primary/5 shadow-md" : "border-border bg-muted/20 hover:border-primary/40"}`}>
                      <div className="text-sm font-bold">{option.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Charge: BDT {option.amount}</div>
                    </button>
                  ))}
                </div>
                {errors.deliveryZone && <p className="text-xs font-medium text-destructive">{errors.deliveryZone}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CreditCard className="h-5 w-5" /></div><h2 className="text-2xl font-black">Payment</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: "cod" })} className={`flex items-center gap-4 rounded-2xl border-2 p-6 transition-all ${formData.paymentMethod === "cod" ? "border-primary bg-primary/5 shadow-md" : "border-border bg-muted/20 hover:border-primary/40"}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${formData.paymentMethod === "cod" ? "border-primary bg-primary" : "border-muted-foreground"}`}>{formData.paymentMethod === "cod" && <div className="h-2 w-2 rounded-full bg-white" />}</div>
                <div className="text-left"><div className="font-bold text-sm">Cash on Delivery</div><div className="text-[10px] text-muted-foreground">Pay when you receive</div></div>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: "online" })} className={`flex items-center gap-4 rounded-2xl border-2 p-6 transition-all ${formData.paymentMethod === "online" ? "border-primary bg-primary/5 shadow-md" : "border-border bg-muted/20 hover:border-primary/40"}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${formData.paymentMethod === "online" ? "border-primary bg-primary" : "border-muted-foreground"}`}>{formData.paymentMethod === "online" && <div className="h-2 w-2 rounded-full bg-white" />}</div>
                <div className="text-left"><div className="font-bold text-sm">Online Payment</div><div className="text-[10px] text-muted-foreground">bKash, Cards etc.</div></div>
              </button>
            </div>
            {errors.paymentMethod && <p className="text-xs font-medium text-destructive">{errors.paymentMethod}</p>}
          </section>
        </div>

        <div className="space-y-6">
          <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
            <h3 className="mb-6 text-xl font-bold">Summary</h3>
            <div className="mb-6 space-y-4">
              <div className="max-h-60 overflow-y-auto pr-2 space-y-4">{items.map((item) => ( <div key={item.id} className="flex gap-3"><img src={item.image} className="h-12 w-10 rounded-lg border border-border object-cover" /><div className="flex-1"><div className="line-clamp-1 text-xs font-bold">{item.name}</div><div className="text-[10px] text-muted-foreground">{item.quantity} x BDT {resolveEffectivePrice(item.price, item.salePrice).toLocaleString()}</div></div></div> ))}</div>
              <Separator />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">BDT {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className="font-bold">BDT {deliveryCharge.toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between text-xl font-black"><span>Total</span><span className="text-primary">BDT {total.toLocaleString()}</span></div>
            </div>
            {checkoutError && (
              <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {checkoutError}
              </div>
            )}
            <Button disabled={loading || syncingCart || !canPlaceOrder} type="submit" className="h-14 w-full rounded-2xl bg-primary text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">{loading ? "Processing..." : syncingCart ? "Updating Cart..." : "Place Order"}<Lock className="ml-2 h-4 w-4" /></Button>
            <div className="mt-6 space-y-3"><div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Checkout</div></div>
          </div>
        </div>
      </form>
    </StorefrontLayout>
  );
}
