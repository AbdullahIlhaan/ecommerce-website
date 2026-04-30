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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Coupon } from "@/lib/store";

function CouponsFormPage() {
  const { mode, coupon } = usePage<{ mode: "create" | "edit"; coupon: Coupon | null }>().props;
  const isEditing = mode === "edit" && coupon !== null;
  const [form, setForm] = useState({
    code: coupon?.code ?? "",
    type: coupon?.type ?? ("percentage" as Coupon["type"]),
    value: coupon ? String(coupon.value) : "",
    startDate: coupon?.startDate ?? "",
    endDate: coupon?.endDate ?? "",
    usageLimit: coupon ? String(coupon.usageLimit) : "",
    status: coupon?.status ?? ("active" as Coupon["status"]),
  });

  const handleSubmit = () => {
    if (!form.code || !form.value) {
      toast({ title: "Code and value are required", variant: "destructive" });
      return;
    }

    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: parseInt(form.usageLimit, 10) || 0,
      status: form.status,
    };

    if (isEditing) {
      router.put(`/coupons/${coupon.id}`, payload, {
        onSuccess: () => toast({ title: "Coupon updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save coupon", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/coupons", payload, {
      onSuccess: () => toast({ title: "Coupon created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save coupon", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Coupon" : "Create Coupon"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Coupon" : "New Coupon"} description="Set coupon code, discount rules, validity window, usage limits, and status.">
          <Button variant="outline" onClick={() => router.get("/coupons")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Coupons
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="font-mono uppercase" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value as Coupon["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Value *</Label>
                <Input type="number" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Coupon["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/coupons")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Coupon" : "Create Coupon"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

CouponsFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default CouponsFormPage;
