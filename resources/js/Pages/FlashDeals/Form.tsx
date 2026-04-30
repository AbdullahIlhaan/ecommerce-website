import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowDown, ArrowUp, Package, Search, X } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import type { FlashDeal, Product } from "@/lib/store";

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

function FlashDealsFormPage() {
  const { mode, flashDeal, products } = usePage<{
    mode: "create" | "edit";
    flashDeal: FlashDeal | null;
    products: Product[];
  }>().props;

  const isEditing = mode === "edit" && flashDeal !== null;
  const [form, setForm] = useState({
    name: flashDeal?.name ?? "",
    startsAt: toDateTimeLocal(flashDeal?.startsAt),
    endsAt: toDateTimeLocal(flashDeal?.endsAt),
    isActive: flashDeal?.isActive ?? true,
    productIds: flashDeal?.productIds ?? [],
  });
  const [productSearch, setProductSearch] = useState("");

  const selectedProducts = useMemo(
    () => products.filter((product) => form.productIds.includes(product.id)),
    [form.productIds, products],
  );

  const availableProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      if (form.productIds.includes(product.id)) {
        return false;
      }

      if (normalizedSearch.length === 0) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(normalizedSearch)
        || product.sku.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [form.productIds, productSearch, products]);

  const addProduct = (productId: string) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds
        : [...current.productIds, productId],
    }));
  };

  const removeProduct = (productId: string) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.filter((id) => id !== productId),
    }));
  };

  const moveProduct = (productId: string, direction: "up" | "down") => {
    setForm((current) => {
      const currentIndex = current.productIds.indexOf(productId);
      if (currentIndex === -1) return current;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= current.productIds.length) return current;

      const nextProductIds = [...current.productIds];
      [nextProductIds[currentIndex], nextProductIds[targetIndex]] = [nextProductIds[targetIndex], nextProductIds[currentIndex]];

      return {
        ...current,
        productIds: nextProductIds,
      };
    });
  };

  const computedStatus = useMemo(() => {
    const now = new Date().getTime();
    const startsAt = form.startsAt ? new Date(form.startsAt).getTime() : null;
    const endsAt = form.endsAt ? new Date(form.endsAt).getTime() : null;

    if (!form.isActive) return "disabled";
    if (endsAt !== null && endsAt <= now) return "ended";
    if ((startsAt === null || startsAt <= now) && (endsAt === null || endsAt > now)) return "running";
    return "scheduled";
  }, [form.endsAt, form.isActive, form.startsAt]);

  const handleSubmit = () => {
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

    if (isEditing) {
      router.put(`/flash-deals/${flashDeal.id}`, payload, {
        onSuccess: () => toast({ title: "Flash deal updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save flash deal", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/flash-deals", payload, {
      onSuccess: () => toast({ title: "Flash deal created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save flash deal", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Flash Deal" : "Create Flash Deal"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Flash Deal" : "New Flash Deal"} description="Select the products to feature, define when the deal starts, and when it should stop showing on the homepage.">
          <Button variant="outline" onClick={() => router.get("/flash-deals")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Flash Deals
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Current Mode</div>
                <div className="mt-2 text-lg font-semibold">{isEditing ? "Editing Existing Deal" : "Creating New Deal"}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick products, control the homepage order, and schedule when the sale should be visible.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Computed Status</div>
                <div className="mt-2 text-lg font-semibold capitalize">{computedStatus}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  This preview updates from your activation switch and schedule fields before you save.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Selected Products</div>
                <div className="mt-2 text-lg font-semibold">{form.productIds.length}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  The homepage flash sale uses this exact order from top to bottom.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Deal Name *</Label>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Weekend Mega Deal" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3 md:mt-7">
                <div>
                  <div className="font-semibold">Available for homepage activation</div>
                  <div className="text-sm text-muted-foreground">Only one active flash deal should run at a time.</div>
                </div>
                <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ends At</Label>
                <Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
              <div className="space-y-2">
                <Label>Add Products *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search by product name or SKU..."
                    className="pl-9"
                  />
                </div>
                <div className="max-h-[32rem] overflow-y-auto rounded-2xl border border-border bg-background">
                  {availableProducts.length > 0 ? availableProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-border bg-muted">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          SKU {product.sku} • BDT {product.salePrice ?? product.price} • Stock {product.stock}
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => addProduct(product.id)}>
                        Add
                      </Button>
                    </div>
                  )) : (
                    <div className="px-4 py-8 text-sm text-muted-foreground">
                      No matching products available. Try a different search or remove items from the selected list.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selected Order</Label>
                <div className="max-h-[32rem] overflow-y-auto rounded-2xl border border-border bg-muted/20 p-3">
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProducts.map((product, index) => (
                        <div key={product.id} className="rounded-xl border border-border bg-background p-3">
                          <div className="flex items-start gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-xl border border-border bg-muted">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">#{index + 1}</div>
                              <div className="mt-1 truncate font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                SKU {product.sku} • BDT {product.salePrice ?? product.price}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => moveProduct(product.id, "up")} disabled={index === 0}>
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => moveProduct(product.id, "down")} disabled={index === selectedProducts.length - 1}>
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProduct(product.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Add products from the left panel to build the homepage flash sale lineup.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/flash-deals")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Flash Deal" : "Create Flash Deal"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

FlashDealsFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default FlashDealsFormPage;
