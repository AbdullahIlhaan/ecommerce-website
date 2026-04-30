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
import { toast } from "@/hooks/use-toast";
import type { Brand } from "@/lib/store";

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function BrandsFormPage() {
  const { mode, brand } = usePage<{ mode: "create" | "edit"; brand: Brand | null }>().props;
  const isEditing = mode === "edit" && brand !== null;
  const [form, setForm] = useState({
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
  });

  const handleSubmit = () => {
    if (!form.name) {
      toast({ title: "Brand name is required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
    };

    if (isEditing) {
      router.put(`/brands/${brand.id}`, payload, {
        onSuccess: () => toast({ title: "Brand updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save brand", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/brands", payload, {
      onSuccess: () => toast({ title: "Brand created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save brand", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Brand" : "Create Brand"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Brand" : "New Brand"} description="Provide a brand name and optional custom slug.">
          <Button variant="outline" onClick={() => router.get("/brands")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Brands
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
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="font-mono" />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/brands")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Brand" : "Create Brand"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

BrandsFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default BrandsFormPage;
