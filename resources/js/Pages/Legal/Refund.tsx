import type { ReactNode } from "react";
import { Head } from "@inertiajs/react";
import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

export default function Refund() {
  return (
    <>
      <Head title="Refund Policy" />
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight">Refund Policy</h1>
            <p className="mt-2 text-muted-foreground uppercase tracking-widest text-xs font-bold font-mono">Effective Date: April 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black">1. General Policy</h2>
            <p className="text-muted-foreground">
              We offer a 7-day return policy for eligible products. If 7 days have gone by since your purchase, unfortunately, we cannot offer you a refund or exchange.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">2. Eligibility</h2>
            <p className="text-muted-foreground">
              To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">3. Refunds</h2>
            <p className="text-muted-foreground">
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">4. Sale Items</h2>
            <p className="text-muted-foreground">
              Only regular-priced items may be refunded, unfortunately, sale items cannot be refunded.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">5. Exchanges</h2>
            <p className="text-muted-foreground">
              We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at support@futurebd.com.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black">6. Shipping Costs</h2>
            <p className="text-muted-foreground">
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

Refund.layout = (page: ReactNode) => <StorefrontLayout title="Refund">{page}</StorefrontLayout>;
