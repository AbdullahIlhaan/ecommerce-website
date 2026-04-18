import { ChangeEvent, useState, type ReactNode } from "react";
import { router, usePage } from "@inertiajs/react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ImagePlus, Plus, Globe, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type FooterSetting = {
  id: string;
  logoPath: string | null;
  logoText: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  facebookPixelId: string | null;
  copyright: string | null;
  paymentMethods: Array<{ name: string; imagePath: string | null }>;
  socialLinks: Array<{ platform: string; url: string }>;
};

type FooterErrors = Record<string, string | undefined>;

type PaymentMethodForm = {
  name: string;
  imagePath: string | null;
  file?: File;
  preview?: string;
};

export default function FooterSettingsPage() {
  const { footerSetting, errors } = usePage<{ footerSetting: FooterSetting; errors: FooterErrors }>().props;
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(footerSetting.logoPath);
  
  const [form, setForm] = useState({
    logoText: footerSetting.logoText,
    description: footerSetting.description ?? "",
    address: footerSetting.address ?? "",
    phone: footerSetting.phone ?? "",
    email: footerSetting.email ?? "",
    facebookUrl: footerSetting.facebookUrl ?? "",
    youtubeUrl: footerSetting.youtubeUrl ?? "",
    facebookPixelId: footerSetting.facebookPixelId ?? "",
    copyright: footerSetting.copyright ?? "",
    socialLinks: footerSetting.socialLinks ?? [],
    paymentMethods: (footerSetting.paymentMethods ?? []) as PaymentMethodForm[],
  });

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const addSocialLink = () => {
    setForm({
      ...form,
      socialLinks: [...form.socialLinks, { platform: "Facebook", url: "" }],
    });
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...form.socialLinks];
    newLinks.splice(index, 1);
    setForm({ ...form, socialLinks: newLinks });
  };

  const addPaymentMethod = () => {
    setForm({
      ...form,
      paymentMethods: [...form.paymentMethods, { name: "", imagePath: null }],
    });
  };

  const removePaymentMethod = (index: number) => {
    const newMethods = [...form.paymentMethods];
    newMethods.splice(index, 1);
    setForm({ ...form, paymentMethods: newMethods });
  };

  const handlePaymentImageChange = (index: number, file: File) => {
    const newMethods = [...form.paymentMethods];
    newMethods[index].file = file;
    newMethods[index].preview = URL.createObjectURL(file);
    setForm({ ...form, paymentMethods: newMethods });
  };

  const handleSave = () => {
    const data: Record<string, File | string | null> = {
      logo_text: form.logoText,
      description: form.description,
      address: form.address,
      phone: form.phone,
      email: form.email,
      facebook_url: form.facebookUrl,
      youtube_url: form.youtubeUrl,
      facebook_pixel_id: form.facebookPixelId,
      copyright: form.copyright,
      logo: logoFile,
      _method: "post",
    };

    // Prepare social links for multipart form data
    form.socialLinks.forEach((link, index) => {
      data[`social_links[${index}][platform]`] = link.platform;
      data[`social_links[${index}][url]`] = link.url;
    });

    // Prepare payment methods for multipart form data
    form.paymentMethods.forEach((method, index) => {
      if (method.file) {
        data[`payment_methods[${index}][image]`] = method.file;
      }
      data[`payment_methods[${index}][name]`] = method.name;
      data[`payment_methods[${index}][image_path]`] = method.imagePath;
    });

    router.post("/footer-settings", data, {
      forceFormData: true,
      onSuccess: () => toast({ title: "Footer settings updated" }),
      onError: (errs: Record<string, string>) => {
        const errorCount = Object.keys(errs).length;
        toast({ title: `Error updating settings (${errorCount} issues)`, variant: "destructive" });
      }
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Footer Settings" description="Customize your storefront footer" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding & Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Branding & General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20">
                  {logoPreview ? (
                    <img src={logoPreview} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input type="file" accept="image/*" onChange={handleLogoChange} />
                  <p className="mt-1 text-xs text-muted-foreground">Recommended size: 200x200px</p>
                  {errors.logo && <p className="text-xs font-medium text-destructive mt-1">{errors.logo}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoText">Logo Text</Label>
              <Input id="logoText" value={form.logoText} onChange={(e) => setForm({ ...form, logoText: e.target.value })} className={errors.logo_text ? "border-destructive" : ""} />
              {errors.logo_text && <p className="text-xs font-medium text-destructive">{errors.logo_text}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={errors.description ? "border-destructive" : ""} />
              {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="copyright">Copyright Text</Label>
              <Input id="copyright" value={form.copyright} onChange={(e) => setForm({ ...form, copyright: e.target.value })} className={errors.copyright ? "border-destructive" : ""} />
              {errors.copyright && <p className="text-xs font-medium text-destructive">{errors.copyright}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30"><Mail className="h-4 w-4" /></div>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? "border-destructive" : ""} />
              </div>
              {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30"><Phone className="h-4 w-4" /></div>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={errors.phone ? "border-destructive" : ""} />
              </div>
              {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <div className="flex gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30"><MapPin className="h-4 w-4" /></div>
                <Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={errors.address ? "border-destructive" : ""} />
              </div>
              {errors.address && <p className="text-xs font-medium text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook Page URL</Label>
              <Input
                id="facebookUrl"
                placeholder="https://facebook.com/your-page"
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className={errors.facebook_url ? "border-destructive" : ""}
              />
              {errors.facebook_url && <p className="text-xs font-medium text-destructive">{errors.facebook_url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube Channel URL</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://youtube.com/@your-channel"
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                className={errors.youtube_url ? "border-destructive" : ""}
              />
              {errors.youtube_url && <p className="text-xs font-medium text-destructive">{errors.youtube_url}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                placeholder="123456789012345"
                value={form.facebookPixelId}
                onChange={(e) => setForm({ ...form, facebookPixelId: e.target.value })}
                className={errors.facebook_pixel_id ? "border-destructive" : ""}
              />
              {errors.facebook_pixel_id && <p className="text-xs font-medium text-destructive">{errors.facebook_pixel_id}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Social Links</CardTitle>
            <Button variant="outline" size="sm" onClick={addSocialLink}><Plus className="mr-2 h-4 w-4" /> Add Link</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.socialLinks.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No social links added yet.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {form.socialLinks.map((link, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                      <select 
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={link.platform}
                        onChange={(e) => {
                          const newLinks = [...form.socialLinks];
                          newLinks[index].platform = e.target.value;
                          setForm({ ...form, socialLinks: newLinks });
                        }}
                      >
                        <option>Facebook</option>
                        <option>Twitter</option>
                        <option>Instagram</option>
                        <option>Linkedin</option>
                        <option>Github</option>
                        <option>Youtube</option>
                      </select>
                      <Input 
                        placeholder="URL" 
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...form.socialLinks];
                          newLinks[index].url = e.target.value;
                          setForm({ ...form, socialLinks: newLinks });
                        }}
                        className={errors[`social_links.${index}.url`] ? "border-destructive" : ""}
                      />
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeSocialLink(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors[`social_links.${index}.url`] && <p className="text-[10px] font-medium text-destructive px-2">{errors[`social_links.${index}.url`]}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <Button variant="outline" size="sm" onClick={addPaymentMethod}><Plus className="mr-2 h-4 w-4" /> Add Method</Button>
          </CardHeader>
          <CardContent className="space-y-4">
             {form.paymentMethods.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No payment methods added yet.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {form.paymentMethods.map((method, index) => (
                  <div key={index} className="relative rounded-xl border border-border p-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10" 
                      onClick={() => removePaymentMethod(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="mb-3 flex h-12 w-full items-center justify-center rounded-lg bg-muted/20">
                      {method.preview || method.imagePath ? (
                        <img src={method.preview || method.imagePath || undefined} className="h-8 w-auto object-contain" />
                      ) : (
                        <Globe className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Input 
                        placeholder="Method Name (e.g. PayPal)" 
                        value={method.name}
                        onChange={(e) => {
                          const newMethods = [...form.paymentMethods];
                          newMethods[index].name = e.target.value;
                          setForm({ ...form, paymentMethods: newMethods });
                        }}
                        className={errors[`payment_methods.${index}.name`] ? "border-destructive" : ""}
                      />
                      {errors[`payment_methods.${index}.name`] && <p className="text-[10px] font-medium text-destructive mt-1">{errors[`payment_methods.${index}.name`]}</p>}
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePaymentImageChange(index, file);
                        }}
                        className="text-xs"
                      />
                      {errors[`payment_methods.${index}.image`] && <p className="text-[10px] font-medium text-destructive mt-1">{errors[`payment_methods.${index}.image`]}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button size="lg" onClick={handleSave} className="min-w-[150px]">Save Changes</Button>
      </div>
    </div>
  );
}

FooterSettingsPage.layout = (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
