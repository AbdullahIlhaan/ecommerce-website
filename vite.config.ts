import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import laravel from "laravel-vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.VITE_HOST || "127.0.0.1";
  const port = Number(env.VITE_PORT || 5173);

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
  };
});
