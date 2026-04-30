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
import type { AdminUser, RoleOption, UserRole } from "@/lib/store";

function UsersFormPage() {
  const { mode, userRecord, roles } = usePage<{
    mode: "create" | "edit";
    userRecord: AdminUser | null;
    roles: RoleOption[];
  }>().props;

  const isEditing = mode === "edit" && userRecord !== null;
  const [form, setForm] = useState({
    name: userRecord?.name ?? "",
    email: userRecord?.email ?? "",
    phone: userRecord?.phone ?? "",
    role: (userRecord?.role ?? "customer") as UserRole,
    password: "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.email || (!isEditing && !form.password)) {
      toast({ title: "Name, email, and password are required", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      role: form.role,
      password: form.password || undefined,
    };

    if (isEditing) {
      router.put(`/users/${userRecord.id}`, payload, {
        onSuccess: () => toast({ title: "User updated" }),
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to save user", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/users", payload, {
      onSuccess: () => toast({ title: "User created" }),
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to save user", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title={isEditing ? "Edit User" : "Create User"} />

      <div className="animate-fade-in">
        <PageHeader title={isEditing ? "Edit User" : "New User"} description="Set account details, contact information, role permissions, and password.">
          <Button variant="outline" onClick={() => router.get("/users")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
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
              <Label>Phone Number</Label>
              <Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isEditing ? "New Password" : "Password *"}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={isEditing ? "Leave blank to keep current password" : ""}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => router.get("/users")}>Cancel</Button>
              <Button onClick={handleSubmit}>{isEditing ? "Update User" : "Create User"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

UsersFormPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default UsersFormPage;
