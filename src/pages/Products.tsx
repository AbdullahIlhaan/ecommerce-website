import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Product, Category, Brand } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const { products } = usePage<{
    products: Product[];
    categories: Category[];
    brands: Brand[];
  }>().props;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/products/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Product deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete product", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Products" description="Manage your product catalog" actionLabel="Add Product" onAction={() => router.get("/products/create")} />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No products found" description="Start by adding your first product" actionLabel="Add Product" onAction={() => router.get("/products/create")} icon={<Package className="h-8 w-8 text-muted-foreground" />} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filtered.map((p) => (
                  <article key={p.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold line-clamp-1">{p.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{p.sku}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={p.salePrice ? "text-xs text-muted-foreground line-through" : "text-sm font-bold"}>BDT {p.price}</span>
                            {p.salePrice && <span className="text-sm font-bold text-success">BDT {p.salePrice}</span>}
                          </div>
                          <div className="text-[11px] text-muted-foreground">Stock: <span className={p.stock < 10 ? "font-bold text-destructive" : "font-bold text-foreground"}>{p.stock}</span></div>
                          <div className="pt-1"><StatusBadge status={p.status} /></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.get(`/products/${p.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                              {p.images && p.images.length > 0 ? (
                                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <span className="font-bold">{p.name}</span>
                          </div>
                        </TableCell>
                          <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className={p.salePrice ? "text-xs text-muted-foreground line-through" : "font-bold"}>BDT {p.price}</span>
                              {p.salePrice && <span className="font-bold text-success">BDT {p.salePrice}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={p.stock < 10 ? "font-medium text-destructive" : ""}>{p.stock}</span>
                          </TableCell>
                          <TableCell><StatusBadge status={p.status} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => router.get(`/products/${p.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} description="This product will be permanently deleted." />
    </div>
  );
}
