import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { FileText, Pencil, Search, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

function ContentPagesPage() {
  const { contentPages, tableMissing } = usePage<{
    contentPages: ContentPageRecord[];
    tableMissing: boolean;
  }>().props;

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return contentPages.filter((contentPage) => (
      normalizedSearch.length === 0
      || contentPage.title.toLowerCase().includes(normalizedSearch)
      || contentPage.slug.toLowerCase().includes(normalizedSearch)
      || contentPage.summary.toLowerCase().includes(normalizedSearch)
      || contentPage.body.toLowerCase().includes(normalizedSearch)
    ));
  }, [contentPages, search]);

  const handleDelete = () => {
    if (!deleteId) {
      return;
    }

    router.delete(`/content-pages/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Content page deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete content page", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title="Content Pages" />

      <div className="animate-fade-in">
        <PageHeader
          title="Content Pages"
          description="Manage support, policy, and information pages that appear in the storefront footer and support links."
          actionLabel="Add Page"
          onAction={() => router.get("/content-pages/create")}
        />

        {tableMissing && (
          <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
            <CardContent className="p-4 text-sm text-amber-900 dark:text-amber-100">
              The content pages table is not available yet. Run the latest migration to enable saving changes from the dashboard.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search titles, slugs, or content..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="No content pages found"
                description="Create the first content page or adjust your search."
                actionLabel="Add Page"
                onAction={() => router.get("/content-pages/create")}
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              />
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filtered.map((contentPage) => (
                    <article key={contentPage.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-3">
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-primary/70">{contentPage.slug}</div>
                            <div className="mt-1 font-semibold">{contentPage.title}</div>
                          </div>
                          <p className="text-sm text-muted-foreground">{contentPage.summary || "No summary added."}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className={`rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${contentPage.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                              {contentPage.isActive ? "Active" : "Inactive"}
                            </span>
                            <span>{contentPage.updatedAtLabel || "-"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.get(`/content-pages/${contentPage.id}/edit`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(contentPage.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Summary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((contentPage) => (
                        <TableRow key={contentPage.id}>
                          <TableCell className="font-semibold">{contentPage.title}</TableCell>
                          <TableCell className="font-mono text-xs">{contentPage.slug}</TableCell>
                          <TableCell className="max-w-[28rem] whitespace-normal text-muted-foreground">
                            {contentPage.summary || "No summary added."}
                          </TableCell>
                          <TableCell>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${contentPage.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                              {contentPage.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>{contentPage.updatedAtLabel || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => router.get(`/content-pages/${contentPage.id}/edit`)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(contentPage.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        <ConfirmModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          description="This content page will be permanently deleted."
        />
      </div>
    </>
  );
}

ContentPagesPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default ContentPagesPage;
