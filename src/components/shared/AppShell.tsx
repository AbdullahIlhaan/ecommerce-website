import type { ComponentType } from "react";
import { useEffect } from "react";

import { InstallPrompt } from "@/components/shared/InstallPrompt";
import { WishlistProvider } from "@/context/wishlist-context";

type AppShellProps = {
  App: ComponentType<object>;
  props: object;
};

import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ App, props }: AppShellProps) {
  useEffect(() => {
    document.body.classList.add("app-shell");
    return () => document.body.classList.remove("app-shell");
  }, []);

  return (
    <CartProvider>
      <WishlistProvider>
        <App {...props} />
        <InstallPrompt />
        <Toaster />
      </WishlistProvider>
    </CartProvider>
  );
}
