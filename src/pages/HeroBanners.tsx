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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Pencil, Trash2, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const REQUIRED_BANNER_WIDTH = 2000;
const REQUIRED_BANNER_HEIGHT = 720;
const REQUIRED_BANNER_MIME = "image/webp";

type HeroBannerForm = {
  sortOrder: string;
  isActive: boolean;
  images: File[];
  imagePreviews: string[];
};

const emptyForm: HeroBannerForm = {
  sortOrder: "0",
  isActive: true,
  images: [],
  imagePreviews: [],
};

export default function HeroBannersPage() {
  const { heroBanners } = usePage<{ heroBanners: HeroBanner[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [form, setForm] = useState<HeroBannerForm>(emptyForm);

  const filtered = useMemo(
    () => heroBanners.filter((banner) => 
      banner.title.toLowerCase().includes(search.toLowerCase()) || 
      String(banner.sortOrder).includes(search)
    ),
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
      sortOrder: String(banner.sortOrder ?? 0),
      isActive: banner.isActive,
      images: [],
      imagePreviews: banner.imagePaths && banner.imagePaths.length > 0 ? banner.imagePaths : [banner.imagePath],
    });
    setFormOpen(true);
  };

  const readImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
        URL.revokeObjectURL(objectUrl);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Unable to read image dimensions for ${file.name}`));
      };

      image.src = objectUrl;
    });

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (file.type !== REQUIRED_BANNER_MIME || extension !== "webp") {
        event.target.value = "";
        toast({
          title: "Only .webp banner images are allowed",
          description: `Upload ${REQUIRED_BANNER_WIDTH} x ${REQUIRED_BANNER_HEIGHT} .webp images only.`,
          variant: "destructive",
        });
        return;
      }

      try {
        const { width, height } = await readImageDimensions(file);

        if (width !== REQUIRED_BANNER_WIDTH || height !== REQUIRED_BANNER_HEIGHT) {
          event.target.value = "";
          toast({
            title: "Invalid banner resolution",
            description: `Banner images must be exactly ${REQUIRED_BANNER_WIDTH} x ${REQUIRED_BANNER_HEIGHT} pixels.`,
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        event.target.value = "";
        toast({
          title: error instanceof Error ? error.message : "Unable to validate banner image",
          variant: "destructive",
        });
        return;
      }
    }

    // Revoke old object URLs to avoid memory leaks
    form.imagePreviews.forEach(preview => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    });

    setForm((current) => ({
      ...current,
      images: files,
      imagePreviews: files.map((file) => URL.createObjectURL(file)),
    }));
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const newImages = [...current.images];
      const newPreviews = [...current.imagePreviews];
      
      if (newPreviews[index].startsWith("blob:")) {
        URL.revokeObjectURL(newPreviews[index]);
      }
      
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      
      return {
        ...current,
        images: newImages,
        imagePreviews: newPreviews,
      };
    });
  };

  const handleSave = () => {
    if (!editing && form.images.length === 0) {
      toast({ title: "At least one banner image is required", variant: "destructive" });
      return;
    }

    const data = {
      title: "Hero Banner", // Generic fallback if backend requires it
      sortOrder: parseInt(form.sortOrder || "0", 10) || 0,
      isActive: form.isActive ? 1 : 0,
      images: form.images,
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
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save hero banner", variant: "destructive" });
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
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete hero banner", variant: "destructive" });
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Hero Banners" description="Manage homepage hero banners" actionLabel="Add Banner" onAction={openCreate} />
      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search hero banners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No hero banners" description="Create the first homepage banner" actionLabel="Add Banner" onAction={openCreate} icon={<ImagePlus className="h-8 w-8 text-muted-foreground" />} />
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
                        <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}><Pencil className="h-4 w-4" /></Button>
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
                          <Button variant="ghost" size="icon" onClick={() => openEdit(banner)}><Pencil className="h-4 w-4" /></Button>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[94svh] overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
            <DialogTitle>{editing ? "Edit Hero Banner" : "New Hero Banner"}</DialogTitle>
            <DialogDescription>
              Upload banner images, then set homepage visibility and display order.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-4 pb-1">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="banner-sort">Sort Order</Label>
                <Input id="banner-sort" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                <p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first in the slideshow.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 md:mt-6">
                <Switch id="banner-active" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
                <Label htmlFor="banner-active" className="cursor-pointer">Active on homepage</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="banner-images">Banner Images {editing ? "" : "*"}</Label>
              <Input id="banner-images" type="file" accept=".webp,image/webp" multiple onChange={handleImageChange} className="cursor-pointer" />
              <p className="mt-2 text-xs font-semibold text-destructive">
                Required: exact {REQUIRED_BANNER_WIDTH} x {REQUIRED_BANNER_HEIGHT}px resolution and `.webp` format only.
              </p>
            </div>
            {form.imagePreviews.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {form.imagePreviews.map((imagePreview, index) => (
                  <div key={imagePreview} className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/20">
                    <img src={imagePreview} alt="Hero banner preview" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-[10px] text-white">Preview Image {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
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
