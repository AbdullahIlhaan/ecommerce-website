import { ChangeEvent, type ReactNode, useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ImagePlus, Package, X } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Brand, Category, Product } from "@/lib/store";

function ProductsFormPage() {
  const { mode, product, categories, brands } = usePage<{
    mode: "create" | "edit";
    product: Product | null;
    categories: Category[];
    brands: Brand[];
  }>().props;

  const isEditing = mode === "edit" && product !== null;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    salePrice: product?.salePrice != null ? String(product.salePrice) : "",
    stock: product ? String(product.stock) : "",
    status: product?.status ?? ("active" as Product["status"]),
    categoryId: product?.categoryId ?? "",
    brandId: product?.brandId ?? "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images ?? []);

  const categoryOptions = useMemo(() => categories, [categories]);
  const brandOptions = useMemo(() => brands, [brands]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    setImagePreviews((current) => {
      const next = [...current];
      const preview = next[index];
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      next.splice(index, 1);
      return next;
    });

    setImages((current) => {
      const next = [...current];
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.price) {
      toast({ title: "Name, SKU, and price are required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      stock: parseInt(form.stock, 10) || 0,
      status: form.status,
      categoryId: form.categoryId || null,
      brandId: form.brandId || null,
      images,
      _method: isEditing ? "put" : "post",
    };

    router.post(isEditing ? `/products/${product.id}` : "/products", payload, {
      forceFormData: true,
      onSuccess: () => toast({ title: isEditing ? "Product updated" : "Product created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save product", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Product" : "Create Product"} />

      <div className="animate-fade-in">
        <PageHeader
          title={isEditing ? "Edit Product" : "New Product"}
          description="Configure product identity, pricing, stock, categorization, and gallery images."
        >
          <Button variant="outline" onClick={() => router.get("/products")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} className="font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sale Price</Label>
                <Input type="number" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Product["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId || "none"} onValueChange={(value) => setForm({ ...form, categoryId: value === "none" ? "" : value })}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={form.brandId || "none"} onValueChange={(value) => setForm({ ...form, brandId: value === "none" ? "" : value })}>
                  <SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No brand</SelectItem>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-t border-border/60 pt-6">
              <div>
                <div className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Product Gallery</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload new images to replace the current gallery.
                </p>
              </div>

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                <div className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary/50 hover:bg-primary/5">
                  <Input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 cursor-pointer opacity-0" />
                  <div className="flex flex-col items-center text-center text-muted-foreground group-hover:text-primary">
                    <ImagePlus className="mb-2 h-8 w-8" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Upload Images</span>
                  </div>
                </div>

                {imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
                    {preview ? (
                      <img src={preview} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/products")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Product" : "Create Product"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

ProductsFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default ProductsFormPage;
