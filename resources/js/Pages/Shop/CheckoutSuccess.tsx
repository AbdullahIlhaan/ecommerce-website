import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  Share2,
  FileText
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { formatPaymentMethod } from "@/lib/payments";

type CheckoutSuccessOrder = {
  paymentMethod: string;
  paymentStatus: string;
};

export default function CheckoutSuccess({ orderId, order }: { orderId?: string; order?: CheckoutSuccessOrder | null }) {
  const displayOrderNumber = orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : "FBD-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <StorefrontLayout title="Order Confirmed">
      <div className="flex flex-col items-center justify-center py-12 md:py-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-success/20" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-success text-white shadow-xl shadow-success/30">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        <div className="mb-10 space-y-3 text-center px-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">Thank you for your purchase. Your order has been placed successfully and is now being processed.</p>
        </div>

        <div className="grid w-full max-w-3xl gap-6 px-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
             <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
             </div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order ID</h3>
             <p className="mt-1 text-2xl font-black text-foreground">{displayOrderNumber}</p>
             <p className="mt-4 text-sm text-muted-foreground">Keep this order number handy and use the invoice download below whenever you need a copy.</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
             <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShoppingBag className="h-5 w-5" />
             </div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Next Steps</h3>
             <p className="mt-1 text-xl font-black text-foreground">Prepare for Delivery</p>
             <p className="mt-4 text-sm text-muted-foreground">Our team is preparing your package while payment remains pending until it is confirmed.</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
             <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
             </div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</h3>
             <p className="mt-1 text-xl font-black text-foreground">{formatPaymentMethod(order?.paymentMethod)}</p>
             <p className="mt-4 text-sm text-muted-foreground">
               Current status: <span className="font-semibold capitalize text-foreground">{order?.paymentStatus ?? "pending"}</span>.
             </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row px-4">
          <Link href="/shop">
            <Button size="lg" className="w-full sm:w-auto h-14 rounded-2xl px-8 bg-primary text-base font-bold shadow-lg shadow-primary/20 hover:bg-brand-hover transition-all">
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          {orderId && (
            <Link href={`/orders/${orderId}/invoice`} target="_blank">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 rounded-2xl px-8 border-border hover:bg-muted font-bold transition-all">
                Download Invoice
                <FileText className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="lg" className="w-full sm:w-auto h-14 rounded-2xl px-8 font-bold transition-all">
             Share Experience
             <Share2 className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-20 border-t border-border pt-10 text-center">
           <p className="text-sm font-bold text-muted-foreground">Need help? <Link href="#" className="text-primary underline">Contact Our Support</Link></p>
        </div>
      </div>
    </StorefrontLayout>
  );
}
