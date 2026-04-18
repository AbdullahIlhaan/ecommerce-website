import type { ReactNode } from "react";
import { Head } from "@inertiajs/react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function Terms() {
  return (
    <>
      <Head title="Terms and Conditions" />
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight">Terms and Conditions</h1>
            <p className="mt-2 text-muted-foreground uppercase tracking-widest text-xs font-bold font-mono">Last Updated: April 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black">1. Content Ownership</h2>
            <p className="text-muted-foreground">
              By using our service, you agree that all content provided by FutureBD, including text, graphics, logos, and images, is the property of FutureBD and protected by international copyright laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">2. User Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to engage in any activity that interferes with or disrupts the service or the servers and networks connected to the service. Any unauthorized use of the platform is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">3. Product Descriptions</h2>
            <p className="text-muted-foreground">
              We strive to provide accurate descriptions of the products on our platform. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or error-free.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">4. Liability</h2>
            <p className="text-muted-foreground">
              FutureBD shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service or for cost of procurement of substitute goods and services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">5. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

Terms.layout = (page: ReactNode) => <StorefrontLayout title="Terms">{page}</StorefrontLayout>;
