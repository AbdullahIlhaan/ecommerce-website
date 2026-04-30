import { ChangeEvent, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { HeroBanner } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Pencil, Trash2, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function HeroBannersPage() {
  const { heroBanners } = usePage<{ heroBanners: HeroBanner[] }>().props;
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => heroBanners.filter((banner) => 
      banner.title.toLowerCase().includes(search.toLowerCase()) || 
      String(banner.sortOrder).includes(search)
    ),
    [heroBanners, search],
  );

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/hero-banners/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Hero banner deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete hero banner", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hero Banners" description="Manage homepage hero banners" actionLabel="Add Banner" onAction={() => router.get("/hero-banners/create")} />
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search hero banners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No hero banners" description="Create the first homepage banner" actionLabel="Add Banner" onAction={() => router.get("/hero-banners/create")} icon={<ImagePlus className="h-8 w-8 text-muted-foreground" />} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filtered.map((banner) => (
                  <article key={banner.id} className="rounded-2xl border border-border bg-background p-4">
                    <img src={banner.imagePath} alt={banner.title} className="aspect-[16/9] w-full rounded-xl object-cover" />
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        <div className="text-sm text-muted-foreground">{banner.subtitle || "No subtitle"}</div>
                        <div className="mt-2 text-sm text-muted-foreground">Sort {banner.sortOrder} • {banner.isActive ? "Active" : "Inactive"} • {(banner.imagePaths?.length ?? 1)} image(s)</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.get(`/hero-banners/${banner.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(banner.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={banner.imagePath} alt={banner.title} className="h-14 w-24 rounded-md object-cover" />
                            <div>
                              <div className="font-medium">{banner.title}</div>
                              <div className="text-xs text-muted-foreground">{banner.subtitle || "No subtitle"}</div>
                              <div className="mt-1 text-xs text-muted-foreground">{(banner.imagePaths?.length ?? 1)} image(s)</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{banner.isActive ? "Active" : "Inactive"}</TableCell>
                        <TableCell>{banner.sortOrder}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{banner.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => router.get(`/hero-banners/${banner.id}/edit`)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(banner.id)}><Trash2 className="h-4 w-4" /></Button>
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
