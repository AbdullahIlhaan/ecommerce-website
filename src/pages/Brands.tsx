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
import { Search, Pencil, Trash2, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BrandsPage() {
  const { brands } = usePage<{ brands: Brand[] }>().props;
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())), [brands, search]);

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
      <PageHeader title="Brands" description="Manage product brands" actionLabel="Add Brand" onAction={() => router.get("/brands/create")} />
      <Card><CardContent className="p-4">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="No brands" description="Add your first brand" actionLabel="Add Brand" onAction={() => router.get("/brands/create")} icon={<Award className="h-8 w-8 text-muted-foreground" />} />
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
                      <Button variant="ghost" size="icon" onClick={() => router.get(`/brands/${b.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
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
                        <Button variant="ghost" size="icon" onClick={() => router.get(`/brands/${b.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
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

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
