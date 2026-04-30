import type { ReactNode } from "react";
import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

type TranslationRecord = {
  id: number;
  key: string;
  group: string | null;
  englishText: string;
  banglaText: string;
  notes: string | null;
  isActive: boolean;
  updatedAt: string | null;
};

function TranslationsFormPage() {
  const { mode, translation, tableMissing } = usePage<{
    mode: "create" | "edit";
    translation: TranslationRecord | null;
    tableMissing: boolean;
  }>().props;

  const isEditing = mode === "edit" && translation !== null;
  const [form, setForm] = useState({
    key: translation?.key ?? "",
    group: translation?.group ?? "",
    englishText: translation?.englishText ?? "",
    banglaText: translation?.banglaText ?? "",
    notes: translation?.notes ?? "",
    isActive: translation?.isActive ?? true,
  });

  const handleSubmit = () => {
    if (tableMissing) {
      toast({ title: "The translations table is missing", variant: "destructive" });
      return;
    }

    if (!form.key.trim() || !form.englishText.trim()) {
      toast({ title: "Key and English text are required", variant: "destructive" });
      return;
    }

    const payload = {
      key: form.key.trim(),
      group: form.group.trim() || null,
      englishText: form.englishText.trim(),
      banglaText: form.banglaText.trim() || null,
      notes: form.notes.trim() || null,
      isActive: form.isActive,
    };

    if (isEditing) {
      router.put(`/translations/${translation.id}`, payload, {
        onSuccess: () => toast({ title: "Translation updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save translation", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/translations", payload, {
      onSuccess: () => toast({ title: "Translation created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save translation", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Translation" : "Create Translation"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Translation" : "New Translation"} description="Update translation key metadata, localized copy, notes, and activation state.">
          <Button variant="outline" onClick={() => router.get("/translations")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Translations
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Translation Key</Label>
                <Input value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value })} placeholder="storefront.header.support_center" />
                <p className="text-xs text-muted-foreground">Use letters, numbers, dots, underscores, and hyphens only.</p>
              </div>
              <div className="space-y-2">
                <Label>Group</Label>
                <Input value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })} placeholder="storefront" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>English Text</Label>
              <Textarea rows={4} value={form.englishText} onChange={(event) => setForm({ ...form, englishText: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Bangla Text</Label>
              <Textarea
                rows={4}
                value={form.banglaText}
                onChange={(event) => setForm({ ...form, banglaText: event.target.value })}
                style={{ fontFamily: "\"Hind Siliguri\", system-ui, sans-serif" }}
              />
              <p className="text-xs text-muted-foreground">Leave blank to fall back to the English copy.</p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional context for admins and content editors." />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-4 py-3">
              <div>
                <div className="font-semibold">Active translation</div>
                <div className="text-sm text-muted-foreground">Inactive entries stay in the dashboard but stop overriding storefront copy.</div>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/translations")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Translation" : "Create Translation"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

TranslationsFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TranslationsFormPage;
