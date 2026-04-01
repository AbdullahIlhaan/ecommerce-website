import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SocialLoginButtons from "@/components/shared/SocialLoginButtons";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

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
      <Head title="Login | FutureBD" />

      <div className="safe-top min-h-screen bg-background px-4 py-8 md:py-16 selection:bg-primary/20">
        {/* Background Accents */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {/* Left Panel: Content & Value Prop (Hidden on Mobile) */}
          <div className="hidden lg:flex flex-col justify-center">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 active:scale-95 transition-transform w-fit">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-lg font-black text-white shadow-xl">
                <img src="/images/logofbd.jpeg" alt="FutureBD" className="h-full w-full rounded-2xl object-cover" />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">FutureBD</span>
            </Link>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary animate-fade-in">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome Back
              </div>
              
              <h1 className="text-fluid-display font-black tracking-tight text-foreground leading-[1.1]">
                Your gateway to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f26522] to-[#a12863]">Smart Shopping.</span>
              </h1>
              
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Join thousands of shoppers enjoying cross-border trade with ease, security, and the best support in the industry.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                {[
                  { icon: ShieldCheck, text: "Secure Authentication", sub: "AES-256 Encrypted" },
                  { icon: Zap, text: "Instant Access", sub: "Social Login Enabled" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{item.text}</div>
                      <div className="text-xs text-muted-foreground">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Notice */}
            <div className="mt-12 p-6 rounded-[2rem] border border-dashed border-primary/20 bg-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Developer Preview</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground font-mono">
                    <div className="flex flex-col"><span className="text-foreground font-bold">Admin:</span> admin@example.com</div>
                    <div className="flex flex-col"><span className="text-foreground font-bold">Pass:</span> password</div>
                    <div className="flex flex-col"><span className="text-foreground font-bold">Customer:</span> customer@example.com</div>
                    <div className="flex flex-col"><span className="text-foreground font-bold">Pass:</span> password</div>
                </div>
            </div>
          </div>

          {/* Right Panel: Login Card */}
          <div className="flex flex-col justify-center">
            {/* Mobile Logo (Shown only on small screens) */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 active:scale-95 transition-transform">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-white shadow-lg overflow-hidden">
                  <img src="/images/logofbd.jpeg" alt="FutureBD" className="h-full w-full object-cover" />
                </div>
                <span className="text-xl font-black tracking-tight text-foreground">FutureBD</span>
              </Link>
            </div>

            <Card className="border-border bg-card/50 shadow-2xl backdrop-blur-md rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-10 px-8">
                <CardTitle className="text-2xl font-black tracking-tight">Sign In</CardTitle>
                <CardDescription className="text-base">Enter your details to access your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-10 px-8">
                {flash.success && (
                  <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-success text-sm font-medium animate-fade-in">
                    {flash.success}
                  </div>
                )}
                {flash.error && (
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-fade-in">
                    {flash.error}
                  </div>
                )}

                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 px-2 py2 bg-muted rounded-2xl mb-6">
                    <TabsTrigger value="email" className="rounded-xl font-bold py-2.5">Email</TabsTrigger>
                    <TabsTrigger value="phone" className="rounded-xl font-bold py-2.5">Phone</TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-bold text-foreground">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@example.com"
                        className="rounded-xl h-12 bg-background border-border"
                        value={emailForm.data.email} 
                        onChange={(e) => emailForm.setData("email", e.target.value)} 
                      />
                      {emailForm.errors.email && <p className="text-xs font-medium text-destructive">{emailForm.errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="font-bold text-foreground">Password</Label>
                        <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="rounded-xl h-12 bg-background border-border"
                        value={emailForm.data.password} 
                        onChange={(e) => emailForm.setData("password", e.target.value)} 
                      />
                      {emailForm.errors.password && <p className="text-xs font-medium text-destructive">{emailForm.errors.password}</p>}
                    </div>

                    <Button 
                      className="w-full h-12 rounded-xl text-base font-black tracking-tight bg-gradient-to-r from-[#f26522] to-[#a12863] hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" 
                      disabled={emailForm.processing} 
                      onClick={() => emailForm.post("/login")}
                    >
                      Continue with Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TabsContent>

                  <TabsContent value="phone" className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-bold text-foreground">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+880 1234 567890" 
                        className="rounded-xl h-12 bg-background border-border"
                        value={phoneForm.data.phone} 
                        onChange={(e) => phoneForm.setData("phone", e.target.value)} 
                      />
                      {phoneForm.errors.phone && <p className="text-xs font-medium text-destructive">{phoneForm.errors.phone}</p>}
                    </div>

                    <Button 
                        variant="secondary" 
                        className="w-full h-12 rounded-xl font-bold border-border" 
                        disabled={phoneForm.processing} 
                        onClick={() => phoneForm.post("/auth/phone/request", { preserveScroll: true })}
                    >
                      Get Verification Code
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor="code" className="font-bold text-foreground">6-Digit Code</Label>
                      <Input 
                        id="code" 
                        placeholder="000000"
                        className="rounded-xl h-12 bg-background border-border text-center text-lg tracking-[0.5em] font-mono"
                        maxLength={6} 
                        value={phoneForm.data.code} 
                        onChange={(e) => phoneForm.setData("code", e.target.value)} 
                      />
                      {phoneForm.errors.code && <p className="text-xs font-medium text-destructive">{phoneForm.errors.code}</p>}
                    </div>

                    <Button 
                        className="w-full h-12 rounded-xl text-base font-black tracking-tight bg-gradient-to-r from-[#f26522] to-[#a12863] hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" 
                        disabled={phoneForm.processing} 
                        onClick={() => phoneForm.post("/auth/phone/verify", { preserveScroll: true })}
                    >
                      Verify & Sign In
                      <ShieldCheck className="ml-2 h-4 w-4" />
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-black tracking-widest">OR</span>
                  </div>
                </div>

                <SocialLoginButtons label="Continue with" />

                <div className="pt-4 text-center">
                   <p className="text-sm text-muted-foreground font-medium">
                    New to FutureBD?{" "}
                    <Link href="/register" className="font-black text-primary hover:underline">
                      Create an account
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-center gap-6 text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
