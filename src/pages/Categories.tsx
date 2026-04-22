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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Pencil, Trash2, FolderTree } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { categories } = usePage<{ categories: Category[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", parentId: "" });

  const filtered = useMemo(() => categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [categories, search]);

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "—";
    return categories.find(c => c.id === parentId)?.name || "—";
  };

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", parentId: "" }); setFormOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, parentId: c.parentId || "" }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.slug) { toast({ title: "Name and slug required", variant: "destructive" }); return; }
    const data = { name: form.name, slug: form.slug, parentId: form.parentId || null };
    if (editing) {
      router.put(`/categories/${editing.id}`, data, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "Category updated" });
          setFormOpen(false);
        },
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to update category", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/categories", data, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Category created" });
        setFormOpen(false);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to create category", variant: "destructive" });
      },
    });
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
      <PageHeader title="Categories" description="Organize your products" actionLabel="Add Category" onAction={openCreate} />
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No categories" description="Create your first category" actionLabel="Add Category" onAction={openCreate} icon={<FolderTree className="h-8 w-8 text-muted-foreground" />} />
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
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
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
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[94svh] overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              Enter a category name, slug, and optional parent category.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-4 pb-1">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="font-mono" /></div>
            <div>
              <Label>Parent Category</Label>
              <Select value={form.parentId} onValueChange={v => setForm({...form, parentId: v === "none" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categories.filter(c => c.id !== editing?.id).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
          <DialogFooter className="border-t border-border px-4 py-4 sm:px-6">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
