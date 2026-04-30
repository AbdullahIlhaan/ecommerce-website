import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Search, Languages, Pencil, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

function TranslationsPage() {
  const { translations, groups } = usePage<{
    translations: TranslationRecord[];
    groups: string[];
  }>().props;

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => translations.filter((translation) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = normalizedSearch.length === 0
      || translation.key.toLowerCase().includes(normalizedSearch)
      || (translation.group || "").toLowerCase().includes(normalizedSearch)
      || translation.englishText.toLowerCase().includes(normalizedSearch)
      || translation.banglaText.toLowerCase().includes(normalizedSearch)
      || (translation.notes || "").toLowerCase().includes(normalizedSearch);

    const matchesGroup = groupFilter === "all" || (translation.group || "ungrouped") === groupFilter;
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "active" && translation.isActive)
      || (statusFilter === "inactive" && !translation.isActive);

    return matchesSearch && matchesGroup && matchesStatus;
  }), [groupFilter, search, statusFilter, translations]);

  const handleDelete = () => {
    if (!deleteId) {
      return;
    }

    router.delete(`/translations/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "Translation deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete translation", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title="Translations" />

      <div className="animate-fade-in">
        <PageHeader
          title="Translations"
          description="Manage manual English and Bangla interface copy for the storefront. Admins can update wording at any time without relying on machine translation."
          actionLabel="Add Translation"
          onAction={() => router.get("/translations/create")}
        />

        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="space-y-4 p-4">
            <div>
              <h2 className="text-base font-semibold">Categories and brands use manual content keys too</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                When you add a new category or brand, create a matching translation entry here using its slug.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-primary/70">Category example</div>
                <div className="mt-2 rounded-xl bg-muted px-3 py-2 font-mono text-xs">content.category.electronics.name</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-primary/70">Brand example</div>
                <div className="mt-2 rounded-xl bg-muted px-3 py-2 font-mono text-xs">content.brand.apple.name</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep the English text the same as the current item name, then add the Bangla wording in the Bangla field. The storefront will automatically use that Bangla value when Bangla is selected.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search keys, groups, or copy..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  <SelectItem value="ungrouped">Ungrouped</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="No translations found"
                description="Add the first translation entry or adjust your filters."
                actionLabel="Add Translation"
                onAction={() => router.get("/translations/create")}
                icon={<Languages className="h-8 w-8 text-muted-foreground" />}
              />
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filtered.map((translation) => (
                    <article key={translation.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-3">
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-primary/70">
                              {translation.group || "ungrouped"}
                            </div>
                            <div className="mt-1 break-all font-semibold">{translation.key}</div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">English</div>
                              <div>{translation.englishText}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bangla</div>
                              <div>{translation.banglaText || "English fallback"}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className={`rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${translation.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                              {translation.isActive ? "Active" : "Inactive"}
                            </span>
                            <span>{translation.updatedAt || "-"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => router.get(`/translations/${translation.id}/edit`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(translation.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>English</TableHead>
                        <TableHead>Bangla</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((translation) => (
                        <TableRow key={translation.id}>
                          <TableCell className="max-w-[18rem] font-mono text-xs break-all">{translation.key}</TableCell>
                          <TableCell>{translation.group || "ungrouped"}</TableCell>
                          <TableCell className="max-w-[20rem] whitespace-normal">{translation.englishText}</TableCell>
                          <TableCell className="max-w-[20rem] whitespace-normal">{translation.banglaText || "English fallback"}</TableCell>
                          <TableCell>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${translation.isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                              {translation.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>{translation.updatedAt || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => router.get(`/translations/${translation.id}/edit`)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(translation.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        <ConfirmModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          description="This translation entry will be permanently deleted."
        />
      </div>
    </>
  );
}

TranslationsPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TranslationsPage;
