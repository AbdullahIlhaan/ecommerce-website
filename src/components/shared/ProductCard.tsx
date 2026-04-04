import { Link } from "@inertiajs/react";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/hooks/use-localization";
import { hasActiveSalePrice, resolveEffectivePrice } from "@/lib/pricing";

export type ProductProps = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  stock: number;
};

export function ProductCard({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { t } = useLocalization();
  const hasDiscount = hasActiveSalePrice(product.price, product.salePrice);
  const displayPrice = resolveEffectivePrice(product.price, product.salePrice);
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || "/images/placeholder-product.png",
      stock: product.stock
    });
    if (inWishlist) {
      removeFromWishlist(product.id, { silent: true });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || "/images/placeholder-product.png",
      stock: product.stock,
    });
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.images[0] || "/images/placeholder-product.png"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {hasDiscount && (
          <div className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "absolute right-3 top-3 z-10 h-9 w-9 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95",
            inWishlist && "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? t("wishlist.remove", "Remove from wishlist") : t("wishlist.add", "Add to wishlist")}
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
        </Button>

        {/* Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Link href={`/products/${product.id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-110 active:scale-95">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/products/${product.id}`} className="mb-1 block">
          <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-foreground transition-colors hover:text-primary sm:text-base">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex flex-wrap items-baseline gap-1 sm:gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-primary sm:text-lg">
                BDT {displayPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground line-through opacity-60 sm:text-sm">
                BDT {product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold text-foreground sm:text-lg">
              BDT {displayPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.stock <= 0 && (
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-destructive">
            {t("search.out_of_stock", "Out of stock")}
          </p>
        )}
      </div>
    </article>
  );
}
