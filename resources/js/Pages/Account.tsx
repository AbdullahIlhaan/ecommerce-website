import type { ReactNode } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthUser } from "@/lib/store";

function Account() {
  const { auth, flash } = usePage<{ auth: { user: AuthUser }; flash: { success?: string; error?: string } }>().props;
  const user = auth.user;
  const emailForm = useForm({});
  const phoneForm = useForm({
    code: "",
  });

  return (
    <>
      <Head title="Account" />

      <div className="space-y-6">
        {flash.success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div>}
        {flash.error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{flash.error}</div>}

        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.name}. Your current role controls which parts of the dashboard you can use.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="font-medium">Name:</span> {user.name}</div>
              <div><span className="font-medium">Email:</span> {user.email || "Not set"}</div>
              <div><span className="font-medium">Phone:</span> {user.phone || "Not set"}</div>
              <div><span className="font-medium">Role:</span> {user.role.replace("_", " ")}</div>
              <div>
                <span className="font-medium">Email Verification:</span>{" "}
                {user.emailVerifiedAt ? `Verified at ${user.emailVerifiedAt}` : "Not verified"}
              </div>
              <div>
                <span className="font-medium">Phone Verification:</span>{" "}
                {user.phoneVerifiedAt ? `Verified at ${user.phoneVerifiedAt}` : "Not verified"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="text-sm font-medium">Email Verification</div>
                <div className="text-sm text-muted-foreground">
                  {user.emailVerifiedAt
                    ? "Your email is already verified."
                    : "Send a signed verification link to your current email address."}
                </div>
                <Button
                  variant="outline"
                  disabled={!user.email || !!user.emailVerifiedAt || emailForm.processing}
                  onClick={() => emailForm.post("/email/verification-notification", { preserveScroll: true })}
                >
                  Send Email Verification Link
                </Button>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium">Phone Verification</div>
                <div className="text-sm text-muted-foreground">
                  {user.phoneVerifiedAt
                    ? "Your phone number is already verified."
                    : "Request a 6-digit code and submit it here to verify your phone number."}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" disabled={!user.phone || !!user.phoneVerifiedAt} onClick={() => phoneForm.post("/phone/verification/request", { preserveScroll: true })}>
                    Request Phone Verification Code
                  </Button>
                </div>
                {!user.phoneVerifiedAt && (
                  <div className="max-w-sm space-y-2">
                    <Label htmlFor="phone-verification-code">Verification Code</Label>
                    <Input id="phone-verification-code" value={phoneForm.data.code} onChange={(event) => phoneForm.setData("code", event.target.value)} />
                    {phoneForm.errors.code && <p className="text-sm text-destructive">{phoneForm.errors.code}</p>}
                    <Button disabled={phoneForm.processing} onClick={() => phoneForm.post("/phone/verification/verify", { preserveScroll: true })}>
                      Verify Phone Number
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
              {user.canAccessAdminPanel && (
                <Button asChild>
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
              )}
              {user.isSuperAdmin && (
                <Button asChild variant="outline">
                  <Link href="/users">Manage Users</Link>
                </Button>
              )}
              <Button asChild variant="secondary">
                <Link href="/">Back to Home</Link>
              </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

Account.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default Account;
