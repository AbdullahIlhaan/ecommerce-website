import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Order, Customer } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Eye, ShoppingCart, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { orders, customers } = usePage<{ orders: Order[]; customers: Customer[] }>().props;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editStatusOrder, setEditStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Unknown";

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = o.id.includes(search) || getCustomerName(o.customerId).toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter, customers]);

  const handleExportPDF = () => {
    const content = orders.map(o => `Order #${o.id.slice(0,6).toUpperCase()} | ${getCustomerName(o.customerId)} | $${o.total.toFixed(2)} | ${o.status}`).join('\n');
    const blob = new Blob([`ORDERS REPORT\n${'='.repeat(60)}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders-report.txt'; a.click();
    toast({ title: "Report exported" });
  };

  const handleUpdateStatus = () => {
    if (!editStatusOrder) return;

    router.put(`/orders/${editStatusOrder.id}`, {
      status: newStatus,
      paymentStatus: newPaymentStatus,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Order updated" });
        setEditStatusOrder(null);
      },
    });
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
            <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
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
          <Table>
            <TableHeader><TableRow>
              <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead>
              <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs font-medium">#{o.id.slice(0,6).toUpperCase()}</TableCell>
                  <TableCell>{getCustomerName(o.customerId)}</TableCell>
                  <TableCell>{o.items.length}</TableCell>
                  <TableCell className="font-semibold">${o.total.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewOrder(o)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setEditStatusOrder(o); setNewStatus(o.status); setNewPaymentStatus(o.paymentStatus); }}>Update</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      {/* View Order */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order #{viewOrder?.id.slice(0,6).toUpperCase()}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{getCustomerName(viewOrder.customerId)}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{viewOrder.createdAt}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={viewOrder.status} /></div>
                <div><span className="text-muted-foreground">Payment:</span> <StatusBadge status={viewOrder.paymentStatus} /></div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {viewOrder.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right space-y-1 text-sm">
                <div>Subtotal: <span className="font-medium">${viewOrder.subtotal.toFixed(2)}</span></div>
                <div>Tax: <span className="font-medium">${viewOrder.tax.toFixed(2)}</span></div>
                <div className="text-base font-bold">Total: ${viewOrder.total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status */}
      <Dialog open={!!editStatusOrder} onOpenChange={() => setEditStatusOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Order Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pending','processing','shipped','delivered','cancelled'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['pending','paid','refunded','failed'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStatusOrder(null)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
