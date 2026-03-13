import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Register() {
  const form = useForm({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  return (
    <>
      <Head title="Register" />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6d7,transparent_40%),linear-gradient(180deg,#fcf8f5_0%,#f5efe9_100%)] px-4 py-10">
        <Card className="mx-auto max-w-xl border-[#ead8d0] bg-white/90 shadow-[0_30px_80px_-44px_rgba(15,23,42,0.25)]">
          <CardHeader>
            <CardTitle>Create customer account</CardTitle>
            <CardDescription>Use email/password now and phone OTP later if you save your phone number.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} />
              {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} />
              {form.errors.email && <p className="text-sm text-destructive">{form.errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={form.data.phone} onChange={(e) => form.setData("phone", e.target.value)} />
              {form.errors.phone && <p className="text-sm text-destructive">{form.errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input id="register-password" type="password" value={form.data.password} onChange={(e) => form.setData("password", e.target.value)} />
              {form.errors.password && <p className="text-sm text-destructive">{form.errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password-confirmation">Confirm Password</Label>
              <Input id="register-password-confirmation" type="password" value={form.data.password_confirmation} onChange={(e) => form.setData("password_confirmation", e.target.value)} />
            </div>

            <Button className="w-full" disabled={form.processing} onClick={() => form.post("/register")}>
              Create account
            </Button>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
