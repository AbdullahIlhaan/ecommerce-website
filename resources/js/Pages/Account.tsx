import type { ReactNode } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ShoppingBag, 
  User, 
  ShieldCheck, 
  ExternalLink, 
  FileText,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";
import type { AuthUser, Order } from "@/lib/store";

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const configs = {
    pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    processing: { label: 'Processing', icon: Package, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    shipped: { label: 'Shipped', icon: Truck, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    delivered: { label: 'Delivered', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex w-fit items-center gap-1.5 px-2 py-0.5 font-bold uppercase tracking-wider ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function Account() {
  const { auth, flash, orders } = usePage<{ 
    auth: { user: AuthUser }; 
    flash: { success?: string; error?: string };
    orders: any[];
  }>().props;
  
  const user = auth.user;
  const emailForm = useForm({});
  const phoneForm = useForm({
    code: "",
  });

  return (
    <>
      <Head title="Account" />

      <div className="space-y-8">
        {flash.success && (
          <div className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-6 py-4 text-sm font-semibold text-emerald-700 backdrop-blur-sm">
            {flash.success}
          </div>
        )}
        {flash.error && (
          <div className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-rose-200 bg-rose-50/50 px-6 py-4 text-sm font-semibold text-rose-700 backdrop-blur-sm">
            {flash.error}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">My Account</h1>
            <p className="mt-1 text-muted-foreground">Manage your orders, profile, and account security</p>
          </div>
          <div className="flex gap-3 text-sm">
             <Link href="/" className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-brand-hover active:scale-95">
               Continue Shopping
             </Link>
          </div>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1 sm:w-[400px]">
            <TabsTrigger value="orders" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="overflow-hidden border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-xl font-black">Order History</CardTitle>
                <CardDescription>Track your recent purchases and download invoices</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {(orders && orders.length > 0) ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-bold">Order ID</TableHead>
                          <TableHead className="font-bold">Date</TableHead>
                          <TableHead className="font-bold">Items</TableHead>
                          <TableHead className="font-bold">Total</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="group hover:bg-muted/20">
                            <TableCell className="font-mono text-xs font-bold text-muted-foreground uppercase">
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {order.formattedDate}
                            </TableCell>
                            <TableCell className="text-sm">
                              {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                            </TableCell>
                            <TableCell className="font-black text-primary">
                              BDT {order.total.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Link 
                                href={`/orders/${order.id}/invoice`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg bg-card border border-border px-3 text-xs font-bold transition hover:bg-muted"
                                target="_blank"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Invoice
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-foreground">No orders yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">When you start shopping, your order details will appear here.</p>
                    <Link href="/shop" className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white transition hover:bg-brand-hover">
                      Browse Shop
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Profile Details</CardTitle>
                    <CardDescription>Your personal information provided during registration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</p>
                        <p className="font-bold">{user.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Role</p>
                        <Badge variant="secondary" className="font-bold uppercase tracking-wide">
                          {user.role.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                        <p className="font-bold">{user.email || "Not set"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</p>
                        <p className="font-bold">{user.phone || "Not set"}</p>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl bg-muted/30 p-4 border border-border/50">
                      <p className="text-sm font-medium leading-relaxed">
                        Your account role determines your access level. As a <span className="font-black text-primary capitalize">{user.role.replace("_", " ")}</span>, 
                        you can view your order history and manage your profile settings.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {user.canAccessAdminPanel && (
                        <Button asChild className="rounded-full px-6 font-bold">
                          <Link href="/dashboard">
                            Open Admin Dashboard
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Verification Status</CardTitle>
                    <CardDescription>Keep your account secure by verifying your contact info</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${user.emailVerifiedAt ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Email Verification</p>
                            <p className="text-xs text-muted-foreground">{user.emailVerifiedAt ? 'Verified' : 'Action Required'}</p>
                          </div>
                        </div>
                        {!user.emailVerifiedAt && (
                           <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full font-bold"
                              disabled={!user.email || emailForm.processing}
                              onClick={() => emailForm.post("/email/verification-notification", { preserveScroll: true })}
                            >
                              Send Link
                           </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${user.phoneVerifiedAt ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Phone Verification</p>
                            <p className="text-xs text-muted-foreground">{user.phoneVerifiedAt ? 'Verified' : 'Not Verified'}</p>
                          </div>
                        </div>
                        {!user.phoneVerifiedAt && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full font-bold" 
                            disabled={!user.phone || phoneForm.processing} 
                            onClick={() => phoneForm.post("/phone/verification/request", { preserveScroll: true })}
                          >
                             Request Code
                          </Button>
                        )}
                      </div>
                    </div>

                    {!user.phoneVerifiedAt && user.phone && (
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 animate-in slide-in-from-top-2">
                        <Label htmlFor="phone-verification-code" className="text-xs font-black uppercase tracking-widest text-primary">Enter Code</Label>
                        <div className="mt-3 flex gap-3">
                          <Input 
                            id="phone-verification-code" 
                            placeholder="6-digit code"
                            className="rounded-xl border-primary/20"
                            inputMode="numeric" 
                            value={phoneForm.data.code} 
                            onChange={(event) => phoneForm.setData("code", event.target.value)} 
                          />
                          <Button 
                            className="rounded-xl font-bold" 
                            disabled={phoneForm.processing} 
                            onClick={() => phoneForm.post("/phone/verification/verify", { preserveScroll: true })}
                          >
                            Verify
                          </Button>
                        </div>
                        {phoneForm.errors.code && <p className="mt-2 text-xs font-bold text-rose-600">{phoneForm.errors.code}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

Account.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Account;
