import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

import { AppShell } from "@/components/shared/AppShell";
import { applyTheme, resolveTheme } from "@/lib/theme";

if (typeof window !== "undefined") {
  applyTheme(resolveTheme());

  if (import.meta.env.VITE_ENABLE_PWA === "true") {
    const pwaRegisterModule = "virtual:pwa-register";

    import(/* @vite-ignore */ pwaRegisterModule).then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onOfflineReady() {
          window.dispatchEvent(new CustomEvent("pwa:offline-ready"));
        },
      });
    });
  }
}

createInertiaApp({
  title: (title) => (title ? `${title} | Future-BD` : "Future-BD"),
  resolve: async (name) => {
    const pages = import.meta.glob("./Pages/**/*.tsx");
    const page = await pages[`./Pages/${name}.tsx`]();
    return page.default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<AppShell App={App} props={props as object} />);
  },
  progress: {
    color: "#0f766e",
  },
});
