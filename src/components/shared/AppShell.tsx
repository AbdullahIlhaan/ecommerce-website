import type { ComponentType } from "react";
import { useEffect } from "react";

import { InstallPrompt } from "@/components/shared/InstallPrompt";

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
      <App {...props} />
      <InstallPrompt />
      <Toaster />
    </CartProvider>
  );
}
