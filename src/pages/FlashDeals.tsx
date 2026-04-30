import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { FlashDeal } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function FlashDealsPage() {
  const { flashDeals } = usePage<{ flashDeals: FlashDeal[] }>().props;
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => flashDeals.filter((deal) => deal.name.toLowerCase().includes(search.toLowerCase())),
    [flashDeals, search],
  );

  const summary = useMemo(() => ({
    running: flashDeals.filter((deal) => deal.status === "running").length,
    scheduled: flashDeals.filter((deal) => deal.status === "scheduled").length,
    ended: flashDeals.filter((deal) => deal.status === "ended").length,
    disabled: flashDeals.filter((deal) => deal.status === "disabled").length,
  }), [flashDeals]);

  const liveDeal = useMemo(
    () => flashDeals.find((deal) => deal.status === "running") ?? null,
    [flashDeals],
  );

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/flash-deals/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Flash deal deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete flash deal", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Flash Deals" description="Choose flash deal products and schedule when the offer runs" actionLabel="Add Flash Deal" onAction={() => router.get("/flash-deals/create")} />

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.6fr))]">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-primary/70">Homepage Flash Sale</div>
            {liveDeal ? (
              <div className="mt-3 space-y-2">
                <div className="text-lg font-semibold">{liveDeal.name}</div>
                <div className="text-sm text-muted-foreground">
                  {liveDeal.products.length} products are currently scheduled on the homepage flash sale section.
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <StatusBadge status={liveDeal.status} />
                  <span className="text-muted-foreground">
                    Ends {liveDeal.endsAt ? new Date(liveDeal.endsAt).toLocaleString() : "manually"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 text-sm text-muted-foreground">
                No flash sale is currently running. Create or activate a deal with a valid schedule to show it on the homepage.
              </div>
            )}
          </CardContent>
        </Card>

        {[
          { label: "Running", value: summary.running },
          { label: "Scheduled", value: summary.scheduled },
          { label: "Ended", value: summary.ended },
          { label: "Disabled", value: summary.disabled },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-3xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search flash deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No flash deals" description="Create a flash deal and assign products to the homepage section" actionLabel="Add Flash Deal" onAction={() => router.get("/flash-deals/create")} icon={<Zap className="h-8 w-8 text-muted-foreground" />} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filtered.map((deal) => (
                  <article key={deal.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="font-semibold">{deal.name}</div>
                        <div className="text-sm text-muted-foreground">{deal.products.length} product(s)</div>
                        <div className="text-sm text-muted-foreground">Starts {deal.startsAt ? new Date(deal.startsAt).toLocaleString() : "Immediately"}</div>
                        <div className="text-sm text-muted-foreground">Ends {deal.endsAt ? new Date(deal.endsAt).toLocaleString() : "Manually"}</div>
                        <div><StatusBadge status={deal.status} /></div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.get(`/flash-deals/${deal.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(deal.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Starts</TableHead>
                      <TableHead>Ends</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.name}</TableCell>
                        <TableCell>{deal.products.length}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{deal.startsAt ? new Date(deal.startsAt).toLocaleString() : "Immediately"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{deal.endsAt ? new Date(deal.endsAt).toLocaleString() : "Manually"}</TableCell>
                        <TableCell><StatusBadge status={deal.status} /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => router.get(`/flash-deals/${deal.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(deal.id)}><Trash2 className="h-4 w-4" /></Button>
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
