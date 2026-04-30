import type { ReactNode } from "react";
import { Head, Link, usePage } from "@inertiajs/react";

import { StorefrontLayout } from "@/components/layout/StorefrontLayout";

type ContentPageRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  isActive: boolean;
  updatedAt: string | null;
  updatedAtLabel: string | null;
};

function ContentPageShow() {
  const { contentPage } = usePage<{ contentPage: ContentPageRecord }>().props;
  const bodyBlocks = contentPage.body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return (
    <>
      <Head title={contentPage.title} />

      <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4 text-center">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-primary/70">Information Page</div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">{contentPage.title}</h1>
          {contentPage.summary && (
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {contentPage.summary}
            </p>
          )}
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Updated {contentPage.updatedAtLabel || "Recently"}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm sm:p-10">
          <div className="space-y-5 text-sm leading-7 text-muted-foreground sm:text-base">
            {bodyBlocks.map((block) => (
              <p key={block} className="whitespace-pre-line">
                {block}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Need more help? Visit the <Link href="/support-center" className="font-semibold text-primary hover:underline">Support Center</Link>.
        </div>
      </div>
    </>
  );
}

ContentPageShow.layout = (page: ReactNode) => <StorefrontLayout>{page}</StorefrontLayout>;

export default ContentPageShow;
