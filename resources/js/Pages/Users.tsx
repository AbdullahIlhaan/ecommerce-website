import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Pencil, Shield, Trash2 } from "lucide-react";
import type { AdminUser, RoleOption, UserRole } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

function Users() {
  const { users, roles } = usePage<{ users: AdminUser[]; roles: RoleOption[] }>().props;
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer" as UserRole,
    password: "",
  });

  const filtered = useMemo(() => users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
      || user.email.toLowerCase().includes(search.toLowerCase())
      || (user.phone || "").toLowerCase().includes(search.toLowerCase())
  ), [search, users]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", role: "customer", password: "" });
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, phone: user.phone || "", role: user.role, password: "" });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || (!editing && !form.password)) {
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

    if (editing) {
      router.put(`/users/${editing.id}`, payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast({ title: "User updated" });
          setFormOpen(false);
        },
        onError: (errors) => {
          toast({ title: Object.values(errors)[0] || "Failed to update user", variant: "destructive" });
        },
      });
      return;
    }

    router.post("/users", payload, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "User created" });
        setFormOpen(false);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to create user", variant: "destructive" });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;

    router.delete(`/users/${deleteId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast({ title: "User deleted" });
        setDeleteId(null);
      },
      onError: (errors) => {
        toast({ title: Object.values(errors)[0] || "Failed to delete user", variant: "destructive" });
      },
    });
  };

  return (
    <>
      <Head title="Users" />

      <div className="animate-fade-in">
        <PageHeader title="Users" description="Super admins can create and manage every account in the system." actionLabel="Create User" onAction={openCreate} />

        <Card>
          <CardContent className="p-4">
            <div className="relative mb-4 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="No users found" description="Create the first managed account." actionLabel="Create User" onAction={openCreate} icon={<Shield className="h-8 w-8 text-muted-foreground" />} />
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {filtered.map((user) => (
                    <article key={user.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-sm text-muted-foreground">{user.phone || "Not set"}</div>
                          <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                            {user.role.replace("_", " ")}
                          </span>
                          <div className="text-sm text-muted-foreground">{user.createdAt || "-"}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(user.id)}>
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
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || "Not set"}</TableCell>
                          <TableCell>
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                              {user.role.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell>{user.createdAt || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(user.id)}>
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

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
              <DialogDescription>
                Set account details, contact information, role permissions, and password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{editing ? "New Password" : "Password"}</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Leave blank to keep current password" : ""} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} description="This user account will be permanently deleted." />
      </div>
    </>
  );
}

Users.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Users;
