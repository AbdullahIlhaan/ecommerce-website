import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { resolveEffectivePrice } from "@/lib/pricing";

export function CartSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { items, removeFromCart, updateQuantity, subtotal, itemCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-4 sm:px-6">
          <SheetTitle className="flex items-center gap-3 text-xl font-black sm:text-2xl">
            <ShoppingBag className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            Your Bag
            {itemCount > 0 && (
              <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary sm:text-xs">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 pr-6 text-center">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your bag is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Looks like you haven't added anything to your bag yet.
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="rounded-full px-8">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-6 px-6 pb-20">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted/30">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <h4 className="line-clamp-1 text-xs font-bold text-foreground sm:text-base">
                          {item.name}
                        </h4>
                        <p className="mt-1 text-xs font-black text-primary sm:text-sm">
                          BDT {resolveEffectivePrice(item.price, item.salePrice).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-xl border border-border p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground transition hover:text-destructive"
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
              <div className="w-full space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-base font-black sm:text-lg">
                  <span>Subtotal</span>
                  <span>BDT {subtotal.toLocaleString()}</span>
                </div>
                <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                <Link href="/checkout" onClick={() => onOpenChange(false)}>
                  <Button className="h-12 w-full rounded-2xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 hover:bg-brand-hover active:scale-95 transition-all">
                    Checkout Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full text-sm text-muted-foreground hover:bg-transparent hover:text-primary"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
