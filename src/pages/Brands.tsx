import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Brand } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Pencil, Trash2, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BrandsPage() {
  const { brands } = usePage<{ brands: Brand[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const filtered = useMemo(() => brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())), [brands, search]);

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "" }); setFormOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, slug: b.slug }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    const data = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
    if (editing) {
      router.put(`/brands/${editing.id}`, data, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "Brand updated" });
          setFormOpen(false);
        },
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to update brand", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/brands", data, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Brand created" });
        setFormOpen(false);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to create brand", variant: "destructive" });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/brands/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Brand deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete brand", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Brands" description="Manage product brands" actionLabel="Add Brand" onAction={openCreate} />
      <Card><CardContent className="p-4">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No brands" description="Add your first brand" actionLabel="Add Brand" onAction={openCreate} icon={<Award className="h-8 w-8 text-muted-foreground" />} />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filtered.map((b) => (
                <article key={b.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{b.slug}</div>
                      <div className="mt-2 text-sm text-muted-foreground">{b.createdAt}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{b.slug}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent></Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[94svh] overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
            <DialogTitle>{editing ? "Edit Brand" : "New Brand"}</DialogTitle>
            <DialogDescription>
              Provide a brand name and optional custom slug.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-4 pb-1">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="font-mono" /></div>
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
