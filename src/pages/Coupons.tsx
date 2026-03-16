import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Coupon } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Pencil, Trash2, Ticket } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CouponsPage() {
  const { coupons } = usePage<{ coupons: Coupon[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: "", type: "percentage" as Coupon["type"], value: "", startDate: "", endDate: "", usageLimit: "", status: "active" as Coupon["status"] });

  const filtered = useMemo(() => coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase())), [coupons, search]);

  const openCreate = () => { setEditing(null); setForm({ code: "", type: "percentage", value: "", startDate: "", endDate: "", usageLimit: "", status: "active" }); setFormOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, type: c.type, value: c.value.toString(), startDate: c.startDate, endDate: c.endDate, usageLimit: c.usageLimit.toString(), status: c.status }); setFormOpen(true); };

  const handleSave = () => {
    if (!form.code || !form.value) { toast({ title: "Code and value required", variant: "destructive" }); return; }
    const data = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: parseInt(form.usageLimit) || 0,
      status: form.status,
    };
    if (editing) {
      router.put(`/coupons/${editing.id}`, data, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "Coupon updated" });
          setFormOpen(false);
        },
      });
      return;
    }

    router.post("/coupons", data, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Coupon created" });
        setFormOpen(false);
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/coupons/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Coupon deleted" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Coupons" description="Manage discount coupons" actionLabel="Add Coupon" onAction={openCreate} />
      <Card><CardContent className="p-4">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No coupons" description="Create a discount coupon" actionLabel="Add Coupon" onAction={openCreate} icon={<Ticket className="h-8 w-8 text-muted-foreground" />} />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filtered.map((c) => (
                <article key={c.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="font-mono text-sm font-semibold">{c.code}</div>
                      <div className="text-sm text-muted-foreground">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`} • {c.usageCount}/{c.usageLimit} used</div>
                      <div className="text-sm text-muted-foreground">Valid until {c.endDate}</div>
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
                <TableHeader><TableRow>
                  <TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead><TableHead>Valid Until</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                      <TableCell className="capitalize">{c.type}</TableCell>
                      <TableCell>{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</TableCell>
                      <TableCell>{c.usageCount}/{c.usageLimit}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.endDate}</TableCell>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Coupon" : "New Coupon"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="font-mono uppercase" /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v as Coupon["type"]})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Value *</Label><Input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
              <div><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v as Coupon["status"]})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="disabled">Disabled</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent>
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
