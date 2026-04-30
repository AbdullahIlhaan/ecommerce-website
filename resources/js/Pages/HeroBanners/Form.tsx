import { ChangeEvent, type ReactNode, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { HeroBanner } from "@/lib/store";

const REQUIRED_BANNER_WIDTH = 2000;
const REQUIRED_BANNER_HEIGHT = 720;
const REQUIRED_BANNER_MIME = "image/webp";

function HeroBannersFormPage() {
  const { mode, heroBanner } = usePage<{
    mode: "create" | "edit";
    heroBanner: HeroBanner | null;
  }>().props;

  const isEditing = mode === "edit" && heroBanner !== null;
  const [form, setForm] = useState({
    title: heroBanner?.title ?? "Hero Banner",
    subtitle: heroBanner?.subtitle ?? "",
    buttonLabel: heroBanner?.buttonLabel ?? "",
    buttonUrl: heroBanner?.buttonUrl ?? "",
    sortOrder: String(heroBanner?.sortOrder ?? 0),
    isActive: heroBanner?.isActive ?? true,
    images: [] as File[],
    imagePreviews: heroBanner?.imagePaths?.length ? heroBanner.imagePaths : [],
  });

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
        toast({
          title: "Only .webp banner images are allowed",
          description: `Upload ${REQUIRED_BANNER_WIDTH} x ${REQUIRED_BANNER_HEIGHT} .webp images only.`,
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }

      try {
        const { width, height } = await readImageDimensions(file);
        if (width !== REQUIRED_BANNER_WIDTH || height !== REQUIRED_BANNER_HEIGHT) {
          toast({
            title: "Invalid banner resolution",
            description: `Banner images must be exactly ${REQUIRED_BANNER_WIDTH} x ${REQUIRED_BANNER_HEIGHT} pixels.`,
            variant: "destructive",
          });
          event.target.value = "";
          return;
        }
      } catch (error) {
        toast({ title: error instanceof Error ? error.message : "Unable to validate banner image", variant: "destructive" });
        event.target.value = "";
        return;
      }
    }

    form.imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    });

    setForm({
      ...form,
      images: files,
      imagePreviews: files.map((file) => URL.createObjectURL(file)),
    });
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const imagePreviews = [...current.imagePreviews];
      const images = [...current.images];
      if (imagePreviews[index]?.startsWith("blob:")) URL.revokeObjectURL(imagePreviews[index]);
      imagePreviews.splice(index, 1);
      images.splice(index, 1);
      return { ...current, imagePreviews, images };
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Banner title is required", variant: "destructive" });
      return;
    }

    if (!isEditing && form.images.length === 0) {
      toast({ title: "At least one banner image is required", variant: "destructive" });
      return;
    }

    router.post(isEditing ? `/hero-banners/${heroBanner.id}` : "/hero-banners", {
      title: form.title,
      subtitle: form.subtitle,
      buttonLabel: form.buttonLabel,
      buttonUrl: form.buttonUrl,
      sortOrder: parseInt(form.sortOrder || "0", 10) || 0,
      isActive: form.isActive ? 1 : 0,
      images: form.images,
      _method: isEditing ? "put" : "post",
    }, {
      forceFormData: true,
      onSuccess: () => toast({ title: isEditing ? "Hero banner updated" : "Hero banner created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save hero banner", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Hero Banner" : "Create Hero Banner"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Hero Banner" : "New Hero Banner"} description="Upload banner images, then set homepage visibility and display order.">
          <Button variant="outline" onClick={() => router.get("/hero-banners")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Hero Banners
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea rows={3} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Button Label</Label>
                <Input value={form.buttonLabel} onChange={(event) => setForm({ ...form, buttonLabel: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Button URL</Label>
                <Input value={form.buttonUrl} onChange={(event) => setForm({ ...form, buttonUrl: event.target.value })} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <div>
                <div className="font-semibold">Active on homepage</div>
                <div className="text-sm text-muted-foreground">Lower numbers appear earlier in the banner rotation.</div>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>

            <div className="space-y-2">
              <Label>Banner Images {isEditing ? "" : "*"}</Label>
              <Input type="file" accept=".webp,image/webp" multiple onChange={handleImageChange} className="cursor-pointer" />
              <p className="text-xs font-semibold text-destructive">
                Required: exact {REQUIRED_BANNER_WIDTH} x {REQUIRED_BANNER_HEIGHT}px resolution and `.webp` format only.
              </p>
            </div>

            {form.imagePreviews.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {form.imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                    <img src={preview} alt={`Banner preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/hero-banners")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Banner" : "Create Banner"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

HeroBannersFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default HeroBannersFormPage;
