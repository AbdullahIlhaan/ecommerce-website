import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { usePage, Link } from "@inertiajs/react";
import { useMemo } from "react";
import { ChevronRight, Grid2X2, ArrowRight } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
};

export default function CategoriesIndex() {
  const { categories } = usePage<{ categories: Category[] }>().props;
  
  const nestedCategories = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, { ...c, children: [] }));
    const roots: Category[] = [];
    categories.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children!.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    return roots;
  }, [categories]);

  return (
    <StorefrontLayout title="All Categories">
      <div className="mb-10 space-y-4">
        <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Grid2X2 className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tight">Browse Categories</h1>
                <p className="text-muted-foreground">Find products from our organized collections</p>
            </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {nestedCategories.map((category) => (
          <div key={category.id} className="group overflow-hidden rounded-[2rem] border border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]">
            <div className="p-6">
              <Link 
                href={`/shop?category=${category.id}`}
                className="flex items-center justify-between group-hover:text-primary transition-colors"
              >
                <h2 className="text-2xl font-black tracking-tight">{category.name}</h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary group-hover:text-white">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
              
              <div className="mt-6 space-y-2">
                {category.children && category.children.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/shop?category=${child.id}`}
                          className="rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm font-bold text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground italic">No sub-categories</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-border bg-muted/10 px-6 py-4">
                 <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quick View</span>
                 <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
      
      {nestedCategories.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-10">
                <Grid2X2 className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-2xl font-bold">No Categories Found</h3>
            <p className="mt-2 text-muted-foreground">Check back later for browsing.</p>
         </div>
      )}
    </StorefrontLayout>
  );
}
