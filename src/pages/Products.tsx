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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Pencil, Trash2, Package, ImagePlus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ChangeEvent } from "react";

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
  const [form, setForm] = useState({ 
    name: "", 
    sku: "", 
    description: "", 
    price: "", 
    salePrice: "", 
    stock: "", 
    status: "active" as Product["status"], 
    categoryId: "", 
    brandId: "" 
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    setImages([]);
    setImagePreviews([]);
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, description: p.description, price: p.price.toString(), salePrice: p.salePrice?.toString() || "", stock: p.stock.toString(), status: p.status, categoryId: p.categoryId, brandId: p.brandId });
    setImages([]);
    setImagePreviews(p.images || []);
    setFormOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImages(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    const previewToRemove = newPreviews[index];
    if (previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSave = () => {
    if (!form.name || !form.sku || !form.price) {
      toast({ title: "Validation Error", description: "Name, SKU and Price are required", variant: "destructive" });
      return;
    }
    const data = { 
      name: form.name, 
      sku: form.sku, 
      description: form.description, 
      price: parseFloat(form.price), 
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null, 
      stock: parseInt(form.stock) || 0, 
      status: form.status, 
      categoryId: form.categoryId || null, 
      brandId: form.brandId || null, 
      images: images,
      _method: editing ? "put" : "post"
    };

    router.post(editing ? `/products/${editing.id}` : "/products", data, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: editing ? "Product updated" : "Product created" });
        setFormOpen(false);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save product", variant: "destructive" });
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
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete product", variant: "destructive" });
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
            <EmptyState title="No products found" description="Start by adding your first product" actionLabel="Add Product" onAction={openCreate} icon={<Package className="h-8 w-8 text-muted-foreground" />} />
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
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
                              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[94svh] overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
            <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogDescription>
              Configure product identity, pricing, stock, categorization, and gallery images.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-4 pb-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="font-mono" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} /></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Price *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
              <div><Label>Sale Price</Label><Input type="number" value={form.salePrice} onChange={e => setForm({...form, salePrice: e.target.value})} /></div>
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
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
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Product Gallery</Label>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                <div className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 transition-all hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02] active:scale-95">
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                    <ImagePlus className="mb-2 h-8 w-8" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Click or Drag to Upload</span>
                  </div>
                </div>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-2xl border border-border shadow-sm bg-muted animate-in fade-in zoom-in duration-300">
                    <img src={preview} alt={`Preview ${index}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-destructive text-white shadow-lg shadow-destructive/20 transition-all hover:scale-110 active:scale-90"
                      title="Remove Image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {index === 0 ? "PRIMARY" : `IMG ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
          <DialogFooter className="border-t border-border px-4 py-4 sm:px-6">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} description="This product will be permanently deleted." />
    </div>
  );
}
