import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  ArrowLeft,
  Lock,
  PackageCheck
} from "lucide-react";
import { useState } from "react";
import { Link, router } from "@inertiajs/react";

export default function Checkout() {
  const { items, subtotal, clearCart, itemCount } = useCart();
  const [loading, setLoading] = useState(false);
  
  const shipping = items.length > 0 ? 100 : 0; // Flat rate for demo
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Dhaka",
    paymentMethod: "cod"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setLoading(true);
    
    router.post('/checkout', {
      ...formData,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.salePrice ?? item.price
      })),
      subtotal,
      total,
    }, {
      onSuccess: () => {
        clearCart();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
      preserveScroll: true
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
          <Link href="/shop" className="mb-2 flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
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
          {/* Shipping Information */}
          <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black">Shipping Details</h2>
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
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest">Phone Number</Label>
                <Input 
                  id="phone" 
                  required 
                  placeholder="01XXXXXXXXX"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest">Full Address</Label>
                <Input 
                  id="address" 
                  required 
                  placeholder="Type your address"
                  className="h-12 rounded-xl border-border bg-muted/20"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
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
                onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                className={`flex items-center gap-4 rounded-2xl border-2 p-6 transition-all ${
                  formData.paymentMethod === 'cod' 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border bg-muted/20 hover:border-primary/40"
                }`}
              >
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.paymentMethod === 'cod' ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {formData.paymentMethod === 'cod' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="text-left">
                  <div className="font-bold">Cash on Delivery</div>
                  <div className="text-xs text-muted-foreground">Pay when you receive</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'online'})}
                className={`flex items-center gap-4 rounded-2xl border-2 p-6 transition-all ${
                  formData.paymentMethod === 'online' 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border bg-muted/20 hover:border-primary/40"
                }`}
              >
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.paymentMethod === 'online' ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {formData.paymentMethod === 'online' && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div className="text-left">
                  <div className="font-bold">Online Payment</div>
                  <div className="text-xs text-muted-foreground">bKash, VISA, Mastercard</div>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
            <h3 className="mb-6 text-xl font-bold">Order Summary</h3>
            
            <div className="mb-6 space-y-4">
              <div className="max-h-60 overflow-y-auto pr-2 space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} className="h-12 w-10 rounded-lg object-cover border border-border" />
                    <div className="flex-1">
                      <div className="text-xs font-bold line-clamp-1">{item.name}</div>
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
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-bold">BDT {shipping.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-black">
                <span>Total</span>
                <span className="text-primary">BDT {total.toLocaleString()}</span>
              </div>
            </div>

            <Button 
               disabled={loading}
               type="submit" 
               className="h-14 w-full rounded-2xl bg-primary text-lg font-bold shadow-lg shadow-primary/20 hover:bg-brand-hover active:scale-95 transition-all"
            >
              {loading ? "Processing..." : "Place Order"}
              {!loading && <Lock className="ml-2 h-4 w-4" />}
            </Button>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                Secure Checkout Guaranteed
              </div>
            </div>
          </div>
        </div>
      </form>
    </StorefrontLayout>
  );
}
