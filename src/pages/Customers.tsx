import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Customer } from "@/lib/store";
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
import { Search, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CustomersPage() {
  const { customers } = usePage<{ customers: Customer[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "active" as Customer["status"] });

  const filtered = useMemo(() => customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  ), [customers, search]);

  const openCreate = () => { setEditing(null); setForm({ name: "", email: "", phone: "", status: "active" }); setFormOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone, status: c.status }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.email) { toast({ title: "Name and email required", variant: "destructive" }); return; }
    if (editing) {
      router.put(`/customers/${editing.id}`, form, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "Customer updated" });
          setFormOpen(false);
        },
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to update customer", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/customers", form, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Customer created" });
        setFormOpen(false);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to create customer", variant: "destructive" });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/customers/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Customer deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete customer", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Customers" description="Manage customer accounts" actionLabel="Add Customer" onAction={openCreate} />
      <Card><CardContent className="p-4">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No customers" description="Add your first customer" actionLabel="Add Customer" onAction={openCreate} icon={<Users className="h-8 w-8 text-muted-foreground" />} />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filtered.map((c) => (
                <article key={c.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.email}</div>
                      <div className="text-sm text-muted-foreground">{c.phone}</div>
                      <StatusBadge status={c.status} />
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
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
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
      </CardContent></Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "New Customer"}</DialogTitle>
            <DialogDescription>
              Enter customer contact details and account status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v as Customer["status"]})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
