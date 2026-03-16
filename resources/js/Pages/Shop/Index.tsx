import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { ProductCard, type ProductProps } from "@/components/shared/ProductCard";
import { 
  ChevronRight, 
  SlidersHorizontal,
  X,
  ShoppingBag
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

type FilterProps = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: FilterProps[];
};

export default function ShopIndex({ 
  products, 
  categories, 
  brands 
}: { 
  products: ProductProps[], 
  categories: FilterProps[], 
  brands: FilterProps[] 
}) {
  const { url } = usePage();
  const queryParams = new URLSearchParams(url.split('?')[1]);
  
  const currentCategory = queryParams.get('category') || '';
  const currentBrand = queryParams.get('brand') || '';
  const currentSearch = queryParams.get('search') || '';
  
  const [search, setSearch] = useState(currentSearch);

  const nestedCategories = useMemo(() => {
    const map = new Map<string, FilterProps>();
    categories.forEach(c => map.set(c.id, { ...c, children: [] }));
    const roots: FilterProps[] = [];
    categories.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children!.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    return roots;
  }, [categories]);

  const handleFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(queryParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    router.get('/shop', Object.fromEntries(newParams), {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilter('search', search);
  };

  return (
    <StorefrontLayout title="Shop">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="hidden w-72 shrink-0 space-y-8 lg:block">
          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary/70">Categories</h3>
            <div className="space-y-1">
              <button 
                onClick={() => handleFilter('category', null)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${
                  !currentCategory ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted text-foreground"
                }`}
              >
                All Products
              </button>
              
              <Accordion type="single" collapsible className="mt-2 w-full space-y-1">
                {nestedCategories.map((cat) => (
                  <AccordionItem key={cat.id} value={cat.id} className="border-0">
                    {cat.children && cat.children.length > 0 ? (
                      <>
                        <AccordionTrigger 
                          className={`flex min-h-11 items-center justify-between rounded-xl px-4 py-2 text-sm font-bold hover:no-underline transition-all ${
                            currentCategory === cat.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span onClick={(e) => { e.stopPropagation(); handleFilter('category', cat.id); }}>{cat.name}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pl-4 space-y-1">
                          {cat.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleFilter('category', child.id)}
                              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                currentCategory === child.id ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary"
                              }`}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full ${currentCategory === child.id ? "bg-primary" : "bg-primary/20"}`} />
                              {child.name}
                            </button>
                          ))}
                        </AccordionContent>
                      </>
                    ) : (
                      <button
                        onClick={() => handleFilter('category', cat.id)}
                        className={`flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm font-bold transition-all ${
                          currentCategory === cat.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {cat.name}
                        <ChevronRight className={`h-4 w-4 opacity-50 ${currentCategory === cat.id ? "text-primary" : ""}`} />
                      </button>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div>
             <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-primary/70">Brand Highlights</h3>
             <div className="flex flex-wrap gap-2">
               {brands.slice(0, 15).map(brand => (
                 <button 
                  key={brand.id} 
                  onClick={() => handleFilter('brand', currentBrand === brand.id ? null : brand.id)}
                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    currentBrand === brand.id 
                    ? "border-primary bg-primary text-white shadow-md" 
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                 >
                   {brand.name}
                 </button>
               ))}
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Explore Shop</h1>
              <p className="text-sm text-muted-foreground">{products.length} items available discovered</p>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Input 
                  placeholder="Search in results..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 rounded-xl pl-4 pr-10 focus-visible:ring-primary"
                />
                {search && (
                   <button 
                    type="button"
                    onClick={() => { setSearch(''); handleFilter('search', null); }} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                   >
                     <X className="h-4 w-4" />
                   </button>
                )}
              </div>
              <Button type="submit" variant="default" size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Active Filters */}
          {currentCategory && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Category: {categories.find(c => c.id === currentCategory)?.name}
                <button onClick={() => handleFilter('category', null)}><X className="h-3 w-3" /></button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground/50">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters or search keywords.</p>
              <Button variant="outline" className="mt-6 rounded-xl border-primary text-primary hover:bg-primary/5" onClick={() => router.get('/shop')}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
