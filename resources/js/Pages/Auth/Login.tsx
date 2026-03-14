import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FlashProps {
  success?: string;
  error?: string;
}

export default function Login() {
  const { flash } = usePage<{ flash: FlashProps }>().props;

  const emailForm = useForm({
    email: "",
    password: "",
    remember: true,
  });

  const phoneForm = useForm({
    phone: "",
    code: "",
  });

  return (
    <>
      <Head title="Login" />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fde6d7,transparent_40%),linear-gradient(180deg,#fcf8f5_0%,#f5efe9_100%)] px-4 py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#ead8d0] bg-white/80 p-8 shadow-[0_30px_80px_-44px_rgba(15,23,42,0.25)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">ShopAdmin Access</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#2f2f35]">Sign in with email, phone, or social login.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#5c534e]">
              Super admins can create and manage all users. Customers can sign in to their account or use social login for quick access.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-primary hover:bg-brand-hover">
                <a href="/auth/google/redirect">Continue with Google</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/auth/facebook/redirect">Continue with Facebook</a>
              </Button>
            </div>

            <div className="mt-10 rounded-2xl border border-dashed border-[#e5c9bd] bg-[#fff8f4] p-5 text-sm text-[#5c534e]">
              Demo users:
              <div className="mt-2 font-mono text-xs leading-6">
                <div>ilhaanazra@gmail.com / password</div>
                <div>admin@example.com / password</div>
                <div>moderator@example.com / password</div>
                <div>customer@example.com / password</div>
              </div>
            </div>
          </div>

          <Card className="border-[#ead8d0] bg-white/90 shadow-[0_30px_80px_-44px_rgba(15,23,42,0.25)]">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Choose how you want to sign in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flash.success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div>}
              {flash.error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{flash.error}</div>}

              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Phone OTP</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={emailForm.data.email} onChange={(e) => emailForm.setData("email", e.target.value)} />
                    {emailForm.errors.email && <p className="text-sm text-destructive">{emailForm.errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={emailForm.data.password} onChange={(e) => emailForm.setData("password", e.target.value)} />
                    {emailForm.errors.password && <p className="text-sm text-destructive">{emailForm.errors.password}</p>}
                  </div>

                  <Button className="w-full" disabled={emailForm.processing} onClick={() => emailForm.post("/login")}>
                    Sign in
                  </Button>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1555000103" value={phoneForm.data.phone} onChange={(e) => phoneForm.setData("phone", e.target.value)} />
                    {phoneForm.errors.phone && <p className="text-sm text-destructive">{phoneForm.errors.phone}</p>}
                  </div>

                  <Button variant="outline" className="w-full" disabled={phoneForm.processing} onClick={() => phoneForm.post("/auth/phone/request", { preserveScroll: true })}>
                    Request Verification Code
                  </Button>

                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input id="code" inputMode="numeric" maxLength={6} value={phoneForm.data.code} onChange={(e) => phoneForm.setData("code", e.target.value)} />
                    {phoneForm.errors.code && <p className="text-sm text-destructive">{phoneForm.errors.code}</p>}
                  </div>

                  <Button className="w-full" disabled={phoneForm.processing} onClick={() => phoneForm.post("/auth/phone/verify", { preserveScroll: true })}>
                    Verify and Sign in
                  </Button>
                </TabsContent>
              </Tabs>

              <p className="text-sm text-muted-foreground">
                Need an account?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Create a customer account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
