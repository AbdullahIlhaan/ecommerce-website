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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProductsPage() {
  const { products, categories, brands } = usePage<{
    products: Product[];
    categories: Category[];
    brands: Brand[];
  }>().props;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", description: "", price: "", salePrice: "", stock: "", status: "active" as Product["status"], categoryId: "", brandId: "" });

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sku: "", description: "", price: "", salePrice: "", stock: "", status: "active", categoryId: "", brandId: "" });
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, description: p.description, price: p.price.toString(), salePrice: p.salePrice?.toString() || "", stock: p.stock.toString(), status: p.status, categoryId: p.categoryId, brandId: p.brandId });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.sku || !form.price) {
      toast({ title: "Validation Error", description: "Name, SKU and Price are required", variant: "destructive" });
      return;
    }
    const data = { name: form.name, sku: form.sku, description: form.description, price: parseFloat(form.price), salePrice: form.salePrice ? parseFloat(form.salePrice) : null, stock: parseInt(form.stock) || 0, status: form.status, categoryId: form.categoryId || null, brandId: form.brandId || null, images: [] as string[] };
    if (editing) {
      router.put(`/products/${editing.id}`, data, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "Product updated" });
          setFormOpen(false);
        },
      });
      return;
    }

    router.post("/products", data, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Product created" });
        setFormOpen(false);
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/products/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Product deleted" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Products" description="Manage your product catalog" actionLabel="Add Product" onAction={openCreate} />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No products found" description="Start by adding your first product" actionLabel="Add Product" onAction={openCreate} icon={<Package className="h-8 w-8 text-muted-foreground" />} />
          ) : (
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
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={p.salePrice ? "text-muted-foreground line-through text-xs" : ""}>${p.price}</span>
                          {p.salePrice && <span className="text-success font-medium">${p.salePrice}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={p.stock < 10 ? "text-destructive font-medium" : ""}>{p.stock}</span>
                      </TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="font-mono" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Price *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              <div><Label>Sale Price</Label><Input type="number" value={form.salePrice} onChange={e => setForm({...form, salePrice: e.target.value})} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v as Product["status"]})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={v => setForm({...form, categoryId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand</Label>
                <Select value={form.brandId} onValueChange={v => setForm({...form, brandId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} description="This product will be permanently deleted." />
    </div>
  );
}
