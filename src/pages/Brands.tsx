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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
      });
      return;
    }

    router.post("/brands", data, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Brand created" });
        setFormOpen(false);
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
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Brands" description="Manage product brands" actionLabel="Add Brand" onAction={openCreate} />
      <Card><CardContent className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-sm" />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No brands" description="Add your first brand" actionLabel="Add Brand" onAction={openCreate} icon={<Award className="h-8 w-8 text-muted-foreground" />} />
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.slug}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{b.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Brand" : "New Brand"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="font-mono" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
