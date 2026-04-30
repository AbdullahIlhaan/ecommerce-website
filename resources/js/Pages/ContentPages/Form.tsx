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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type ContentPageRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  isActive: boolean;
  updatedAt: string | null;
  updatedAtLabel: string | null;
};

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ContentPagesFormPage() {
  const { mode, contentPage, tableMissing } = usePage<{
    mode: "create" | "edit";
    contentPage: ContentPageRecord | null;
    tableMissing: boolean;
  }>().props;

  const isEditing = mode === "edit" && contentPage !== null;
  const [form, setForm] = useState({
    title: contentPage?.title ?? "",
    slug: contentPage?.slug ?? "",
    summary: contentPage?.summary ?? "",
    body: contentPage?.body ?? "",
    isActive: contentPage?.isActive ?? true,
  });

  const handleSubmit = () => {
    if (tableMissing) {
      toast({ title: "The content pages table is missing", variant: "destructive" });
      return;
    }

    if (!form.title.trim() || !form.slug.trim() || !form.body.trim()) {
      toast({ title: "Title, slug, and body are required", variant: "destructive" });
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: toSlug(form.slug),
      summary: form.summary.trim() || null,
      body: form.body.trim(),
      isActive: form.isActive,
    };

    if (isEditing) {
      router.put(`/content-pages/${contentPage.id}`, payload, {
        onSuccess: () => toast({ title: "Content page updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save content page", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/content-pages", payload, {
      onSuccess: () => toast({ title: "Content page created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save content page", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Content Page" : "Create Content Page"} />

      <div className="animate-fade-in">
        <PageHeader
          title={isEditing ? "Edit Content Page" : "New Content Page"}
          description="Manage public support, company, and policy content shown in the storefront."
        >
          <Button variant="outline" onClick={() => router.get("/content-pages")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Content Pages
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: current.slug.length === 0 || current.slug === toSlug(current.title) ? toSlug(title) : current.slug,
                    }));
                  }}
                  placeholder="Support Center"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: toSlug(event.target.value) })}
                  placeholder="support-center"
                />
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                rows={3}
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                placeholder="Short introduction shown near the page title."
              />
            </div>

            <div className="space-y-2">
              <Label>Page Body</Label>
              <Textarea
                rows={14}
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                placeholder="Write the public page content here. Separate paragraphs with a blank line."
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <div>
                <div className="font-semibold">Active page</div>
                <div className="text-sm text-muted-foreground">Inactive pages stay in the dashboard but return not found on the storefront.</div>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/content-pages")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Page" : "Create Page"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

ContentPagesFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default ContentPagesFormPage;
