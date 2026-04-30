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
import { Search, Pencil, Trash2, Ticket } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CouponsPage() {
  const { coupons } = usePage<{ coupons: Coupon[] }>().props;
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase())), [coupons, search]);

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/coupons/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Coupon deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete coupon", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Coupons" description="Manage discount coupons" actionLabel="Add Coupon" onAction={() => router.get("/coupons/create")} />
      <Card><CardContent className="p-4">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No coupons" description="Create a discount coupon" actionLabel="Add Coupon" onAction={() => router.get("/coupons/create")} icon={<Ticket className="h-8 w-8 text-muted-foreground" />} />
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
                      <Button variant="ghost" size="icon" onClick={() => router.get(`/coupons/${c.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
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
                        <Button variant="ghost" size="icon" onClick={() => router.get(`/coupons/${c.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
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

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
