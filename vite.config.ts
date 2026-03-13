import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import laravel from "laravel-vite-plugin";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@resources": path.resolve(__dirname, "./resources/js"),
    },
  },
}));
