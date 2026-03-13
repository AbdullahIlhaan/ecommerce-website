import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob("./Pages/**/*.tsx");
    const page = await pages[`./Pages/${name}.tsx`]();
    return page.default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: "#0f766e",
  },
});
