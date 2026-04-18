import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { FlashDeal, Product } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type FlashDealForm = {
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  productIds: string[];
};

const emptyForm: FlashDealForm = {
  name: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  productIds: [],
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function toUtcIsoString(value: string) {
  return new Date(value).toISOString();
}

export default function FlashDealsPage() {
  const { flashDeals, products } = usePage<{ flashDeals: FlashDeal[]; products: Product[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<FlashDeal | null>(null);
  const [form, setForm] = useState<FlashDealForm>(emptyForm);

  const filtered = useMemo(
    () => flashDeals.filter((deal) => deal.name.toLowerCase().includes(search.toLowerCase())),
    [flashDeals, search],
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => form.productIds.includes(product.id)),
    [form.productIds, products],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (deal: FlashDeal) => {
    setEditing(deal);
    setForm({
      name: deal.name,
      startsAt: toDateTimeLocal(deal.startsAt),
      endsAt: toDateTimeLocal(deal.endsAt),
      isActive: deal.isActive,
      productIds: deal.productIds,
    });
    setFormOpen(true);
  };

  const toggleProduct = (productId: string) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Flash deal name is required", variant: "destructive" });
      return;
    }

    if (form.productIds.length === 0) {
      toast({ title: "Select at least one product", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      startsAt: form.startsAt ? toUtcIsoString(form.startsAt) : null,
      endsAt: form.endsAt ? toUtcIsoString(form.endsAt) : null,
      isActive: form.isActive ? 1 : 0,
      productIds: form.productIds,
    };

    if (editing) {
      router.put(`/flash-deals/${editing.id}`, payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "Flash deal updated" });
          setFormOpen(false);
        },
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to update flash deal", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/flash-deals", payload, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Flash deal created" });
        setFormOpen(false);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to create flash deal", variant: "destructive" });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/flash-deals/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Flash deal deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete flash deal", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Flash Deals" description="Choose flash deal products and schedule when the offer runs" actionLabel="Add Flash Deal" onAction={openCreate} />
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search flash deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No flash deals" description="Create a flash deal and assign products to the homepage section" actionLabel="Add Flash Deal" onAction={openCreate} icon={<Zap className="h-8 w-8 text-muted-foreground" />} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filtered.map((deal) => (
                  <article key={deal.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="font-semibold">{deal.name}</div>
                        <div className="text-sm text-muted-foreground">{deal.products.length} product(s)</div>
                        <div className="text-sm text-muted-foreground">Starts {deal.startsAt ? new Date(deal.startsAt).toLocaleString() : "Immediately"}</div>
                        <div className="text-sm text-muted-foreground">Ends {deal.endsAt ? new Date(deal.endsAt).toLocaleString() : "Manually"}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary">{deal.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(deal)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(deal.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Ends</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>{deal.products.length}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{deal.startsAt ? new Date(deal.startsAt).toLocaleString() : "Immediately"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{deal.endsAt ? new Date(deal.endsAt).toLocaleString() : "Manually"}</TableCell>
                        <TableCell className="text-xs font-bold uppercase tracking-wider text-primary">{deal.status}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(deal)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(deal.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Flash Deal" : "New Flash Deal"}</DialogTitle>
            <DialogDescription>
              Select the products to feature, define when the deal starts, and when it should stop showing on the homepage.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="flash-deal-name">Deal Name *</Label>
                <Input id="flash-deal-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Weekend Mega Deal" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch id="flash-deal-active" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
                <Label htmlFor="flash-deal-active" className="cursor-pointer">Available for homepage activation</Label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="flash-deal-starts">Starts At</Label>
                <Input id="flash-deal-starts" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="flash-deal-ends">Ends At</Label>
                <Input id="flash-deal-ends" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
              <div>
                <Label>Select Products *</Label>
                <div className="mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-border">
                  {products.map((product) => (
                    <label key={product.id} className="flex cursor-pointer items-start gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted/30">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">SKU {product.sku} • BDT {product.salePrice ?? product.price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Selected Order</Label>
                <div className="mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-muted/20 p-3">
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProducts.map((product, index) => (
                        <div key={product.id} className="rounded-xl border border-border bg-background px-3 py-2">
                          <div className="text-xs font-black uppercase tracking-wider text-primary">#{index + 1}</div>
                          <div className="mt-1 font-medium">{product.name}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Pick products to control the homepage flash deal lineup.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
