import type { ReactNode } from "react";
import { Head } from "@inertiajs/react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function Privacy() {
  return (
    <>
      <Head title="Privacy Policy" />
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-muted-foreground uppercase tracking-widest text-xs font-bold font-mono">Effective Date: April 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black">1. Information Collection</h2>
            <p className="text-muted-foreground">
              We collect information that you directly provide to us, such as when you create an account, update your profile, sign up for a newsletter, or make a purchase.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">2. Information Use</h2>
            <p className="text-muted-foreground">
              The information we collect is used to provide, maintain, and improve our services, as well as to communicate with you, such as for customer support or order updates.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not share your personal information with third parties without your consent, except as required by law or as necessary for the provision of our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">4. Cookies and Similar Technologies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to collect information about your interactions with our platform and to personalize your experience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">5. Data Security</h2>
            <p className="text-muted-foreground">
              We take reasonable measures to protect the personal information we collect, but no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">6. Your Choice</h2>
            <p className="text-muted-foreground">
              You can access, update, or delete your personal information at any time through your account settings or by contacting us directly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">7. Changes to the Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

Privacy.layout = (page: ReactNode) => <StorefrontLayout title="Privacy">{page}</StorefrontLayout>;
