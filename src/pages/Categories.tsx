import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Category } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { categories } = usePage<{ categories: Category[] }>().props;
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [categories, search]);

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "—";
    return categories.find(c => c.id === parentId)?.name || "—";
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/categories/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Category deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete category", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Categories" description="Organize your products" actionLabel="Add Category" onAction={() => router.get("/categories/create")} />
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No categories" description="Create your first category" actionLabel="Add Category" onAction={() => router.get("/categories/create")} icon={<FolderTree className="h-8 w-8 text-muted-foreground" />} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filtered.map((c) => (
                  <article key={c.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="mt-1 font-mono text-xs text-muted-foreground">{c.slug}</div>
                        <div className="mt-2 text-sm text-muted-foreground">Parent: {getParentName(c.parentId)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.get(`/categories/${c.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Parent</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filtered.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                        <TableCell>{getParentName(c.parentId)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => router.get(`/categories/${c.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
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

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
