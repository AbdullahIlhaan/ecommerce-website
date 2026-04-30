import type { ReactNode } from "react";
import { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, FileText } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { formatPaymentMethod } from "@/lib/payments";
import type { Order } from "@/lib/store";

function OrdersEditPage() {
  const { order } = usePage<{ order: Order & { customer?: { name: string; email: string; phone: string } | null } }>().props;
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [shippingCarrier, setShippingCarrier] = useState(order.shippingCarrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [estimatedDeliveryAt, setEstimatedDeliveryAt] = useState(
    order.estimatedDeliveryAt ? order.estimatedDeliveryAt.replace(" ", "T").slice(0, 16) : "",
  );
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? "");

  const handleSubmit = () => {
    router.put(`/orders/${order.id}`, {
      status,
      paymentStatus,
      shippingCarrier: shippingCarrier.trim() || null,
      trackingNumber: trackingNumber.trim() || null,
      estimatedDeliveryAt: estimatedDeliveryAt || null,
      internalNotes: internalNotes.trim() || null,
    }, {
      onSuccess: () => toast({ title: "Order updated" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to update order", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={`Update ${order.invoiceNumber ?? order.id}`} />

      <div className="animate-fade-in">
        <PageHeader title={order.invoiceNumber ?? order.id} description="Review line items, totals, customer info, and payment summary for this order.">
          <Button variant="outline" onClick={() => router.get("/orders")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <Link href={order.invoiceUrl || `/orders/${order.id}/invoice`} target="_blank">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              View Invoice
            </Button>
          </Link>
        </PageHeader>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.9fr)]">
          <Card>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{order.customer?.name ?? "Unknown"}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{order.createdAt}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{order.customer?.email ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{order.customer?.phone ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={order.status} /></div>
                <div><span className="text-muted-foreground">Payment:</span> <StatusBadge status={order.paymentStatus} /></div>
                <div><span className="text-muted-foreground">Method:</span> <span className="font-medium">{formatPaymentMethod(order.paymentMethod)}</span></div>
                <div><span className="text-muted-foreground">Carrier:</span> <span className="font-medium">{order.shippingCarrier ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Tracking:</span> <span className="font-medium">{order.trackingNumber ?? "-"}</span></div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={`${item.productId}-${index}`}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">BDT {item.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-1 text-right text-sm">
                <div>Subtotal: <span className="font-medium">BDT {order.subtotal.toFixed(2)}</span></div>
                <div>Tax: <span className="font-medium">BDT {order.tax.toFixed(2)}</span></div>
                <div className="text-base font-bold">Total: BDT {order.total.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">Update Order Status</h2>
                <p className="mt-1 text-sm text-muted-foreground">Change fulfillment and payment states for the selected order.</p>
              </div>

              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "processing", "shipped", "delivered", "cancelled"].map((item) => (
                      <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "paid", "refunded", "failed"].map((item) => (
                      <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shipping Carrier</Label>
                <Input value={shippingCarrier} onChange={(event) => setShippingCarrier(event.target.value)} placeholder="Pathao, Sundarban, RedX..." />
              </div>

              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Tracking reference" />
              </div>

              <div className="space-y-2">
                <Label>Estimated Delivery</Label>
                <Input type="datetime-local" value={estimatedDeliveryAt} onChange={(event) => setEstimatedDeliveryAt(event.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea rows={4} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} placeholder="Delivery notes, packaging notes, or customer support follow-up." />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6">
                <Button variant="outline" onClick={() => router.get("/orders")}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Status</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

OrdersEditPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default OrdersEditPage;
