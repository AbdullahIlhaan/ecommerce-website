import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import laravel from "laravel-vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.VITE_HOST || "127.0.0.1";
  const port = Number(env.VITE_PORT || 5173);
  const enablePwa = env.VITE_ENABLE_PWA === "true";

  return {
    server: {
      host,
      port,
      strictPort: false,
      hmr: {
        overlay: false,
        host,
      },
    },
    plugins: [
      laravel({
        input: ["src/index.css", "resources/js/app.tsx"],
        refresh: true,
      }),
      react(),
      ...(enablePwa
        ? [
            VitePWA({
              registerType: "autoUpdate",
              includeAssets: [
                "robots.txt",
                "pwa/apple-touch-icon.png",
                "pwa/maskable-512.png",
              ],
              manifest: {
                name: "FutureBD Dashboard",
                short_name: "FutureBD",
                description: "Responsive ecommerce dashboard and storefront for FutureBD.",
                start_url: "/",
                display: "standalone",
                orientation: "portrait",
                background_color: "#f7f8fb",
                theme_color: "#c32c30",
                icons: [
                  { src: "/pwa/icon-72.png", sizes: "72x72", type: "image/png" },
                  { src: "/pwa/icon-96.png", sizes: "96x96", type: "image/png" },
                  { src: "/pwa/icon-128.png", sizes: "128x128", type: "image/png" },
                  { src: "/pwa/icon-144.png", sizes: "144x144", type: "image/png" },
                  { src: "/pwa/icon-152.png", sizes: "152x152", type: "image/png" },
                  { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
                  { src: "/pwa/icon-384.png", sizes: "384x384", type: "image/png" },
                  { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
                  { src: "/pwa/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
                  { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ],
              },
              workbox: {
                navigateFallback: "/offline.html",
                globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}"],
                runtimeCaching: [
                  {
                    urlPattern: ({ request }) =>
                      ["style", "script", "worker", "font", "image"].includes(request.destination),
                    handler: "CacheFirst",
                    options: {
                      cacheName: "static-assets",
                      expiration: {
                        maxEntries: 120,
                        maxAgeSeconds: 60 * 60 * 24 * 30,
                      },
                    },
                  },
                  {
                    urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
                    handler: "NetworkFirst",
                    options: {
                      cacheName: "api-cache",
                      networkTimeoutSeconds: 5,
                      expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24,
                      },
                    },
                  },
                ],
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@resources": path.resolve(__dirname, "./resources/js"),
      },
    },
  };
});
