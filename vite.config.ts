import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_* prefixed) so the server can read them
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react(), tailwindcss()],

    // Expose env vars to the client bundle under import.meta.env.*
    // Only VITE_* vars are safe to expose — secrets stay server-side.
    define: {
      // Legacy process.env shim for any third-party code that uses it
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV || mode),
      // Public vars exposed to the SPA
      "import.meta.env.VITE_PI_APP_ID": JSON.stringify(env.VITE_PI_APP_ID || env.PI_APP_ID || "pirc-sovereign"),
      "import.meta.env.VITE_PI_SANDBOX": JSON.stringify(env.VITE_PI_SANDBOX ?? (mode !== "production" ? "true" : "false")),
      "import.meta.env.VITE_APP_ENV": JSON.stringify(env.VITE_APP_ENV || mode),
      // Gemini key for AI Studio compatibility (AI Studio injects GEMINI_API_KEY without VITE_ prefix)
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        // "@" resolves to project root so "@/src/lib/utils" works
        "@": path.resolve(__dirname, "."),
      },
    },

    server: {
      // Bind to 0.0.0.0 so Replit / Lovable / container previews can reach the server
      host: "0.0.0.0",
      port: parseInt(env.VITE_PORT || env.PORT || "3000", 10),
      // HMR: disabled by AI Studio env var to prevent flicker during agent edits
      hmr: env.DISABLE_HMR !== "true",
      // Allow Lovable and Vercel preview hostnames
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        ".vercel.app",
        ".lovable.app",
        ".lovableproject.com",
        ".replit.dev",
        ".repl.co",
      ],
      proxy: {
        // In dev, proxy /api/* to the Express server running on the same process
        "/api": {
          target: `http://localhost:${parseInt(env.API_PORT || env.PORT || "3000", 10)}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks(id: string) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "vendor";
            if (id.includes("node_modules/react-router")) return "router";
            if (id.includes("node_modules/recharts")) return "charts";
          },
        },
      },
    },

    // Ensure the base path works correctly on Vercel (always root)
    base: "/",
  };
});
