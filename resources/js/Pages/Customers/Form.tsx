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
import type { Customer } from "@/lib/store";

function CustomersFormPage() {
  const { mode, customer } = usePage<{ mode: "create" | "edit"; customer: Customer | null }>().props;
  const isEditing = mode === "edit" && customer !== null;
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    status: customer?.status ?? ("active" as Customer["status"]),
  });

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }

    if (isEditing) {
      router.put(`/customers/${customer.id}`, form, {
        onSuccess: () => toast({ title: "Customer updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save customer", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/customers", form, {
      onSuccess: () => toast({ title: "Customer created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save customer", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit Customer" : "Create Customer"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit Customer" : "New Customer"} description="Enter customer contact details and account status.">
          <Button variant="outline" onClick={() => router.get("/customers")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as Customer["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/customers")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update Customer" : "Create Customer"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

CustomersFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default CustomersFormPage;
