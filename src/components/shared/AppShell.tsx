import type { ComponentType } from "react";
import { useEffect } from "react";

import { InstallPrompt } from "@/components/shared/InstallPrompt";
import { WishlistProvider } from "@/context/wishlist-context";

type AppShellProps = {
  App: ComponentType<object>;
  props: {
    initialPage?: {
      props?: {
        footerSetting?: {
          logoPath?: string | null;
        };
      };
    };
  };
};

import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ App, props }: AppShellProps) {
  const faviconHref = props.initialPage?.props?.footerSetting?.logoPath || "/images/logofbd.jpeg";

  useEffect(() => {
    document.body.classList.add("app-shell");
    return () => document.body.classList.remove("app-shell");
  }, []);

  useEffect(() => {
    const updateLink = (rel: string) => {
      let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }

      link.href = faviconHref;
    };

    updateLink("icon");
    updateLink("shortcut icon");
    updateLink("apple-touch-icon");
  }, [faviconHref]);

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
