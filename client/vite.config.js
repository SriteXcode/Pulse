// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// })



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    proxy: {
      "/api": "https://pulse-backend-hlp8.onrender.com"
    }
  },
  plugins: [
    react(),tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Agri Crop Portal",
        short_name: "AgriPortal",
        description: "Agricultural Crop Trait Portal",
        theme_color: "#0f5132",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        navigateFallback: "/offline.html",
        runtimeCaching: [
    {
      urlPattern: /^\/api\/crop/,
      handler: "NetworkFirst",
      options: {
        cacheName: "crop-cache"
      }
    }
  ]

      }
    })
  ]
});
