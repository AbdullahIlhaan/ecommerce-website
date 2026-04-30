import { Link, router } from "@inertiajs/react";
import { ShoppingCart, Heart, Zap } from "lucide-react";
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
  const { addToCart, buyNow } = useCart();
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
    buyNow({
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

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] || "/images/placeholder-product.png",
      stock: product.stock,
    }, 1);

    if (inWishlist) {
      removeFromWishlist(product.id, { silent: true });
    }

    router.get("/checkout");
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
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={product.images[0] || "/images/placeholder-product.png"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        
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

        {product.stock > 0 ? (
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-success">
            Qty Available: {product.stock}
          </p>
        ) : (
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-destructive">
            {t("search.out_of_stock", "Out of stock")}
          </p>
        )}

        <div className="mt-4 flex items-stretch gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-2xl border-border bg-background text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 disabled:border-border/60 disabled:bg-muted/40 disabled:text-muted-foreground"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            aria-label={t("wishlist.add_to_cart", "Add to Cart")}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            className="h-11 min-w-0 flex-1 rounded-2xl bg-gradient-to-r from-primary via-primary to-[#b91c1c] px-4 text-xs font-black tracking-[0.02em] text-primary-foreground shadow-[0_14px_32px_-14px_rgba(220,38,38,0.75)] transition-all hover:brightness-95 active:scale-95 sm:text-sm"
            onClick={handleOrderNow}
            disabled={product.stock <= 0}
          >
            <Zap className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{t("common.order_now", "Order Now")}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
