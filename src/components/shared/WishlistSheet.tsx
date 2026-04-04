import { Link } from "@inertiajs/react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useLocalization } from "@/hooks/use-localization";
import { resolveEffectivePrice } from "@/lib/pricing";

export function WishlistSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { items, itemCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t } = useLocalization();
  const handleAddToCart = (item: (typeof items)[number]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      salePrice: item.salePrice,
      image: item.image,
      stock: item.stock,
    });
    removeFromWishlist(item.id, { silent: true });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4 sm:px-6">
          <SheetTitle className="flex items-center gap-3 text-xl font-black sm:text-2xl">
            <Heart className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            {t("wishlist.title", "Your Wishlist")}
            {itemCount > 0 && (
              <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary sm:text-xs">
                {itemCount} {itemCount === 1 ? t("wishlist.item", "item") : t("wishlist.items", "items")}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 pr-6 text-center">
            <div className="rounded-full bg-muted p-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t("wishlist.empty_title", "Your wishlist is empty")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("wishlist.empty_description", "Save products you love and come back to them anytime.")}
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="rounded-full px-8">
              {t("wishlist.start_browsing", "Start Browsing")}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-6 px-6 pb-20">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={() => onOpenChange(false)}
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted/30"
                    >
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          onClick={() => onOpenChange(false)}
                          className="line-clamp-1 text-xs font-bold text-foreground hover:text-primary sm:text-base"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs font-black text-primary sm:text-sm">
                          BDT {resolveEffectivePrice(item.price, item.salePrice).toLocaleString()}
                        </p>
                        {item.stock <= 0 && (
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-destructive">
                            {t("search.out_of_stock", "Out of stock")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          disabled={item.stock <= 0}
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("wishlist.add_to_cart", "Add to Cart")}
                        </Button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-muted-foreground transition hover:text-destructive"
                          aria-label={t("wishlist.remove", "Remove from wishlist")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="absolute bottom-0 left-0 w-full border-t border-border bg-background/80 p-4 backdrop-blur-lg sm:p-6">
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:bg-transparent hover:text-primary"
                onClick={() => onOpenChange(false)}
              >
                {t("wishlist.continue_shopping", "Continue Shopping")}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
