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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Pencil, Trash2, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type HeroBannerForm = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  sortOrder: string;
  isActive: boolean;
  image: File | null;
  imagePreview: string;
};

const emptyForm: HeroBannerForm = {
  title: "",
  subtitle: "",
  buttonLabel: "",
  buttonUrl: "",
  sortOrder: "0",
  isActive: true,
  image: null,
  imagePreview: "",
};

export default function HeroBannersPage() {
  const { heroBanners } = usePage<{ heroBanners: HeroBanner[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [form, setForm] = useState<HeroBannerForm>(emptyForm);

  const filtered = useMemo(
    () => heroBanners.filter((banner) => banner.title.toLowerCase().includes(search.toLowerCase())),
    [heroBanners, search],
  );

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (banner: HeroBanner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      buttonLabel: banner.buttonLabel ?? "",
      buttonUrl: banner.buttonUrl ?? "",
      sortOrder: String(banner.sortOrder ?? 0),
      isActive: banner.isActive,
      image: null,
      imagePreview: banner.imagePath,
    });
    setFormOpen(true);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setForm((current) => ({
      ...current,
      image: file,
      imagePreview: file ? URL.createObjectURL(file) : current.imagePreview,
    }));
  };

  const handleSave = () => {
    if (!form.title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    if (!editing && !form.image) {
      toast({ title: "Banner image is required", variant: "destructive" });
      return;
    }

    const data = {
      title: form.title,
      subtitle: form.subtitle,
      buttonLabel: form.buttonLabel,
      buttonUrl: form.buttonUrl,
      sortOrder: parseInt(form.sortOrder || "0", 10) || 0,
      isActive: form.isActive ? 1 : 0,
      image: form.image,
      _method: editing ? "put" : "post",
    };

    router.post(editing ? `/hero-banners/${editing.id}` : "/hero-banners", data, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: editing ? "Hero banner updated" : "Hero banner created" });
        setFormOpen(false);
        resetForm();
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/hero-banners/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Hero banner deleted" });
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hero Banners" description="Manage homepage hero banners" actionLabel="Add Banner" onAction={openCreate} />
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search hero banners..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm pl-9" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No hero banners" description="Create the first homepage banner" actionLabel="Add Banner" onAction={openCreate} icon={<ImagePlus className="h-8 w-8 text-muted-foreground" />} />
          ) : (
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{banner.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell>{banner.sortOrder}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{banner.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(banner)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(banner.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Hero Banner" : "New Hero Banner"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Button Label</Label>
                <Input value={form.buttonLabel} onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })} />
              </div>
              <div>
                <Label>Button URL</Label>
                <Input value={form.buttonUrl} onChange={(e) => setForm({ ...form, buttonUrl: e.target.value })} placeholder="/products" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Sort Order</Label>
                <Input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="flex items-end gap-3">
                <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
                <Label>Active on homepage</Label>
              </div>
            </div>
            <div>
              <Label>Banner Image {editing ? "" : "*"}</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            {form.imagePreview ? (
              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                <img src={form.imagePreview} alt="Hero banner preview" className="h-56 w-full object-cover" />
              </div>
            ) : null}
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
