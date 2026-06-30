// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "icons/file_000000007df071f490e699e36cce0d66.png",
          "icons/image_1782650717547.jpeg",
        ],
        manifest: {
          id: "/academy/",
          name: "VSM Ambassador Academy",
          short_name: "VSM Academy",
          description:
            "Formation, communauté et opportunités pour les ambassadeurs officiels VSM Collection.",
          theme_color: "#0a0a0a",
          background_color: "#0a0a0a",
          display: "standalone",
          orientation: "portrait-primary",
          scope: "/",
          start_url: "/dashboard",
          lang: "fr",
          categories: ["education", "social"],
          icons: [
            {
              src: "/icons/image_1782650717547.jpeg",
              sizes: "512x512",
              type: "image/jpeg",
              purpose: "any",
            },
            {
              src: "/icons/image_1782650717547.jpeg",
              sizes: "512x512",
              type: "image/jpeg",
              purpose: "maskable",
            },
            {
              src: "/icons/image_1782650717547.jpeg",
              sizes: "192x192",
              type: "image/jpeg",
              purpose: "any",
            },
          ],
        },
        workbox: {
          importScripts: ["/push-sw.js"],
          globPatterns: ["**/*.{js,css,html,ico,svg,png,jpg,jpeg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-api",
                expiration: { maxEntries: 64, maxAgeSeconds: 300 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: { cacheName: "google-fonts-stylesheets" },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  },
});
