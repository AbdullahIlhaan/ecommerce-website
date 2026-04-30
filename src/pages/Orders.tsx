import { useCallback, useMemo, useState } from "react";
import { router, usePage, Link } from "@inertiajs/react";
import { Order, Customer } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, ShoppingCart, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatPaymentMethod } from "@/lib/payments";

export default function OrdersPage() {
  const { orders, customers } = usePage<{ orders: Order[]; customers: Customer[] }>().props;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const getCustomerName = useCallback((id: string) => customers.find(c => c.id === id)?.name || "Unknown", [customers]);
  const getInvoiceNumber = useCallback(
    (order: Order) => order.invoiceNumber || `INV-${order.id.slice(0, 8).toUpperCase()}`,
    [],
  );
  const getOrderReference = useCallback((order: Order) => `#${order.id.slice(0, 8).toUpperCase()}`, []);

  const filtered = useMemo(() => orders.filter(o => {
    const searchTerm = search.toLowerCase();
    const matchSearch =
      o.id.toLowerCase().includes(searchTerm) ||
      getInvoiceNumber(o).toLowerCase().includes(searchTerm) ||
      getCustomerName(o.customerId).toLowerCase().includes(searchTerm);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter, getCustomerName, getInvoiceNumber]);

  const handleExportPDF = () => {
    const content = orders.map(
      (o) =>
        `${getInvoiceNumber(o)} | ${getOrderReference(o)} | ${getCustomerName(o.customerId)} | BDT ${o.total.toFixed(2)} | ${o.status} | ${formatPaymentMethod(o.paymentMethod)} | ${o.paymentStatus}`,
    ).join('\n');
    const blob = new Blob([`ORDERS REPORT\n${'='.repeat(60)}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders-report.txt'; a.click();
    toast({ title: "Report exported" });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Orders" description="Track and manage orders">
        <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
          <FileText className="h-4 w-4" /> Export
        </Button>
      </PageHeader>
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by order ref, invoice ID, or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No orders" description="Orders will appear here" icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />} />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filtered.map((o) => (
                <article key={o.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="font-mono text-sm font-medium">{getInvoiceNumber(o)}</div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{getOrderReference(o)}</div>
                      <div className="text-sm text-muted-foreground">{getCustomerName(o.customerId)} • {o.items.length} items</div>
                      <div className="font-semibold">BDT {o.total.toFixed(2)}</div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={o.status} />
                        <StatusBadge status={o.paymentStatus} />
                        {o.hasOpenReturnRequest && <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">Return Open</span>}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">{formatPaymentMethod(o.paymentMethod)}</div>
                      {(o.shippingCarrier || o.trackingNumber) && (
                        <div className="text-xs text-muted-foreground">
                          {o.shippingCarrier || "Shipment"} {o.trackingNumber ? `• ${o.trackingNumber}` : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewOrder(o)}><Eye className="h-4 w-4" /></Button>
                      <Link href={o.invoiceUrl || `/orders/${o.id}/invoice`} target="_blank">
                        <Button variant="ghost" size="icon" className="text-primary"><FileText className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => router.get(`/orders/${o.id}/edit`)}>Update</Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead>
                  <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(o => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div className="font-mono text-xs font-medium">{getInvoiceNumber(o)}</div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{getOrderReference(o)}</div>
                      </TableCell>
                      <TableCell>{getCustomerName(o.customerId)}</TableCell>
                      <TableCell>{o.items.length}</TableCell>
                      <TableCell className="font-semibold">BDT {o.total.toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={o.paymentStatus} />
                          <div className="text-xs text-muted-foreground">{formatPaymentMethod(o.paymentMethod)}</div>
                          {o.hasOpenReturnRequest && <div className="text-xs font-medium text-rose-600">Return request open</div>}
                          {(o.shippingCarrier || o.trackingNumber) && (
                            <div className="text-xs text-muted-foreground">
                              {o.shippingCarrier || "Shipment"} {o.trackingNumber ? `• ${o.trackingNumber}` : ""}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View Details" onClick={() => setViewOrder(o)}><Eye className="h-4 w-4" /></Button>
                          <Link href={o.invoiceUrl || `/orders/${o.id}/invoice`} target="_blank">
                            <Button variant="ghost" size="icon" title="View Invoice" className="text-primary"><FileText className="h-4 w-4" /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.get(`/orders/${o.id}/edit`)}>Update</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent></Card>

      {/* View Order */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-h-[94svh] overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
            <DialogTitle>{viewOrder ? `${getInvoiceNumber(viewOrder)} (${getOrderReference(viewOrder)})` : "Order"}</DialogTitle>
            <DialogDescription>
              Review line items, totals, customer info, and payment summary for this order.
            </DialogDescription>
          </DialogHeader>
          {viewOrder && (
            <div className="overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-4 pb-1">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{getCustomerName(viewOrder.customerId)}</span></div>
                <div><span className="text-muted-foreground">Order Ref:</span> <span className="font-medium">{getOrderReference(viewOrder)}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{viewOrder.createdAt}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={viewOrder.status} /></div>
                <div><span className="text-muted-foreground">Payment:</span> <StatusBadge status={viewOrder.paymentStatus} /></div>
                <div><span className="text-muted-foreground">Method:</span> <span className="font-medium">{formatPaymentMethod(viewOrder.paymentMethod)}</span></div>
                <div><span className="text-muted-foreground">Carrier:</span> <span className="font-medium">{viewOrder.shippingCarrier || "-"}</span></div>
                <div><span className="text-muted-foreground">Tracking:</span> <span className="font-medium">{viewOrder.trackingNumber || "-"}</span></div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {viewOrder.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">BDT {item.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right space-y-1 text-sm">
                <div>Subtotal: <span className="font-medium">BDT {viewOrder.subtotal.toFixed(2)}</span></div>
                <div>Tax: <span className="font-medium">BDT {viewOrder.tax.toFixed(2)}</span></div>
                <div className="text-base font-bold">Total: BDT {viewOrder.total.toFixed(2)}</div>
              </div>
              {(viewOrder.internalNotes || viewOrder.estimatedDeliveryAt || viewOrder.shippedAt || viewOrder.deliveredAt) && (
                <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4 text-sm">
                  {viewOrder.estimatedDeliveryAt && <div><span className="text-muted-foreground">Estimated Delivery:</span> <span className="font-medium">{viewOrder.estimatedDeliveryAt}</span></div>}
                  {viewOrder.shippedAt && <div><span className="text-muted-foreground">Shipped At:</span> <span className="font-medium">{viewOrder.shippedAt}</span></div>}
                  {viewOrder.deliveredAt && <div><span className="text-muted-foreground">Delivered At:</span> <span className="font-medium">{viewOrder.deliveredAt}</span></div>}
                  {viewOrder.internalNotes && <div><span className="text-muted-foreground">Internal Notes:</span> <span className="font-medium">{viewOrder.internalNotes}</span></div>}
                </div>
              )}
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
