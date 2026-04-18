import { StorefrontLayout } from "@/components/layout/StorefrontLayout";
import { ProductCard, type ProductProps } from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RefreshCcw 
} from "lucide-react";
import { useState } from "react";
import { Link } from "@inertiajs/react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { hasActiveSalePrice, resolveEffectivePrice } from "@/lib/pricing";

type ProductDetail = ProductProps & {
  description: string;
  sku: string;
  category: { name: string; id: string } | null;
  brand: { name: string; id: string } | null;
};

export default function ProductShow({ product, relatedProducts }: { product: ProductDetail, relatedProducts: ProductProps[] }) {
  const { addToCart } = useCart();
  const { isInWishlist, removeFromWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(product.images[0] || "/images/placeholder-product.png");
  const [quantity, setQuantity] = useState(1);

  const hasDiscount = hasActiveSalePrice(product.price, product.salePrice);
  const displayPrice = resolveEffectivePrice(product.price, product.salePrice);
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || "/images/placeholder-product.png",
      stock: product.stock
    }, quantity);
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id, { silent: true });
    }
  };

  return (
    <StorefrontLayout title={product.name}>
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/shop?category=${product.category.id}`} className="hover:text-primary transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="truncate text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <img 
              src={selectedImage} 
              alt={product.name} 
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" 
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img ? "border-primary shadow-md" : "border-transparent hover:border-primary/40"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-6 space-y-2">
            {product.brand && (
              <span className="text-xs font-bold uppercase tracking-widest text-[#a12863]">
                {product.brand.name}
              </span>
            )}
            <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>SKU: <span className="text-foreground font-mono">{product.sku}</span></span>
              <span>•</span>
              <span className={product.stock > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                {product.stock > 0 ? `In Stock (Qty: ${product.stock})` : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="mb-8 flex items-baseline gap-4 rounded-2xl bg-muted/30 p-6 border border-border/50">
            {hasDiscount ? (
              <>
                <span className="text-4xl font-black text-primary">BDT {displayPrice.toLocaleString()}</span>
                <span className="text-xl text-muted-foreground line-through opacity-60">BDT {product.price.toLocaleString()}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">-{discountPercentage}%</span>
              </>
            ) : (
              <span className="text-4xl font-black text-foreground">BDT {displayPrice.toLocaleString()}</span>
            )}
          </div>

          <div className="mb-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 items-center rounded-2xl border border-border bg-card">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-full w-12 items-center justify-center text-xl transition hover:bg-muted"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  min={1}
                  max={Math.max(1, product.stock)}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10) || 1;
                    setQuantity(Math.min(Math.max(1, next), Math.max(1, product.stock)));
                  }}
                  className="w-16 border-0 bg-transparent text-center font-bold focus:ring-0" 
                />
                <button 
                  onClick={() => setQuantity(Math.min(Math.max(1, product.stock), quantity + 1))}
                  className="flex h-full w-12 items-center justify-center text-xl transition hover:bg-muted"
                >
                  +
                </button>
              </div>
              <Button 
                size="lg" 
                className="h-12 flex-1 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-brand-hover active:scale-95 transition-all"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="icon" variant="outline" className="h-12 w-12 rounded-2xl border-border hover:bg-muted active:scale-95 transition-all">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Secure Payment</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <RefreshCcw className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Easy Returns</span>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-8">
             <h3 className="mb-4 text-lg font-bold">About this product</h3>
             <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
               {product.description || "No description available for this product."}
             </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Related Products</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
}
