import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SocialLoginButtons from "@/components/shared/SocialLoginButtons";
import type { SocialAuthState } from "@/lib/social-auth";
import { Sparkles, ArrowRight, Gift, ShoppingBag, Globe } from "lucide-react";

export default function Register() {
  const { socialAuth } = usePage<{ socialAuth: SocialAuthState }>().props;
  const hasSocialAuth = socialAuth.providers.length > 0;
  const form = useForm({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  return (
    <>
      <Head title="Create Account | FutureBD" />

      <div className="safe-top min-h-screen bg-background px-4 py-8 md:py-16 selection:bg-primary/20">
        {/* Background Accents */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left Panel: Content & Value Prop */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
             <div className="hidden lg:block">
                <Link href="/" className="mb-8 inline-flex items-center gap-3 active:scale-95 transition-transform w-fit">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-lg font-black text-white shadow-xl">
                        <img src="/images/logofbd.jpeg" alt="FutureBD" className="h-full w-full rounded-2xl object-cover" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-foreground">FutureBD</span>
                </Link>

                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary animate-fade-in">
                        <Gift className="h-3.5 w-3.5" />
                        New Member Perk
                    </div>
                    
                    <h1 className="text-fluid-display font-black tracking-tight text-foreground leading-[1.1]">
                        Join the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f26522] to-[#a12863]">Global Marketplace.</span>
                    </h1>
                    
                    <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                        Create an account to start your journey. Access exclusive deals, track your global orders, and manage your shopping profile.
                    </p>

                    <div className="space-y-4 pt-4">
                        {[
                        { icon: ShoppingBag, text: "Curated Collections", color: "text-blue-500" },
                        { icon: Globe, text: "Cross-Border Reliability", color: "text-emerald-500" },
                        { icon: Sparkles, text: "Early Access to Flash Sales", color: "text-amber-500" }
                        ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card border border-border shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-foreground transition-colors group-hover:text-primary">{item.text}</span>
                        </div>
                        ))}
                    </div>
                </div>
             </div>

             {/* Mobile Brand Header */}
             <div className="lg:hidden mb-8 text-center flex flex-col items-center">
                <Link href="/" className="inline-flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f26522] to-[#a12863] text-white font-black">
                        <img src="/images/logofbd.jpeg" alt="FBD" className="h-full w-full rounded-xl object-cover" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-foreground text-center">FutureBD</span>
                </Link>
                <h2 className="text-2xl font-black tracking-tight">Create your account</h2>
                <p className="text-sm text-muted-foreground mt-1">Start your smart shopping experience today</p>
             </div>
          </div>

          {/* Right Panel: Register Form Card */}
          <div className="flex flex-col justify-center order-1 lg:order-2">
            <Card className="border-border bg-card/50 shadow-2xl backdrop-blur-md rounded-[2.5rem] overflow-hidden">
              <CardHeader className="pt-10 px-8 lg:px-10">
                <CardTitle className="text-2xl font-black tracking-tight">Register</CardTitle>
                <CardDescription className="text-base text-balance">The fastest way to start shopping globally.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-10 px-8 lg:px-10">
                
                {/* Social register buttons at the top */}
                {hasSocialAuth && (
                  <>
                    <SocialLoginButtons label="Sign up with" providers={socialAuth.providers} />

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-black tracking-widest">OR USE EMAIL</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="grid gap-5">
                   <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold text-foreground">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      className="rounded-xl h-12 bg-background border-border focus-visible:ring-primary"
                      value={form.data.name} 
                      onChange={(e) => form.setData("name", e.target.value)} 
                    />
                    {form.errors.name && <p className="text-xs font-medium text-destructive">{form.errors.name}</p>}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-bold text-foreground">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="john@example.com"
                            className="rounded-xl h-12 bg-background border-border"
                            value={form.data.email} 
                            onChange={(e) => form.setData("email", e.target.value)} 
                        />
                        {form.errors.email && <p className="text-xs font-medium text-destructive">{form.errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-bold text-foreground">Phone</Label>
                        <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+880..." 
                            className="rounded-xl h-12 bg-background border-border"
                            value={form.data.phone} 
                            onChange={(e) => form.setData("phone", e.target.value)} 
                        />
                        {form.errors.phone && <p className="text-xs font-medium text-destructive">{form.errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="register-password" className="font-bold text-foreground">Password</Label>
                        <Input 
                            id="register-password" 
                            type="password" 
                            placeholder="••••••••"
                            className="rounded-xl h-12 bg-background border-border"
                            value={form.data.password} 
                            onChange={(e) => form.setData("password", e.target.value)} 
                        />
                        {form.errors.password && <p className="text-xs font-medium text-destructive">{form.errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-password-confirmation" className="font-bold text-foreground">Confirm</Label>
                        <Input 
                            id="register-password-confirmation" 
                            type="password" 
                            placeholder="••••••••"
                            className="rounded-xl h-12 bg-background border-border"
                            value={form.data.password_confirmation} 
                            onChange={(e) => form.setData("password_confirmation", e.target.value)} 
                        />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                    <Button 
                        className="w-full h-12 rounded-xl text-base font-black tracking-tight bg-gradient-to-r from-[#f26522] to-[#a12863] hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" 
                        disabled={form.processing} 
                        onClick={() => form.post("/register")}
                    >
                        Create My Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                        By signing up, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                </div>

                <div className="pt-4 text-center border-t border-border/50">
                   <p className="text-sm text-muted-foreground font-medium">
                    Already have an account?{" "}
                    <Link href="/login" className="font-black text-primary hover:underline">
                      Sign in here
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
