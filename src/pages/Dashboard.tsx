import { Link, usePage } from "@inertiajs/react";
import { Product, Order, Customer, Review, ReturnRequest, StockMovement } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Package, ShoppingCart, Users, DollarSign, TrendingUp,
  TrendingDown, Star, AlertCircle, RotateCcw, Truck, Boxes
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function Dashboard() {
  const { products, orders, customers, reviews, returnRequests, stockMovements } = usePage<{
    products: Product[];
    orders: Order[];
    customers: Customer[];
    reviews: Review[];
    returnRequests: ReturnRequest[];
    stockMovements: StockMovement[];
  }>().props;

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const totalOrdersValue = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock < 10).length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const pendingReturns = returnRequests.filter(r => r.status === 'pending').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
  const conversionRate = orders.length > 0 ? Math.round((paidOrders / orders.length) * 100) : 0;
  const recentLowStock = products.filter((p) => p.stock < 10).slice(0, 6);

  const stats = [
    { title: "Collected Revenue", value: `BDT ${totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: DollarSign, change: `${paidOrders} paid orders`, up: true, color: "text-success" },
    { title: "Orders", value: orders.length.toString(), icon: ShoppingCart, change: `${pendingOrders} pending`, up: true, color: "text-info" },
    { title: "Products", value: products.length.toString(), icon: Package, change: `${lowStock} low stock`, up: false, color: "text-primary" },
    { title: "Customers", value: customers.length.toString(), icon: Users, change: `${pendingReturns} return requests`, up: true, color: "text-warning" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="Overview of your store performance" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/80 bg-card/90 transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className={`rounded-lg p-2 bg-muted ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.up ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-warning" />}
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Recent Orders
              <Link href="/orders" className="text-xs text-primary font-medium hover:underline">View all</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">#{order.id.slice(0, 6).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
                <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                <div>
                  <p className="text-sm font-medium">{lowStock} product(s) low on stock</p>
                  <p className="text-xs text-muted-foreground">Review inventory levels</p>
                </div>
              </div>
            )}
            {pendingOrders > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-info/30 bg-info/5 p-3">
                <ShoppingCart className="h-5 w-5 text-info shrink-0" />
                <div>
                  <p className="text-sm font-medium">{pendingOrders} order(s) awaiting processing</p>
                  <p className="text-xs text-muted-foreground">Process orders to avoid delays</p>
                </div>
              </div>
            )}
            {pendingReviews > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <Star className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">{pendingReviews} review(s) pending moderation</p>
                  <p className="text-xs text-muted-foreground">Approve or reject new reviews</p>
                </div>
              </div>
            )}
            {pendingReturns > 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-rose-300/40 bg-rose-50 p-3 dark:bg-rose-950/20">
                <RotateCcw className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{pendingReturns} return/refund request(s) waiting for review</p>
                  <p className="text-xs text-muted-foreground">Check returns before refunds or restocks are delayed</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Operations Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gross orders</div>
              <div className="mt-2 text-2xl font-black">BDT {totalOrdersValue.toLocaleString("en", { maximumFractionDigits: 0 })}</div>
              <div className="mt-1 text-xs text-muted-foreground">All order value regardless of payment state</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Truck className="h-3.5 w-3.5" /> Fulfillment
              </div>
              <div className="mt-2 text-2xl font-black">{shippedOrders + deliveredOrders}</div>
              <div className="mt-1 text-xs text-muted-foreground">{shippedOrders} shipped, {deliveredOrders} delivered</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment health</div>
              <div className="mt-2 text-2xl font-black">{conversionRate}%</div>
              <div className="mt-1 text-xs text-muted-foreground">Share of orders currently marked paid</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Boxes className="h-3.5 w-3.5" /> Inventory
              </div>
              <div className="mt-2 text-2xl font-black">{stockMovements.length}</div>
              <div className="mt-1 text-xs text-muted-foreground">Recent stock movement records available</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Low Stock Watchlist
              <Link href="/products" className="text-xs text-primary font-medium hover:underline">Open products</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLowStock.length === 0 ? (
              <div className="text-sm text-muted-foreground">No products are below the low stock threshold right now.</div>
            ) : recentLowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.sku}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${product.stock === 0 ? "text-destructive" : "text-warning"}`}>{product.stock}</div>
                  <div className="text-xs text-muted-foreground">units left</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Recent Stock Movements
              <span className="text-xs text-muted-foreground">Sales, returns, and manual adjustments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stockMovements.length === 0 ? (
              <div className="text-sm text-muted-foreground">Stock movement logs will appear here once orders, returns, or manual adjustments happen.</div>
            ) : stockMovements.slice(0, 6).map((movement) => (
              <div key={movement.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div>
                  <div className="font-medium">{movement.productName || "Product"}</div>
                  <div className="text-xs text-muted-foreground">{movement.type.replace(/_/g, " ")} • {movement.reference || movement.productSku || "-"}</div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${movement.quantityChange < 0 ? "text-destructive" : "text-success"}`}>
                    {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange}
                  </div>
                  <div className="text-xs text-muted-foreground">{movement.stockBefore} → {movement.stockAfter}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              Return Pipeline
              <Link href="/return-requests" className="text-xs text-primary font-medium hover:underline">Open returns</Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {returnRequests.length === 0 ? (
              <div className="text-sm text-muted-foreground">No return or refund requests have been submitted yet.</div>
            ) : returnRequests.slice(0, 6).map((request) => (
              <div key={request.id} className="flex items-start justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div className="space-y-1">
                  <div className="font-medium">{request.orderReference || request.orderId}</div>
                  <div className="text-xs capitalize text-muted-foreground">{request.type} • {request.customerName || "Customer"}</div>
                  <div className="text-sm text-muted-foreground">{request.reason}</div>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
