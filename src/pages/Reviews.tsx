import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Review } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Check, X, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-warning text-warning' : 'text-muted'}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { reviews } = usePage<{ reviews: Review[] }>().props;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => reviews.filter(r => {
    const matchSearch = r.productName.toLowerCase().includes(search.toLowerCase()) || r.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }), [reviews, search, statusFilter]);

  const handleApprove = (id: string) => {
    router.put(`/reviews/${id}/approve`, {}, {
      preserveScroll: true,
      onSuccess: () => toast({ title: "Review approved" }),
    });
  };
  const handleReject = (id: string) => {
    router.put(`/reviews/${id}/reject`, {}, {
      preserveScroll: true,
      onSuccess: () => toast({ title: "Review rejected" }),
    });
  };
  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/reviews/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Review deleted" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reviews" description="Moderate product reviews" />
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No reviews" description="Reviews will appear here when customers leave feedback" icon={<Star className="h-8 w-8 text-muted-foreground" />} />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filtered.map((r) => (
                <article key={r.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="space-y-2">
                    <div className="font-medium">{r.productName}</div>
                    <div className="text-sm text-muted-foreground">{r.customerName}</div>
                    <StarRating rating={r.rating} />
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} />
                      {r.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm" className="text-success" onClick={() => handleApprove(r.id)}><Check className="h-4 w-4" />Approve</Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleReject(r.id)}><X className="h-4 w-4" />Reject</Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>Customer</TableHead><TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.productName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.customerName}</TableCell>
                      <TableCell><StarRating rating={r.rating} /></TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{r.comment}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {r.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" className="text-success" onClick={() => handleApprove(r.id)}><Check className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleReject(r.id)}><X className="h-4 w-4" /></Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
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
