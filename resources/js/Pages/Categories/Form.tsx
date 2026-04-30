import type { ReactNode } from "react";
import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Category } from "@/lib/store";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function CategoriesFormPage() {
  const { mode, category, categories } = usePage<{
    mode: "create" | "edit";
    category: Category | null;
    categories: Category[];
  }>().props;

  const isEditing = mode === "edit" && category !== null;
  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    parentId: category?.parentId ?? "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      parentId: form.parentId || null,
    };

    if (isEditing) {
      router.put(`/categories/${category.id}`, payload, {
        onSuccess: () => toast({ title: "Category updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save category", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/categories", payload, {
      onSuccess: () => toast({ title: "Category created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save category", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Category" : "Create Category"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Category" : "New Category"} description="Enter a category name, slug, and optional parent category.">
          <Button variant="outline" onClick={() => router.get("/categories")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({
                  ...form,
                  name: event.target.value,
                  slug: form.slug === "" || form.slug === slugify(form.name) ? slugify(event.target.value) : form.slug,
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="font-mono" />
            </div>

            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select value={form.parentId || "none"} onValueChange={(value) => setForm({ ...form, parentId: value === "none" ? "" : value })}>
                <SelectTrigger><SelectValue placeholder="Select parent category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categories.filter((item) => item.id !== category?.id).map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/categories")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Category" : "Create Category"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

CategoriesFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default CategoriesFormPage;
