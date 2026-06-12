import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'navbarLogo.png', 'icon-192x192.png', 'icon-512x512.png'],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Kairos',
        short_name: 'Kairos',
        description: 'Sistema de gestion de turnos',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7300',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
